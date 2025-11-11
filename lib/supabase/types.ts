/**
 * Supabase 数据库类型定义
 */

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
      user_profiles: {
        Row: {
          id: string
          name: string | null
          theme: 'apple' | 'cyberpunk'
          auto_refresh: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          theme?: 'apple' | 'cyberpunk'
          auto_refresh?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          theme?: 'apple' | 'cyberpunk'
          auto_refresh?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          item_id: string
          title: string
          link: string
          description: string | null
          category: string | null
          importance: number | null
          tags: string[] | null
          notes: string | null
          publish_date: string | null
          favorited_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          title: string
          link: string
          description?: string | null
          category?: string | null
          importance?: number | null
          tags?: string[] | null
          notes?: string | null
          publish_date?: string | null
          favorited_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          title?: string
          link?: string
          description?: string | null
          category?: string | null
          importance?: number | null
          tags?: string[] | null
          notes?: string | null
          publish_date?: string | null
          favorited_at?: string
        }
      }
      history: {
        Row: {
          id: string
          user_id: string
          item_id: string
          title: string
          link: string
          category: string | null
          description: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          title: string
          link: string
          category?: string | null
          description?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          title?: string
          link?: string
          category?: string | null
          description?: string | null
          visited_at?: string
        }
      }
      dismissed_items: {
        Row: {
          id: string
          user_id: string
          item_id: string
          dismissed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          dismissed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          dismissed_at?: string
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
