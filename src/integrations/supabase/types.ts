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
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          priority: string | null
          read: boolean | null
          reference_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          read?: boolean | null
          reference_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          read?: boolean | null
          reference_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          additional_data: Json | null
          address_line1: string | null
          address_line2: string | null
          annual_income: number | null
          annual_revenue: number | null
          application_type: string
          assets_value: number | null
          business_address: string | null
          business_ein: string | null
          business_name: string | null
          business_phone: string | null
          business_type: string | null
          city: string | null
          collateral_description: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          documents: Json | null
          email: string | null
          employer_name: string | null
          employment_length: number | null
          employment_status: string | null
          existing_debt: number | null
          first_name: string | null
          id: string
          id_verification_data: Json | null
          id_verification_status: string | null
          id_verification_url: string | null
          is_guest: boolean
          job_title: string | null
          last_name: string | null
          middle_name: string | null
          monthly_expenses: number | null
          monthly_income: number | null
          phone: string | null
          postal_code: string | null
          purpose: string | null
          requested_amount: number | null
          requested_limit: number | null
          review_notes: string | null
          reviewed_by_admin_id: string | null
          ssn_last4: string | null
          state: string | null
          status: string
          updated_at: string
          user_id: string | null
          work_phone: string | null
          years_in_business: number | null
        }
        Insert: {
          additional_data?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          annual_income?: number | null
          annual_revenue?: number | null
          application_type: string
          assets_value?: number | null
          business_address?: string | null
          business_ein?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          city?: string | null
          collateral_description?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          documents?: Json | null
          email?: string | null
          employer_name?: string | null
          employment_length?: number | null
          employment_status?: string | null
          existing_debt?: number | null
          first_name?: string | null
          id?: string
          id_verification_data?: Json | null
          id_verification_status?: string | null
          id_verification_url?: string | null
          is_guest?: boolean
          job_title?: string | null
          last_name?: string | null
          middle_name?: string | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          phone?: string | null
          postal_code?: string | null
          purpose?: string | null
          requested_amount?: number | null
          requested_limit?: number | null
          review_notes?: string | null
          reviewed_by_admin_id?: string | null
          ssn_last4?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          work_phone?: string | null
          years_in_business?: number | null
        }
        Update: {
          additional_data?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          annual_income?: number | null
          annual_revenue?: number | null
          application_type?: string
          assets_value?: number | null
          business_address?: string | null
          business_ein?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          city?: string | null
          collateral_description?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          documents?: Json | null
          email?: string | null
          employer_name?: string | null
          employment_length?: number | null
          employment_status?: string | null
          existing_debt?: number | null
          first_name?: string | null
          id?: string
          id_verification_data?: Json | null
          id_verification_status?: string | null
          id_verification_url?: string | null
          is_guest?: boolean
          job_title?: string | null
          last_name?: string | null
          middle_name?: string | null
          monthly_expenses?: number | null
          monthly_income?: number | null
          phone?: string | null
          postal_code?: string | null
          purpose?: string | null
          requested_amount?: number | null
          requested_limit?: number | null
          review_notes?: string | null
          reviewed_by_admin_id?: string | null
          ssn_last4?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          work_phone?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          account_id: string
          activation_code: string | null
          activation_status: string
          card_number_encrypted: string | null
          card_type: string
          created_at: string
          cvv_encrypted: string | null
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
          activation_code?: string | null
          activation_status?: string
          card_number_encrypted?: string | null
          card_type: string
          created_at?: string
          cvv_encrypted?: string | null
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
          activation_code?: string | null
          activation_status?: string
          card_number_encrypted?: string | null
          card_type?: string
          created_at?: string
          cvv_encrypted?: string | null
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
      crypto_assets: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_updated: string
          market_cap: number | null
          name: string
          price_change_24h: number
          price_usd: number
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_updated?: string
          market_cap?: number | null
          name: string
          price_change_24h?: number
          price_usd?: number
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_updated?: string
          market_cap?: number | null
          name?: string
          price_change_24h?: number
          price_usd?: number
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      crypto_wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: []
      }
      deposit_requests: {
        Row: {
          account_id: string | null
          admin_notes: string | null
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency"] | null
          id: string
          method: string
          payment_details: Json | null
          processed_by_admin_id: string | null
          status: string | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          admin_notes?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          id?: string
          method: string
          payment_details?: Json | null
          processed_by_admin_id?: string | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          admin_notes?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          id?: string
          method?: string
          payment_details?: Json | null
          processed_by_admin_id?: string | null
          status?: string | null
          transaction_hash?: string | null
          updated_at?: string | null
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
      payment_methods: {
        Row: {
          created_at: string
          details: Json
          external_id: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          method_type: string
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          external_id?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          method_type: string
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json
          external_id?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          method_type?: string
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          annual_income: number | null
          business_name: string | null
          business_type: string | null
          city: string | null
          country: string | null
          created_at: string
          dob: string | null
          email: string | null
          employer_name: string | null
          employment_status: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          middle_name: string | null
          monthly_income: number | null
          phone: string | null
          postal_code: string | null
          ssn_last4: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          annual_income?: number | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          employer_name?: string | null
          employment_status?: string | null
          first_name?: string | null
          id: string
          job_title?: string | null
          last_name?: string | null
          middle_name?: string | null
          monthly_income?: number | null
          phone?: string | null
          postal_code?: string | null
          ssn_last4?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          annual_income?: number | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dob?: string | null
          email?: string | null
          employer_name?: string | null
          employment_status?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          middle_name?: string | null
          monthly_income?: number | null
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
      wallet_addresses: {
        Row: {
          address: string
          created_at: string
          crypto_wallet_id: string
          id: string
          is_active: boolean
          network: string
          qr_code_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          crypto_wallet_id: string
          id?: string
          is_active?: boolean
          network: string
          qr_code_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          crypto_wallet_id?: string
          id?: string
          is_active?: boolean
          network?: string
          qr_code_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdraw_requests: {
        Row: {
          account_id: string | null
          admin_notes: string | null
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency"] | null
          destination_details: Json
          id: string
          method: string
          processed_by_admin_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          admin_notes?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          destination_details: Json
          id?: string
          method: string
          processed_by_admin_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          admin_notes?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          destination_details?: Json
          id?: string
          method?: string
          processed_by_admin_id?: string | null
          status?: string | null
          updated_at?: string | null
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
      create_admin_notification: {
        Args: {
          notification_message: string
          notification_priority?: string
          notification_title: string
          notification_type: string
          ref_user_id?: string
          reference_id?: string
        }
        Returns: string
      }
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
