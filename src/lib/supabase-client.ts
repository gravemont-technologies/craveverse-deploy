// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (TODO: Generate from Supabase schema)
export interface Database {
  public: {
    Tables: {
      files: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          size: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          uploaded_at: string
          processed_at?: string
          metadata?: Record<string, any>
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          size: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          uploaded_at?: string
          processed_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          size?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          uploaded_at?: string
          processed_at?: string
          metadata?: Record<string, any>
        }
      }
      relationships: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'personal' | 'professional' | 'social'
          status: 'active' | 'inactive' | 'archived'
          created_at: string
          updated_at: string
          metadata?: Record<string, any>
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'personal' | 'professional' | 'social'
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'personal' | 'professional' | 'social'
          status?: 'active' | 'inactive' | 'archived'
          created_at?: string
          updated_at?: string
          metadata?: Record<string, any>
        }
      }
      insights: {
        Row: {
          id: string
          user_id: string
          file_id?: string
          relationship_id?: string
          type: string
          title: string
          description: string
          confidence: number
          impact: 'positive' | 'neutral' | 'negative'
          created_at: string
          metadata?: Record<string, any>
        }
        Insert: {
          id?: string
          user_id: string
          file_id?: string
          relationship_id?: string
          type: string
          title: string
          description: string
          confidence: number
          impact?: 'positive' | 'neutral' | 'negative'
          created_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          user_id?: string
          file_id?: string
          relationship_id?: string
          type?: string
          title?: string
          description?: string
          confidence?: number
          impact?: 'positive' | 'neutral' | 'negative'
          created_at?: string
          metadata?: Record<string, any>
        }
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

// File operations
export const fileOperations = {
  // Upload file to Supabase Storage
  async uploadFile(file: File, userId: string) {
    // TODO: Implement file upload to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('files')
      .upload(fileName, file)
    
    if (error) throw error
    return data
  },

  // Get file URL
  async getFileUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  // Delete file
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  }
}

// Database operations
export const dbOperations = {
  // Files
  async getFiles(userId: string) {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createFile(fileData: Database['public']['Tables']['files']['Insert']) {
    const { data, error } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateFile(id: string, updates: Database['public']['Tables']['files']['Update']) {
    const { data, error } = await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteFile(id: string) {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Relationships
  async getRelationships(userId: string) {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Insights
  async getInsights(userId: string) {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
