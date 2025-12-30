export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      citizens: {
        Row: {
          id: string
          surname: string
          first_name: string
          father_name: string | null
          referral_source: string | null
          mobile: string | null
          landline: string | null
          email: string | null
          address: string | null
          postal_code: string | null
          area: string | null
          municipality: string | null
          electoral_district: string | null
          contact_category: string
          profession: string | null
          assigned_user_id: string | null
          notes: string | null
          is_active: boolean
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          surname: string
          first_name: string
          father_name?: string | null
          referral_source?: string | null
          mobile?: string | null
          landline?: string | null
          email?: string | null
          address?: string | null
          postal_code?: string | null
          area?: string | null
          municipality?: string | null
          electoral_district?: string | null
          contact_category?: string
          profession?: string | null
          assigned_user_id?: string | null
          notes?: string | null
          is_active?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          surname?: string
          first_name?: string
          father_name?: string | null
          referral_source?: string | null
          mobile?: string | null
          landline?: string | null
          email?: string | null
          address?: string | null
          postal_code?: string | null
          area?: string | null
          municipality?: string | null
          electoral_district?: string | null
          contact_category?: string
          profession?: string | null
          assigned_user_id?: string | null
          notes?: string | null
          is_active?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          id: string
          citizen_id: string
          category: string
          status: string
          request_text: string | null
          notes: string | null
          submitted_at: string
          completed_at: string | null
          reminder_sent: boolean
          reminder_sent_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          citizen_id: string
          category: string
          status?: string
          request_text?: string | null
          notes?: string | null
          submitted_at?: string
          completed_at?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          citizen_id?: string
          category?: string
          status?: string
          request_text?: string | null
          notes?: string | null
          submitted_at?: string
          completed_at?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          id: string
          citizen_id: string
          communication_date: string
          comm_type: string
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          citizen_id: string
          communication_date?: string
          comm_type: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          citizen_id?: string
          communication_date?: string
          comm_type?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      military_personnel: {
        Row: {
          id: string
          citizen_id: string | null
          military_type: string
          surname: string
          first_name: string
          father_name: string | null
          mobile: string | null
          email: string | null
          esso_year: number | null
          esso_letter: string | null
          military_number: string | null
          conscript_wish: string | null
          training_center: string | null
          presentation_date: string | null
          assignment: string | null
          assignment_date: string | null
          transfer: string | null
          transfer_date: string | null
          rank: string | null
          service_unit: string | null
          permanent_wish: string | null
          service_number: string | null
          notes: string | null
          assigned_user_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          citizen_id?: string | null
          military_type: string
          surname: string
          first_name: string
          father_name?: string | null
          mobile?: string | null
          email?: string | null
          esso_year?: number | null
          esso_letter?: string | null
          military_number?: string | null
          conscript_wish?: string | null
          training_center?: string | null
          presentation_date?: string | null
          assignment?: string | null
          assignment_date?: string | null
          transfer?: string | null
          transfer_date?: string | null
          rank?: string | null
          service_unit?: string | null
          permanent_wish?: string | null
          service_number?: string | null
          notes?: string | null
          assigned_user_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          citizen_id?: string | null
          military_type?: string
          surname?: string
          first_name?: string
          father_name?: string | null
          mobile?: string | null
          email?: string | null
          esso_year?: number | null
          esso_letter?: string | null
          military_number?: string | null
          conscript_wish?: string | null
          training_center?: string | null
          presentation_date?: string | null
          assignment?: string | null
          assignment_date?: string | null
          transfer?: string | null
          transfer_date?: string | null
          rank?: string | null
          service_unit?: string | null
          permanent_wish?: string | null
          service_number?: string | null
          notes?: string | null
          assigned_user_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Citizen = Database['public']['Tables']['citizens']['Row']
export type CitizenInsert = Database['public']['Tables']['citizens']['Insert']
export type CitizenUpdate = Database['public']['Tables']['citizens']['Update']

export type Request = Database['public']['Tables']['requests']['Row']
export type RequestInsert = Database['public']['Tables']['requests']['Insert']
export type RequestUpdate = Database['public']['Tables']['requests']['Update']

export type Communication = Database['public']['Tables']['communications']['Row']
export type CommunicationInsert = Database['public']['Tables']['communications']['Insert']
export type CommunicationUpdate = Database['public']['Tables']['communications']['Update']

export type MilitaryPersonnel = Database['public']['Tables']['military_personnel']['Row']
export type MilitaryPersonnelInsert = Database['public']['Tables']['military_personnel']['Insert']
export type MilitaryPersonnelUpdate = Database['public']['Tables']['military_personnel']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

// Extended types with relations
export type CitizenWithRelations = Citizen & {
  requests?: Request[]
  communications?: Communication[]
  military_personnel?: MilitaryPersonnel
  assigned_user?: UserProfile
}

export type RequestWithCitizen = Request & {
  citizen?: Citizen
}

export type MilitaryWithCitizen = MilitaryPersonnel & {
  citizen?: Citizen
}
