export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      analysis_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          grass_type: string | null
          id: string
          image_path: string
          lawn_goal: string | null
          metadata: Json | null
          result: Json | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          grass_type?: string | null
          id?: string
          image_path: string
          lawn_goal?: string | null
          metadata?: Json | null
          result?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          grass_type?: string | null
          id?: string
          image_path?: string
          lawn_goal?: string | null
          metadata?: Json | null
          result?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string | null
          created_at: string | null
          date: string
          excerpt: string | null
          id: number
          image: string | null
          read_time: number | null
          seo: Json | null
          slug: string
          status: string
          tags: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author: string
          category: string
          content?: string | null
          created_at?: string | null
          date?: string
          excerpt?: string | null
          id?: number
          image?: string | null
          read_time?: number | null
          seo?: Json | null
          slug: string
          status?: string
          tags?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string
          category?: string
          content?: string | null
          created_at?: string | null
          date?: string
          excerpt?: string | null
          id?: number
          image?: string | null
          read_time?: number | null
          seo?: Json | null
          slug?: string
          status?: string
          tags?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          action: string
          category: string
          id: string
          label: string | null
          timestamp: string | null
          value: number | null
        }
        Insert: {
          action: string
          category: string
          id?: string
          label?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Update: {
          action?: string
          category?: string
          id?: string
          label?: string | null
          timestamp?: string | null
          value?: number | null
        }
        Relationships: []
      }
      lawn_highscores: {
        Row: {
          analysis_date: string
          created_at: string
          email: string | null
          grass_type: string | null
          id: string
          lawn_image_url: string | null
          lawn_score: number
          lawn_size: string | null
          location: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          analysis_date?: string
          created_at?: string
          email?: string | null
          grass_type?: string | null
          id?: string
          lawn_image_url?: string | null
          lawn_score: number
          lawn_size?: string | null
          location?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          analysis_date?: string
          created_at?: string
          email?: string | null
          grass_type?: string | null
          id?: string
          lawn_image_url?: string | null
          lawn_score?: number
          lawn_size?: string | null
          location?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      lawn_profiles: {
        Row: {
          analysis_results: Json | null
          analyzes_used: number | null
          created_at: string
          grass_type: string
          has_children: boolean | null
          has_pets: boolean | null
          id: string
          last_fertilized: string | null
          last_mowed: string | null
          lawn_goal: string
          lawn_picture: string | null
          lawn_size: string
          name: string | null
          rasenbild: string | null
          rasenproblem: string | null
          soil_type: string | null
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          analysis_results?: Json | null
          analyzes_used?: number | null
          created_at?: string
          grass_type: string
          has_children?: boolean | null
          has_pets?: boolean | null
          id?: string
          last_fertilized?: string | null
          last_mowed?: string | null
          lawn_goal: string
          lawn_picture?: string | null
          lawn_size: string
          name?: string | null
          rasenbild?: string | null
          rasenproblem?: string | null
          soil_type?: string | null
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          analysis_results?: Json | null
          analyzes_used?: number | null
          created_at?: string
          grass_type?: string
          has_children?: boolean | null
          has_pets?: boolean | null
          id?: string
          last_fertilized?: string | null
          last_mowed?: string | null
          lawn_goal?: string
          lawn_picture?: string | null
          lawn_size?: string
          name?: string | null
          rasenbild?: string | null
          rasenproblem?: string | null
          soil_type?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: string
          path: string
          referrer: string | null
          timestamp: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          path: string
          referrer?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          path?: string
          referrer?: string | null
          timestamp?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: number
          last_updated: string
          meta: Json | null
          path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: number
          last_updated?: string
          meta?: Json | null
          path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: number
          last_updated?: string
          meta?: Json | null
          path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          email_preferences: Json | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_sign_in_at: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_preferences?: Json | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_preferences?: Json | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reminder_logs: {
        Row: {
          email_sent: boolean | null
          id: string
          sent_at: string | null
          task_date: string
          task_type: string
          user_id: string | null
        }
        Insert: {
          email_sent?: boolean | null
          id?: string
          sent_at?: string | null
          task_date: string
          task_type: string
          user_id?: string | null
        }
        Update: {
          email_sent?: boolean | null
          id?: string
          sent_at?: string | null
          task_date?: string
          task_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          email_reports: Json | null
          google_analytics_id: string | null
          id: string
          security: Json | null
          seo: Json | null
          show_lovable_badge: boolean | null
          site_address: string | null
          site_email: string
          site_name: string
          site_phone: string | null
          site_tagline: string
          updated_at: string | null
        }
        Insert: {
          email_reports?: Json | null
          google_analytics_id?: string | null
          id?: string
          security?: Json | null
          seo?: Json | null
          show_lovable_badge?: boolean | null
          site_address?: string | null
          site_email: string
          site_name: string
          site_phone?: string | null
          site_tagline: string
          updated_at?: string | null
        }
        Update: {
          email_reports?: Json | null
          google_analytics_id?: string | null
          id?: string
          security?: Json | null
          seo?: Json | null
          show_lovable_badge?: boolean | null
          site_address?: string | null
          site_email?: string
          site_name?: string
          site_phone?: string | null
          site_tagline?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
          interests: string[] | null
          name: string | null
          open_rate: number | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          interests?: string[] | null
          name?: string | null
          open_rate?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          interests?: string[] | null
          name?: string | null
          open_rate?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_analysis_job: {
        Args: {
          p_user_id: string
          p_image_path: string
          p_grass_type?: string
          p_lawn_goal?: string
          p_metadata?: Json
        }
        Returns: string
      }
      get_analysis_job: {
        Args: { p_job_id: string }
        Returns: Json
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_analysis_job: {
        Args: {
          p_job_id: string
          p_status?: string
          p_result?: Json
          p_error_message?: string
        }
        Returns: boolean
      }
      update_user_highscore: {
        Args:
          | {
              p_user_id: string
              p_user_name: string
              p_lawn_score: number
              p_lawn_image_url?: string
              p_location?: string
              p_grass_type?: string
              p_lawn_size?: string
            }
          | {
              p_user_id: string
              p_user_name: string
              p_lawn_score: number
              p_lawn_image_url?: string
              p_location?: string
              p_grass_type?: string
              p_lawn_size?: string
              p_email?: string
            }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
