export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          address: string | null
          area: string | null
          created_at: string | null
          description: string | null
          email: string | null
          email_domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          org_number: string | null
          owner: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          email_domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          org_number?: string | null
          owner?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          email_domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          org_number?: string | null
          owner?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      agency_invitations: {
        Row: {
          agency_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used_at?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_invitations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      image_views: {
        Row: {
          created_at: string | null
          id: string
          image_index: number
          image_url: string | null
          property_id: string
          session_id: string
          time_spent_ms: number | null
          viewed_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_index: number
          image_url?: string | null
          property_id: string
          session_id: string
          time_spent_ms?: number | null
          viewed_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_index?: number
          image_url?: string | null
          property_id?: string
          session_id?: string
          time_spent_ms?: number | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          metadata: Json | null
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency: string | null
          agency_id: string | null
          area: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          office: string | null
          phone: string | null
          tiktok_url: string | null
          updated_at: string
        }
        Insert: {
          agency?: string | null
          agency_id?: string | null
          area?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          instagram_url?: string | null
          office?: string | null
          phone?: string | null
          tiktok_url?: string | null
          updated_at?: string
        }
        Update: {
          agency?: string | null
          agency_id?: string | null
          area?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          office?: string | null
          phone?: string | null
          tiktok_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          additional_images: string[] | null
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          construction_year: number | null
          created_at: string | null
          description: string | null
          documents: Json | null
          fee: number | null
          floor: number | null
          floorplan_images: string[] | null
          floorplan_url: string | null
          has_balcony: boolean | null
          has_elevator: boolean | null
          has_vr: boolean | null
          housing_association: string | null
          hover_image_url: string | null
          id: string
          image_url: string | null
          is_coming_soon: boolean | null
          is_deleted: boolean | null
          is_manual_price_change: boolean | null
          is_new_production: boolean | null
          is_sold: boolean | null
          listed_date: string | null
          location: string
          new_price: number | null
          operating_cost: number | null
          price: number
          seller_email: string | null
          show_viewer_count: boolean | null
          sold_date: string | null
          sold_price: number | null
          statistics_email_frequency: string | null
          title: string
          total_floors: number | null
          type: string
          updated_at: string | null
          user_id: string
          vendor_logo_url: string | null
          viewing_date: string | null
          viewing_date_2: string | null
          vr_image_indices: number[] | null
        }
        Insert: {
          additional_images?: string[] | null
          address: string
          area: number
          bathrooms: number
          bedrooms: number
          construction_year?: number | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          fee?: number | null
          floor?: number | null
          floorplan_images?: string[] | null
          floorplan_url?: string | null
          has_balcony?: boolean | null
          has_elevator?: boolean | null
          has_vr?: boolean | null
          housing_association?: string | null
          hover_image_url?: string | null
          id?: string
          image_url?: string | null
          is_coming_soon?: boolean | null
          is_deleted?: boolean | null
          is_manual_price_change?: boolean | null
          is_new_production?: boolean | null
          is_sold?: boolean | null
          listed_date?: string | null
          location: string
          new_price?: number | null
          operating_cost?: number | null
          price: number
          seller_email?: string | null
          show_viewer_count?: boolean | null
          sold_date?: string | null
          sold_price?: number | null
          statistics_email_frequency?: string | null
          title: string
          total_floors?: number | null
          type: string
          updated_at?: string | null
          user_id: string
          vendor_logo_url?: string | null
          viewing_date?: string | null
          viewing_date_2?: string | null
          vr_image_indices?: number[] | null
        }
        Update: {
          additional_images?: string[] | null
          address?: string
          area?: number
          bathrooms?: number
          bedrooms?: number
          construction_year?: number | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          fee?: number | null
          floor?: number | null
          floorplan_images?: string[] | null
          floorplan_url?: string | null
          has_balcony?: boolean | null
          has_elevator?: boolean | null
          has_vr?: boolean | null
          housing_association?: string | null
          hover_image_url?: string | null
          id?: string
          image_url?: string | null
          is_coming_soon?: boolean | null
          is_deleted?: boolean | null
          is_manual_price_change?: boolean | null
          is_new_production?: boolean | null
          is_sold?: boolean | null
          listed_date?: string | null
          location?: string
          new_price?: number | null
          operating_cost?: number | null
          price?: number
          seller_email?: string | null
          show_viewer_count?: boolean | null
          sold_date?: string | null
          sold_price?: number | null
          statistics_email_frequency?: string | null
          title?: string
          total_floors?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
          vendor_logo_url?: string | null
          viewing_date?: string | null
          viewing_date_2?: string | null
          vr_image_indices?: number[] | null
        }
        Relationships: []
      }
      property_bids: {
        Row: {
          bid_amount: number
          bidder_email: string | null
          bidder_label: string | null
          bidder_name: string | null
          bidder_phone: string | null
          created_at: string
          id: string
          property_id: string
          updated_at: string
        }
        Insert: {
          bid_amount: number
          bidder_email?: string | null
          bidder_label?: string | null
          bidder_name?: string | null
          bidder_phone?: string | null
          created_at?: string
          id?: string
          property_id: string
          updated_at?: string
        }
        Update: {
          bid_amount?: number
          bidder_email?: string | null
          bidder_label?: string | null
          bidder_name?: string | null
          bidder_phone?: string | null
          created_at?: string
          id?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_bids_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_shares: {
        Row: {
          created_at: string
          id: string
          property_id: string
          session_id: string
          share_method: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          session_id: string
          share_method: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          session_id?: string
          share_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_shares_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_views: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          property_id: string
          session_id: string
          time_spent_seconds: number | null
          view_started_at: string
          visitor_city: string | null
          visitor_country: string | null
          visitor_region: string | null
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          property_id: string
          session_id: string
          time_spent_seconds?: number | null
          view_started_at?: string
          visitor_city?: string | null
          visitor_country?: string | null
          visitor_region?: string | null
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          property_id?: string
          session_id?: string
          time_spent_seconds?: number | null
          view_started_at?: string
          visitor_city?: string | null
          visitor_country?: string | null
          visitor_region?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          id: string
          name: string
          search_criteria: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          search_criteria?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          search_criteria?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          user_id: string
          user_type: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          user_type: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      viewing_registrations: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          property_id: string
          viewing_date: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          property_id: string
          viewing_date: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          property_id?: string
          viewing_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_registrations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_seller_email: {
        Args: { property_user_id: string }
        Returns: boolean
      }
      get_invitation_by_token: {
        Args: { p_token: string }
        Returns: {
          agency_id: string
          agency_name: string
          email: string
          expires_at: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_public_bid_info: {
        Args: { p_property_id: string }
        Returns: {
          bid_amount: number
          bidder_label: string
          created_at: string
        }[]
      }
      get_user_type: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_type"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_agency_admin: { Args: { _user_id: string }; Returns: boolean }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      users_in_same_agency: {
        Args: { _user_id1: string; _user_id2: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "maklare"
        | "superadmin"
        | "agency_admin"
        | "buyer"
      user_type: "private" | "agent"
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
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "user",
        "maklare",
        "superadmin",
        "agency_admin",
        "buyer",
      ],
      user_type: ["private", "agent"],
    },
  },
} as const
