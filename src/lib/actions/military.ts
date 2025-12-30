'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { militarySchema, type MilitaryFormData } from '@/lib/utils/validators'
import type { MilitaryPersonnelInsert, MilitaryPersonnelUpdate } from '@/types/database'

// Response type for actions
type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create new military personnel
 * If citizen_id is not provided, automatically creates a linked citizen record
 */
export async function createMilitary(
  formData: MilitaryFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate form data
    const validatedData = militarySchema.parse(formData)

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    let citizenId = validatedData.citizen_id || null

    // If no citizen_id provided, create a new citizen first
    if (!citizenId) {
      const { data: newCitizen, error: citizenError } = await supabase
        .from('citizens')
        .insert({
          surname: validatedData.surname,
          first_name: validatedData.first_name,
          father_name: validatedData.father_name || null,
          mobile: validatedData.mobile || null,
          email: validatedData.email || null,
          contact_category: 'MILITARY',
          notes: `Δημιουργήθηκε αυτόματα από εγγραφή στρατιωτικού προσωπικού`,
        })
        .select('id')
        .single()

      if (citizenError) {
        console.error('Error creating citizen:', citizenError)
        return { success: false, error: 'Σφάλμα κατά τη δημιουργία πολίτη: ' + citizenError.message }
      }

      citizenId = newCitizen.id
    }

    // Prepare insert data
    const insertData: MilitaryPersonnelInsert = {
      citizen_id: citizenId,
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
      notes: validatedData.notes || null,
      assigned_user_id: validatedData.assigned_user_id || null,
      created_by: user.id,
    }

    const { data, error } = await supabase
      .from('military_personnel')
      .insert(insertData)
      .select('id, citizen_id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/military')
    revalidatePath('/dashboard/citizens')
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Create military error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά τη δημιουργία στρατιωτικού προσωπικού' }
  }
}

/**
 * Update military personnel
 */
export async function updateMilitary(
  id: string,
  formData: Partial<MilitaryFormData>
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Prepare update data
    const updateData: MilitaryPersonnelUpdate = {}

    // Basic fields
    if (formData.military_type !== undefined) updateData.military_type = formData.military_type
    if (formData.surname !== undefined) updateData.surname = formData.surname
    if (formData.first_name !== undefined) updateData.first_name = formData.first_name
    if (formData.father_name !== undefined) updateData.father_name = formData.father_name
    if (formData.mobile !== undefined) updateData.mobile = formData.mobile
    if (formData.email !== undefined) updateData.email = formData.email

    // Conscript fields
    if (formData.esso_year !== undefined) updateData.esso_year = formData.esso_year
    if (formData.esso_letter !== undefined) updateData.esso_letter = formData.esso_letter
    if (formData.military_number !== undefined) updateData.military_number = formData.military_number
    if (formData.conscript_wish !== undefined) updateData.conscript_wish = formData.conscript_wish
    if (formData.training_center !== undefined) updateData.training_center = formData.training_center
    if (formData.presentation_date !== undefined) updateData.presentation_date = formData.presentation_date
    if (formData.assignment !== undefined) updateData.assignment = formData.assignment
    if (formData.assignment_date !== undefined) updateData.assignment_date = formData.assignment_date
    if (formData.transfer !== undefined) updateData.transfer = formData.transfer
    if (formData.transfer_date !== undefined) updateData.transfer_date = formData.transfer_date

    // Permanent fields
    if (formData.rank !== undefined) updateData.rank = formData.rank
    if (formData.service_unit !== undefined) updateData.service_unit = formData.service_unit
    if (formData.permanent_wish !== undefined) updateData.permanent_wish = formData.permanent_wish
    if (formData.service_number !== undefined) updateData.service_number = formData.service_number

    // Common
    if (formData.notes !== undefined) updateData.notes = formData.notes
    if (formData.assigned_user_id !== undefined) updateData.assigned_user_id = formData.assigned_user_id

    const { error } = await supabase
      .from('military_personnel')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/military')
    revalidatePath(`/dashboard/military/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Update military error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά την ενημέρωση στρατιωτικού προσωπικού' }
  }
}

/**
 * Delete military personnel
 * Also deletes the linked citizen if it was auto-created (contact_category = 'MILITARY')
 */
export async function deleteMilitary(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // First, get the military record to find the linked citizen
    const { data: military } = await supabase
      .from('military_personnel')
      .select('citizen_id')
      .eq('id', id)
      .single()

    // Delete the military record
    const { error } = await supabase
      .from('military_personnel')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    // If there's a linked citizen with category 'MILITARY', delete them too
    if (military?.citizen_id) {
      const { data: citizen } = await supabase
        .from('citizens')
        .select('id, contact_category')
        .eq('id', military.citizen_id)
        .single()

      // Only delete if the citizen was auto-created for military
      if (citizen?.contact_category === 'MILITARY') {
        await supabase
          .from('citizens')
          .delete()
          .eq('id', military.citizen_id)
      }
    }

    revalidatePath('/dashboard/military')
    revalidatePath('/dashboard/citizens')
    return { success: true }
  } catch (error) {
    console.error('Delete military error:', error)
    return { success: false, error: 'Σφάλμα κατά τη διαγραφή στρατιωτικού προσωπικού' }
  }
}

/**
 * Get a single military personnel by ID
 */
export async function getMilitary(id: string) {
  try {
    const supabase = await createClient()

    // Get military data
    const { data: military, error: militaryError } = await supabase
      .from('military_personnel')
      .select('*')
      .eq('id', id)
      .single()

    if (militaryError) {
      console.error('Supabase error:', militaryError)
      return null
    }

    // Get citizen data if exists
    let citizen = null
    if (military.citizen_id) {
      const { data: citizenData } = await supabase
        .from('citizens')
        .select('id, surname, first_name, mobile, email, address, municipality')
        .eq('id', military.citizen_id)
        .single()
      citizen = citizenData
    }

    // Get assigned user if exists
    let assigned_user = null
    if (military.assigned_user_id) {
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('id', military.assigned_user_id)
        .single()
      assigned_user = userData
    }

    return {
      ...military,
      citizen,
      assigned_user,
    }
  } catch (error) {
    console.error('Get military error:', error)
    return null
  }
}

/**
 * Get military personnel for a specific citizen
 */
export async function getCitizenMilitary(citizenId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('military_personnel')
      .select('*')
      .eq('citizen_id', citizenId)
      .single()

    if (error) {
      // No military record is not an error
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Supabase error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Get citizen military error:', error)
    return null
  }
}
