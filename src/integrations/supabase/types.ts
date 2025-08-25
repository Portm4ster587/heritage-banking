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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string
          balance: number
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          id: string
          metadata: Json
          status: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          balance?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          id?: string
          metadata?: Json
          status?: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          balance?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          id?: string
          metadata?: Json
          status?: Database["public"]["Enums"]["account_status"]
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          account_id: string
          card_type: string
          created_at: string
          embossed_name: string | null
          exp_month: number | null
          exp_year: number | null
          id: string
          last4: string | null
          network: string | null
          status: Database["public"]["Enums"]["card_status"]
          updated_at: string
        }
        Insert: {
          account_id: string
          card_type: string
          created_at?: string
          embossed_name?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          last4?: string | null
          network?: string | null
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          card_type?: string
          created_at?: string
          embossed_name?: string | null
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          last4?: string | null
          network?: string | null
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          created_at: string
          document_urls: Json | null
          id: string
          notes: string | null
          reviewed_by_admin_id: string | null
          ssn_encrypted: string | null
          ssn_last4: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_urls?: Json | null
          id?: string
          notes?: string | null
          reviewed_by_admin_id?: string | null
          ssn_encrypted?: string | null
          ssn_last4?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_urls?: Json | null
          id?: string
          notes?: string | null
          reviewed_by_admin_id?: string | null
          ssn_encrypted?: string | null
          ssn_last4?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          consent: boolean
          created_at: string
          email: string
          id: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          consent?: boolean
          created_at?: string
          email: string
          id?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          consent?: boolean
          created_at?: string
          email?: string
          id?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          country: string | null
          created_at: string
          dob: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          postal_code: string | null
          ssn_last4: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          ssn_last4?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          ssn_last4?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transfers: {
        Row: {
          amount: number
          approved_by_admin_id: string | null
          created_at: string
          created_by_user_id: string
          currency: Database["public"]["Enums"]["currency"]
          from_account_id: string
          fttc_token_required: boolean
          id: string
          memo: string | null
          progress: number
          status: Database["public"]["Enums"]["transfer_status"]
          to_account_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_by_admin_id?: string | null
          created_at?: string
          created_by_user_id: string
          currency?: Database["public"]["Enums"]["currency"]
          from_account_id: string
          fttc_token_required?: boolean
          id?: string
          memo?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["transfer_status"]
          to_account_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_by_admin_id?: string | null
          created_at?: string
          created_by_user_id?: string
          currency?: Database["public"]["Enums"]["currency"]
          from_account_id?: string
          fttc_token_required?: boolean
          id?: string
          memo?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["transfer_status"]
          to_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status:
        | "pending"
        | "active"
        | "suspended"
        | "closed"
        | "kyc_pending"
      account_type:
        | "personal_checking"
        | "personal_savings"
        | "business_checking"
        | "business_savings"
      app_role: "admin" | "moderator" | "user"
      card_status:
        | "pending"
        | "approved"
        | "shipped"
        | "active"
        | "blocked"
        | "cancelled"
      currency: "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "USDT"
      kyc_status: "pending" | "approved" | "rejected" | "needs_more_info"
      transfer_status:
        | "pending"
        | "processing"
        | "paused"
        | "requires_token"
        | "completed"
        | "failed"
        | "cancelled"
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
      account_status: [
        "pending",
        "active",
        "suspended",
        "closed",
        "kyc_pending",
      ],
      account_type: [
        "personal_checking",
        "personal_savings",
        "business_checking",
        "business_savings",
      ],
      app_role: ["admin", "moderator", "user"],
      card_status: [
        "pending",
        "approved",
        "shipped",
        "active",
        "blocked",
        "cancelled",
      ],
      currency: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "USDT"],
      kyc_status: ["pending", "approved", "rejected", "needs_more_info"],
      transfer_status: [
        "pending",
        "processing",
        "paused",
        "requires_token",
        "completed",
        "failed",
        "cancelled",
      ],
    },
  },
} as const
