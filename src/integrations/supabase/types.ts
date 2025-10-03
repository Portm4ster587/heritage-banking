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
          account_type: string
          balance: number | null
          created_at: string | null
          id: string
          routing_number: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          account_type: string
          balance?: number | null
          created_at?: string | null
          id?: string
          routing_number: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string
          balance?: number | null
          created_at?: string | null
          id?: string
          routing_number?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          address: string
          annual_income: number | null
          annual_revenue: number | null
          application_type: Database["public"]["Enums"]["application_type"]
          business_name: string | null
          business_tax_id: string | null
          business_type: string | null
          city: string
          created_at: string | null
          date_of_birth: string
          email: string
          employer_name: string | null
          employment_status: string | null
          first_name: string
          id: string
          last_name: string
          loan_amount: number | null
          loan_purpose: string | null
          monthly_income: number | null
          phone: string
          review_notes: string | null
          reviewed_by_admin_id: string | null
          ssn_last4: string
          state: string
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
          user_id: string
          years_in_business: number | null
          zip_code: string
        }
        Insert: {
          address: string
          annual_income?: number | null
          annual_revenue?: number | null
          application_type: Database["public"]["Enums"]["application_type"]
          business_name?: string | null
          business_tax_id?: string | null
          business_type?: string | null
          city: string
          created_at?: string | null
          date_of_birth: string
          email: string
          employer_name?: string | null
          employment_status?: string | null
          first_name: string
          id?: string
          last_name: string
          loan_amount?: number | null
          loan_purpose?: string | null
          monthly_income?: number | null
          phone: string
          review_notes?: string | null
          reviewed_by_admin_id?: string | null
          ssn_last4: string
          state: string
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id: string
          years_in_business?: number | null
          zip_code: string
        }
        Update: {
          address?: string
          annual_income?: number | null
          annual_revenue?: number | null
          application_type?: Database["public"]["Enums"]["application_type"]
          business_name?: string | null
          business_tax_id?: string | null
          business_type?: string | null
          city?: string
          created_at?: string | null
          date_of_birth?: string
          email?: string
          employer_name?: string | null
          employment_status?: string | null
          first_name?: string
          id?: string
          last_name?: string
          loan_amount?: number | null
          loan_purpose?: string | null
          monthly_income?: number | null
          phone?: string
          review_notes?: string | null
          reviewed_by_admin_id?: string | null
          ssn_last4?: string
          state?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
          user_id?: string
          years_in_business?: number | null
          zip_code?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          account_id: string
          activation_status: string | null
          available_credit: number | null
          card_network: string
          card_number: string
          card_type: string
          created_at: string | null
          credit_limit: number | null
          cvv: string
          expiry_date: string
          id: string
          last4: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          activation_status?: string | null
          available_credit?: number | null
          card_network: string
          card_number: string
          card_type: string
          created_at?: string | null
          credit_limit?: number | null
          cvv: string
          expiry_date: string
          id?: string
          last4: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          activation_status?: string | null
          available_credit?: number | null
          card_network?: string
          card_number?: string
          card_type?: string
          created_at?: string | null
          credit_limit?: number | null
          cvv?: string
          expiry_date?: string
          id?: string
          last4?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
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
      crypto_assets: {
        Row: {
          current_price: number
          id: string
          market_cap: number | null
          name: string
          price_change_24h: number | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          current_price: number
          id?: string
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          current_price?: number
          id?: string
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          asset_symbol: string
          balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          asset_symbol: string
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          asset_symbol?: string
          balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      deposit_requests: {
        Row: {
          account_id: string
          amount: number
          created_at: string | null
          id: string
          method: string
          notes: string | null
          processed_at: string | null
          processed_by_admin_id: string | null
          reference_number: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string | null
          id?: string
          method: string
          notes?: string | null
          processed_at?: string | null
          processed_by_admin_id?: string | null
          reference_number?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          notes?: string | null
          processed_at?: string | null
          processed_by_admin_id?: string | null
          reference_number?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          account_number: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          provider: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          provider?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          provider?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          annual_income: number | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          employer_name: string | null
          employment_status: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          ssn_last4: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          annual_income?: number | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          employer_name?: string | null
          employment_status?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          ssn_last4?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          annual_income?: number | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          employer_name?: string | null
          employment_status?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          ssn_last4?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      transfers: {
        Row: {
          amount: number
          approved_by_admin_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          from_account_id: string | null
          id: string
          recipient_account: string | null
          recipient_name: string | null
          status: string | null
          to_account_id: string | null
          transfer_type: string
          user_id: string
        }
        Insert: {
          amount: number
          approved_by_admin_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          from_account_id?: string | null
          id?: string
          recipient_account?: string | null
          recipient_name?: string | null
          status?: string | null
          to_account_id?: string | null
          transfer_type: string
          user_id: string
        }
        Update: {
          amount?: number
          approved_by_admin_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          from_account_id?: string | null
          id?: string
          recipient_account?: string | null
          recipient_name?: string | null
          status?: string | null
          to_account_id?: string | null
          transfer_type?: string
          user_id?: string
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
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdraw_requests: {
        Row: {
          account_id: string
          amount: number
          created_at: string | null
          destination: string
          id: string
          method: string
          notes: string | null
          processed_at: string | null
          processed_by_admin_id: string | null
          reference_number: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string | null
          destination: string
          id?: string
          method: string
          notes?: string | null
          processed_at?: string | null
          processed_by_admin_id?: string | null
          reference_number?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string | null
          destination?: string
          id?: string
          method?: string
          notes?: string | null
          processed_at?: string | null
          processed_by_admin_id?: string | null
          reference_number?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdraw_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "moderator" | "user"
      application_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "requires_info"
      application_type:
        | "checking"
        | "savings"
        | "credit_card"
        | "personal_loan"
        | "home_loan"
        | "auto_loan"
        | "business_loan"
        | "business"
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
      app_role: ["admin", "moderator", "user"],
      application_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "requires_info",
      ],
      application_type: [
        "checking",
        "savings",
        "credit_card",
        "personal_loan",
        "home_loan",
        "auto_loan",
        "business_loan",
        "business",
      ],
    },
  },
} as const
