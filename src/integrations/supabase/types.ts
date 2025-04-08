export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_url: string
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_url: string
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_url?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string
          id: string
          is_published: boolean
          published_date: string
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt: string
          id?: string
          is_published?: boolean
          published_date?: string
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string
          id?: string
          is_published?: boolean
          published_date?: string
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          author_id: string
          category_id: string
          created_at: string
          created_by: string
          description: string
          github_url: string | null
          id: string
          image_url: string | null
          is_deleted: boolean
          modified_by: string
          name: string
          status: string
          tags: string[] | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          author_id: string
          category_id: string
          created_at?: string
          created_by: string
          description: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          modified_by: string
          name: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string
          created_at?: string
          created_by?: string
          description?: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          modified_by?: string
          name?: string
          status?: string
          tags?: string[] | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      songs: {
        Row: {
          audio_url: string
          cover_image: string
          created_at: string
          duration: number
          id: string
          producer: string
          release_date: string
          streaming_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          cover_image: string
          created_at?: string
          duration: number
          id?: string
          producer: string
          release_date?: string
          streaming_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          cover_image?: string
          created_at?: string
          duration?: number
          id?: string
          producer?: string
          release_date?: string
          streaming_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      spotify_artists: {
        Row: {
          artist_id: string
          artist_name: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          artist_name: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          artist_name?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      spotify_tracks: {
        Row: {
          album_name: string
          artist_id: string
          cover_image_url: string
          created_at: string
          duration_ms: number
          id: string
          preview_url: string | null
          release_date: string
          spotify_url: string
          title: string
          track_id: string
          updated_at: string
        }
        Insert: {
          album_name: string
          artist_id: string
          cover_image_url: string
          created_at?: string
          duration_ms: number
          id?: string
          preview_url?: string | null
          release_date: string
          spotify_url: string
          title: string
          track_id: string
          updated_at?: string
        }
        Update: {
          album_name?: string
          artist_id?: string
          cover_image_url?: string
          created_at?: string
          duration_ms?: number
          id?: string
          preview_url?: string | null
          release_date?: string
          spotify_url?: string
          title?: string
          track_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotify_tracks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "spotify_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      todos: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          priority: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          priority?: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          priority?: string
          title?: string
          user_id?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
