'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requestSchema, type RequestFormData } from '@/lib/utils/validators'
import type { RequestInsert, RequestUpdate } from '@/types/database'

// Response type for actions
type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new request
 */
export async function createRequest(
  formData: RequestFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate form data
    const validatedData = requestSchema.parse(formData)

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Prepare insert data
    const insertData: RequestInsert = {
      citizen_id: validatedData.citizen_id,
      category: validatedData.category,
      status: validatedData.status || 'PENDING',
      request_text: validatedData.request_text || null,
      notes: validatedData.notes || null,
      submitted_at: validatedData.submitted_at || new Date().toISOString().split('T')[0],
      completed_at: validatedData.completed_at || null,
      created_by: user.id,
    }

    const { data, error } = await supabase
      .from('requests')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/requests')
    revalidatePath(`/dashboard/citizens/${validatedData.citizen_id}`)
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Create request error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά τη δημιουργία αιτήματος' }
  }
}

/**
 * Update an existing request
 */
export async function updateRequest(
  id: string,
  formData: Partial<RequestFormData>
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Prepare update data
    const updateData: RequestUpdate = {}

    if (formData.category !== undefined) updateData.category = formData.category
    if (formData.status !== undefined) updateData.status = formData.status
    if (formData.request_text !== undefined) updateData.request_text = formData.request_text
    if (formData.notes !== undefined) updateData.notes = formData.notes
    if (formData.submitted_at !== undefined) updateData.submitted_at = formData.submitted_at
    if (formData.completed_at !== undefined) updateData.completed_at = formData.completed_at

    const { error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/requests')
    revalidatePath(`/dashboard/requests/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Update request error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά την ενημέρωση αιτήματος' }
  }
}

/**
 * Change request status
 */
export async function changeRequestStatus(
  id: string,
  status: 'PENDING' | 'COMPLETED' | 'NOT_COMPLETED'
): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Prepare update data - completion date is auto-set by trigger when status = COMPLETED
    const updateData: RequestUpdate = {
      status,
    }

    // If changing to COMPLETED and no completion date, the trigger will set it
    // If changing away from COMPLETED, clear completion date
    if (status !== 'COMPLETED') {
      updateData.completed_at = null
    }

    const { error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/requests')
    revalidatePath(`/dashboard/requests/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Change request status error:', error)
    return { success: false, error: 'Σφάλμα κατά την αλλαγή κατάστασης' }
  }
}

/**
 * Delete a request
 */
export async function deleteRequest(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Get request to find citizen_id for revalidation
    const { data: request } = await supabase
      .from('requests')
      .select('citizen_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/requests')
    if (request?.citizen_id) {
      revalidatePath(`/dashboard/citizens/${request.citizen_id}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Delete request error:', error)
    return { success: false, error: 'Σφάλμα κατά τη διαγραφή αιτήματος' }
  }
}

/**
 * Get a single request by ID
 */
export async function getRequest(id: string) {
  try {
    const supabase = await createClient()

    // Get request data
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', id)
      .single()

    if (requestError) {
      console.error('Supabase error:', requestError)
      return null
    }

    // Get citizen data if exists
    let citizen = null
    if (request.citizen_id) {
      const { data: citizenData } = await supabase
        .from('citizens')
        .select('id, surname, first_name, mobile, email')
        .eq('id', request.citizen_id)
        .single()
      citizen = citizenData
    }

    return {
      ...request,
      citizen,
    }
  } catch (error) {
    console.error('Get request error:', error)
    return null
  }
}

/**
 * Get requests for a specific citizen
 */
export async function getCitizenRequests(citizenId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('citizen_id', citizenId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Get citizen requests error:', error)
    return []
  }
}
