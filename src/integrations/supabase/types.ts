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
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in_at?: string | null
          role?: string | null
          updated_at?: string | null
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
