'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { citizenSchema, citizenWithMilitarySchema, type CitizenFormData, type CitizenWithMilitaryFormData } from '@/lib/utils/validators'
import type { CitizenInsert, CitizenUpdate, MilitaryPersonnelInsert } from '@/types/database'

// Response type for actions
type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new citizen
 */
export async function createCitizen(
  formData: CitizenFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate form data
    const validatedData = citizenSchema.parse(formData)

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Prepare insert data
    const insertData: CitizenInsert = {
      surname: validatedData.surname,
      first_name: validatedData.first_name,
      father_name: validatedData.father_name || null,
      referral_source: validatedData.referral_source || null,
      mobile: validatedData.mobile || null,
      landline: validatedData.landline || null,
      email: validatedData.email || null,
      address: validatedData.address || null,
      postal_code: validatedData.postal_code || null,
      area: validatedData.area || null,
      municipality: validatedData.municipality || null,
      electoral_district: validatedData.electoral_district || null,
      contact_category: validatedData.contact_category || 'GDPR',
      profession: validatedData.profession || null,
      assigned_user_id: validatedData.assigned_user_id || null,
      notes: validatedData.notes || null,
      is_active: true,
    }

    const { data, error } = await supabase
      .from('citizens')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/citizens')
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Create citizen error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά τη δημιουργία πολίτη' }
  }
}

/**
 * Create a new citizen with optional military data
 * If contact_category is MILITARY and military_type is provided, also creates military personnel record
 */
export async function createCitizenWithMilitary(
  formData: CitizenWithMilitaryFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate form data
    const validatedData = citizenWithMilitarySchema.parse(formData)

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // If military category, validate mobile or email exists (military requires it)
    if (validatedData.contact_category === 'MILITARY' && validatedData.military_type) {
      if (!validatedData.mobile && !validatedData.email) {
        return {
          success: false,
          error: 'Για στρατιωτικό απαιτείται κινητό ή email (όχι μόνο σταθερό)'
        }
      }
    }

    // Prepare citizen insert data
    const citizenData: CitizenInsert = {
      surname: validatedData.surname,
      first_name: validatedData.first_name,
      father_name: validatedData.father_name || null,
      referral_source: validatedData.referral_source || null,
      mobile: validatedData.mobile || null,
      landline: validatedData.landline || null,
      email: validatedData.email || null,
      address: validatedData.address || null,
      postal_code: validatedData.postal_code || null,
      area: validatedData.area || null,
      municipality: validatedData.municipality || null,
      electoral_district: validatedData.electoral_district || null,
      contact_category: validatedData.contact_category || 'GDPR',
      profession: validatedData.profession || null,
      assigned_user_id: validatedData.assigned_user_id || null,
      notes: validatedData.notes || null,
      is_active: true,
    }

    // Create citizen
    const { data: citizen, error: citizenError } = await supabase
      .from('citizens')
      .insert(citizenData)
      .select('id')
      .single()

    if (citizenError) {
      console.error('Supabase error creating citizen:', citizenError)
      return { success: false, error: citizenError.message }
    }

    // If this is a military category and military_type is provided, create military record
    console.log('Creating citizen - category:', validatedData.contact_category, 'military_type:', validatedData.military_type)
    if (validatedData.contact_category === 'MILITARY' && validatedData.military_type) {
      console.log('Creating military record for citizen:', citizen.id)
      const militaryData: MilitaryPersonnelInsert = {
        citizen_id: citizen.id,
        military_type: validatedData.military_type,
        surname: validatedData.surname,
        first_name: validatedData.first_name,
        father_name: validatedData.father_name || null,
        mobile: validatedData.mobile || null,
        email: validatedData.email || null,
        // Conscript fields
        esso_year: validatedData.esso_year || null,
        esso_letter: validatedData.esso_letter || null,
        military_number: validatedData.military_number || null,
        conscript_wish: validatedData.conscript_wish || null,
        training_center: validatedData.training_center || null,
        presentation_date: validatedData.presentation_date || null,
        assignment: validatedData.assignment || null,
        assignment_date: validatedData.assignment_date || null,
        transfer: validatedData.transfer || null,
        transfer_date: validatedData.transfer_date || null,
        // Permanent fields
        rank: validatedData.rank || null,
        service_unit: validatedData.service_unit || null,
        permanent_wish: validatedData.permanent_wish || null,
        service_number: validatedData.service_number || null,
        // Common
        notes: validatedData.military_notes || null,
        created_by: user.id,
      }

      const { data: militaryRecord, error: militaryError } = await supabase
        .from('military_personnel')
        .insert(militaryData)
        .select('id')
        .single()

      if (militaryError) {
        console.error('Supabase error creating military:', militaryError)
        // Return error so user knows military wasn't created
        return {
          success: false,
          error: 'Ο πολίτης δημιουργήθηκε αλλά υπήρξε σφάλμα στη δημιουργία στρατιωτικού: ' + militaryError.message
        }
      }

      console.log('Military record created:', militaryRecord?.id)
      revalidatePath('/dashboard/military')
    }

    revalidatePath('/dashboard/citizens')
    return { success: true, data: { id: citizen.id } }
  } catch (error) {
    console.error('Create citizen with military error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά τη δημιουργία πολίτη' }
  }
}

/**
 * Update an existing citizen
 */
export async function updateCitizen(
  id: string,
  formData: CitizenFormData | CitizenWithMilitaryFormData
): Promise<ActionResponse> {
  try {
    // Validate form data
    const validatedData = citizenSchema.parse(formData)

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Prepare update data
    const updateData: CitizenUpdate = {
      surname: validatedData.surname,
      first_name: validatedData.first_name,
      father_name: validatedData.father_name || null,
      referral_source: validatedData.referral_source || null,
      mobile: validatedData.mobile || null,
      landline: validatedData.landline || null,
      email: validatedData.email || null,
      address: validatedData.address || null,
      postal_code: validatedData.postal_code || null,
      area: validatedData.area || null,
      municipality: validatedData.municipality || null,
      electoral_district: validatedData.electoral_district || null,
      contact_category: validatedData.contact_category || 'GDPR',
      profession: validatedData.profession || null,
      assigned_user_id: validatedData.assigned_user_id || null,
      notes: validatedData.notes || null,
    }

    const { error } = await supabase
      .from('citizens')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/citizens')
    revalidatePath(`/dashboard/citizens/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Update citizen error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά την ενημέρωση πολίτη' }
  }
}

/**
 * Soft delete (archive) a citizen
 */
export async function archiveCitizen(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    const { error } = await supabase
      .from('citizens')
      .update({
        is_active: false,
        archived_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    // Don't call revalidatePath here - it causes the detail page to re-fetch
    // before the redirect completes. The list uses real-time subscriptions.
    return { success: true }
  } catch (error) {
    console.error('Archive citizen error:', error)
    return { success: false, error: 'Σφάλμα κατά την αρχειοθέτηση πολίτη' }
  }
}

/**
 * Permanently delete a citizen (admin only)
 */
export async function deleteCitizen(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    const { error } = await supabase
      .from('citizens')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    // Don't call revalidatePath here - it causes the detail page to re-fetch
    // before the redirect completes. The list uses real-time subscriptions.
    return { success: true }
  } catch (error) {
    console.error('Delete citizen error:', error)
    return { success: false, error: 'Σφάλμα κατά τη διαγραφή πολίτη' }
  }
}

/**
 * Restore an archived citizen
 */
export async function restoreCitizen(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    const { error } = await supabase
      .from('citizens')
      .update({
        is_active: true,
        archived_at: null,
      })
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/citizens')
    return { success: true }
  } catch (error) {
    console.error('Restore citizen error:', error)
    return { success: false, error: 'Σφάλμα κατά την επαναφορά πολίτη' }
  }
}

/**
 * Get a single citizen by ID
 */
export async function getCitizen(id: string) {
  try {
    const supabase = await createClient()

    // Get citizen data
    const { data: citizen, error: citizenError } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', id)
      .single()

    if (citizenError) {
      console.error('Supabase error:', citizenError)
      return null
    }

    // Get related requests
    const { data: requests } = await supabase
      .from('requests')
      .select('*')
      .eq('citizen_id', id)
      .order('submitted_at', { ascending: false })

    // Get related communications
    const { data: communications } = await supabase
      .from('communications')
      .select('*')
      .eq('citizen_id', id)
      .order('communication_date', { ascending: false })

    // Get assigned user if exists
    let assigned_user = null
    if (citizen.assigned_user_id) {
      const { data: user } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('id', citizen.assigned_user_id)
        .single()
      assigned_user = user
    }

    return {
      ...citizen,
      requests: requests || [],
      communications: communications || [],
      assigned_user,
    }
  } catch (error) {
    console.error('Get citizen error:', error)
    return null
  }
}
