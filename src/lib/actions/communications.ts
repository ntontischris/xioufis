'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { communicationSchema, type CommunicationFormData } from '@/lib/utils/validators'
import type { CommunicationInsert } from '@/types/database'

// Response type for actions
type ActionResponse<T = null> = {
  success: boolean
  data?: T
  error?: string
}

/**
 * Create a new communication
 */
export async function createCommunication(
  formData: CommunicationFormData
): Promise<ActionResponse<{ id: string }>> {
  try {
    // Validate form data
    const validatedData = communicationSchema.parse(formData)

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Prepare insert data
    const insertData: CommunicationInsert = {
      citizen_id: validatedData.citizen_id,
      communication_date: validatedData.communication_date,
      comm_type: validatedData.comm_type,
      notes: validatedData.notes || null,
      created_by: user.id,
    }

    const { data, error } = await supabase
      .from('communications')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/communications')
    revalidatePath(`/dashboard/citizens/${validatedData.citizen_id}`)
    return { success: true, data: { id: data.id } }
  } catch (error) {
    console.error('Create communication error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Σφάλμα κατά τη δημιουργία επικοινωνίας' }
  }
}

/**
 * Delete a communication
 */
export async function deleteCommunication(id: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Δεν είστε συνδεδεμένος' }
    }

    // Get communication to find citizen_id for revalidation
    const { data: communication } = await supabase
      .from('communications')
      .select('citizen_id')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('communications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/communications')
    if (communication?.citizen_id) {
      revalidatePath(`/dashboard/citizens/${communication.citizen_id}`)
    }
    return { success: true }
  } catch (error) {
    console.error('Delete communication error:', error)
    return { success: false, error: 'Σφάλμα κατά τη διαγραφή επικοινωνίας' }
  }
}

/**
 * Get a single communication by ID
 */
export async function getCommunication(id: string) {
  try {
    const supabase = await createClient()

    // Get communication data
    const { data: communication, error: communicationError } = await supabase
      .from('communications')
      .select('*')
      .eq('id', id)
      .single()

    if (communicationError) {
      console.error('Supabase error:', communicationError)
      return null
    }

    // Get citizen data if exists
    let citizen = null
    if (communication.citizen_id) {
      const { data: citizenData } = await supabase
        .from('citizens')
        .select('id, surname, first_name, mobile, email')
        .eq('id', communication.citizen_id)
        .single()
      citizen = citizenData
    }

    return {
      ...communication,
      citizen,
    }
  } catch (error) {
    console.error('Get communication error:', error)
    return null
  }
}

/**
 * Get communications for a specific citizen
 */
export async function getCitizenCommunications(citizenId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .eq('citizen_id', citizenId)
      .order('communication_date', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return []
    }

    return data
  } catch (error) {
    console.error('Get citizen communications error:', error)
    return []
  }
}
