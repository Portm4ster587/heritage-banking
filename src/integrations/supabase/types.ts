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
      account_applications: {
        Row: {
          admin_notes: string | null
          alternate_phone: string | null
          annual_income: number | null
          application_number: string
          application_type: string
          approval_date: string | null
          apt_unit: string | null
          citizenship: string
          city: string
          consent_credit_check: boolean | null
          consent_electronic_communications: boolean | null
          consent_privacy: boolean | null
          consent_terms: boolean | null
          country: string
          created_at: string | null
          date_of_birth: string
          email: string
          employer_name: string | null
          employer_phone: string | null
          employment_status: string
          first_name: string
          funding_source: string | null
          generated_account_number: string | null
          generated_routing_number: string | null
          id: string
          id_document_url: string | null
          id_expiration_date: string | null
          id_number_encrypted: string | null
          id_state: string | null
          id_type: string | null
          initial_deposit_amount: number | null
          last_name: string
          middle_name: string | null
          occupation: string | null
          other_income_amount: number | null
          other_income_source: string | null
          phone: string
          prev_city: string | null
          prev_state: string | null
          prev_street_address: string | null
          prev_zip_code: string | null
          proof_of_address_url: string | null
          proof_of_income_url: string | null
          rejection_reason: string | null
          requested_amount: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          security_answer_1_encrypted: string
          security_answer_2_encrypted: string
          security_answer_3_encrypted: string | null
          security_question_1: string
          security_question_2: string
          security_question_3: string | null
          ssn_encrypted: string
          ssn_last_4: string
          state: string
          status: string
          street_address: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
          years_at_address: number | null
          years_employed: number | null
          zip_code: string
        }
        Insert: {
          admin_notes?: string | null
          alternate_phone?: string | null
          annual_income?: number | null
          application_number: string
          application_type: string
          approval_date?: string | null
          apt_unit?: string | null
          citizenship?: string
          city: string
          consent_credit_check?: boolean | null
          consent_electronic_communications?: boolean | null
          consent_privacy?: boolean | null
          consent_terms?: boolean | null
          country?: string
          created_at?: string | null
          date_of_birth: string
          email: string
          employer_name?: string | null
          employer_phone?: string | null
          employment_status: string
          first_name: string
          funding_source?: string | null
          generated_account_number?: string | null
          generated_routing_number?: string | null
          id?: string
          id_document_url?: string | null
          id_expiration_date?: string | null
          id_number_encrypted?: string | null
          id_state?: string | null
          id_type?: string | null
          initial_deposit_amount?: number | null
          last_name: string
          middle_name?: string | null
          occupation?: string | null
          other_income_amount?: number | null
          other_income_source?: string | null
          phone: string
          prev_city?: string | null
          prev_state?: string | null
          prev_street_address?: string | null
          prev_zip_code?: string | null
          proof_of_address_url?: string | null
          proof_of_income_url?: string | null
          rejection_reason?: string | null
          requested_amount?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          security_answer_1_encrypted: string
          security_answer_2_encrypted: string
          security_answer_3_encrypted?: string | null
          security_question_1: string
          security_question_2: string
          security_question_3?: string | null
          ssn_encrypted: string
          ssn_last_4: string
          state: string
          status?: string
          street_address: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_at_address?: number | null
          years_employed?: number | null
          zip_code: string
        }
        Update: {
          admin_notes?: string | null
          alternate_phone?: string | null
          annual_income?: number | null
          application_number?: string
          application_type?: string
          approval_date?: string | null
          apt_unit?: string | null
          citizenship?: string
          city?: string
          consent_credit_check?: boolean | null
          consent_electronic_communications?: boolean | null
          consent_privacy?: boolean | null
          consent_terms?: boolean | null
          country?: string
          created_at?: string | null
          date_of_birth?: string
          email?: string
          employer_name?: string | null
          employer_phone?: string | null
          employment_status?: string
          first_name?: string
          funding_source?: string | null
          generated_account_number?: string | null
          generated_routing_number?: string | null
          id?: string
          id_document_url?: string | null
          id_expiration_date?: string | null
          id_number_encrypted?: string | null
          id_state?: string | null
          id_type?: string | null
          initial_deposit_amount?: number | null
          last_name?: string
          middle_name?: string | null
          occupation?: string | null
          other_income_amount?: number | null
          other_income_source?: string | null
          phone?: string
          prev_city?: string | null
          prev_state?: string | null
          prev_street_address?: string | null
          prev_zip_code?: string | null
          proof_of_address_url?: string | null
          proof_of_income_url?: string | null
          rejection_reason?: string | null
          requested_amount?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          security_answer_1_encrypted?: string
          security_answer_2_encrypted?: string
          security_answer_3_encrypted?: string | null
          security_question_1?: string
          security_question_2?: string
          security_question_3?: string | null
          ssn_encrypted?: string
          ssn_last_4?: string
          state?: string
          status?: string
          street_address?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          years_at_address?: number | null
          years_employed?: number | null
          zip_code?: string
        }
        Relationships: []
      }
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
      ach_transfers: {
        Row: {
          account_id: string
          ach_type: string | null
          admin_notes: string | null
          amount: number
          created_at: string | null
          description: string | null
          effective_date: string | null
          external_bank_id: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          reference_number: string | null
          scheduled_date: string | null
          status: string | null
          transfer_direction: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          ach_type?: string | null
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          external_bank_id?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          scheduled_date?: string | null
          status?: string | null
          transfer_direction: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          ach_type?: string | null
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          description?: string | null
          effective_date?: string | null
          external_bank_id?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          scheduled_date?: string | null
          status?: string | null
          transfer_direction?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ach_transfers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ach_transfers_external_bank_id_fkey"
            columns: ["external_bank_id"]
            isOneToOne: false
            referencedRelation: "external_bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_crypto_wallets: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string
          currency_name: string
          id: string
          is_active: boolean | null
          network: string | null
          qr_code_url: string | null
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency: string
          currency_name: string
          id?: string
          is_active?: boolean | null
          network?: string | null
          qr_code_url?: string | null
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string
          currency_name?: string
          id?: string
          is_active?: boolean | null
          network?: string | null
          qr_code_url?: string | null
          updated_at?: string | null
          wallet_address?: string
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
      bill_payments: {
        Row: {
          amount: number
          auto_pay: boolean | null
          created_at: string | null
          frequency: string | null
          id: string
          last_payment_date: string | null
          next_payment_date: string | null
          payee_account: string
          payee_name: string
          payee_type: string
          reminder_days: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_pay?: boolean | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payee_account: string
          payee_name: string
          payee_type?: string
          reminder_days?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_pay?: boolean | null
          created_at?: string | null
          frequency?: string | null
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payee_account?: string
          payee_name?: string
          payee_type?: string
          reminder_days?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
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
          is_locked: boolean | null
          last4: string
          spending_limit: number | null
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
          is_locked?: boolean | null
          last4: string
          spending_limit?: number | null
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
          is_locked?: boolean | null
          last4?: string
          spending_limit?: number | null
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
      check_deposits: {
        Row: {
          account_id: string
          admin_notes: string | null
          amount: number
          bank_name: string | null
          check_back_url: string | null
          check_front_url: string | null
          check_number: string | null
          created_at: string | null
          id: string
          payer_name: string | null
          processed_at: string | null
          processed_by: string | null
          routing_number: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          admin_notes?: string | null
          amount: number
          bank_name?: string | null
          check_back_url?: string | null
          check_front_url?: string | null
          check_number?: string | null
          created_at?: string | null
          id?: string
          payer_name?: string | null
          processed_at?: string | null
          processed_by?: string | null
          routing_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          admin_notes?: string | null
          amount?: number
          bank_name?: string | null
          check_back_url?: string | null
          check_front_url?: string | null
          check_number?: string | null
          created_at?: string | null
          id?: string
          payer_name?: string | null
          processed_at?: string | null
          processed_by?: string | null
          routing_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_deposits_account_id_fkey"
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
      external_bank_accounts: {
        Row: {
          account_holder_name: string
          account_number_encrypted: string
          account_number_last_4: string
          account_type: string
          bank_code: string | null
          bank_id: string | null
          bank_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_used_at: string | null
          linked_at: string | null
          micro_deposit_amount_1: number | null
          micro_deposit_amount_2: number | null
          nickname: string | null
          routing_number: string
          updated_at: string | null
          user_id: string
          verification_attempts: number | null
          verification_date: string | null
          verification_method: string | null
          verification_status: string
        }
        Insert: {
          account_holder_name: string
          account_number_encrypted: string
          account_number_last_4: string
          account_type: string
          bank_code?: string | null
          bank_id?: string | null
          bank_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          linked_at?: string | null
          micro_deposit_amount_1?: number | null
          micro_deposit_amount_2?: number | null
          nickname?: string | null
          routing_number: string
          updated_at?: string | null
          user_id: string
          verification_attempts?: number | null
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string
        }
        Update: {
          account_holder_name?: string
          account_number_encrypted?: string
          account_number_last_4?: string
          account_type?: string
          bank_code?: string | null
          bank_id?: string | null
          bank_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_used_at?: string | null
          linked_at?: string | null
          micro_deposit_amount_1?: number | null
          micro_deposit_amount_2?: number | null
          nickname?: string | null
          routing_number?: string
          updated_at?: string | null
          user_id?: string
          verification_attempts?: number | null
          verification_date?: string | null
          verification_method?: string | null
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_bank_accounts_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "usa_banks_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      id_verifications: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_back_url: string | null
          document_expiry: string | null
          document_front_url: string | null
          document_number_encrypted: string | null
          document_type: string | null
          expires_at: string | null
          failure_reason: string | null
          id: string
          selfie_url: string | null
          status: string
          updated_at: string
          user_id: string
          verification_level: string | null
          verification_score: number | null
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_back_url?: string | null
          document_expiry?: string | null
          document_front_url?: string | null
          document_number_encrypted?: string | null
          document_type?: string | null
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_level?: string | null
          verification_score?: number | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_back_url?: string | null
          document_expiry?: string | null
          document_front_url?: string | null
          document_number_encrypted?: string | null
          document_type?: string | null
          expires_at?: string | null
          failure_reason?: string | null
          id?: string
          selfie_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_level?: string | null
          verification_score?: number | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      loan_applications: {
        Row: {
          admin_notes: string | null
          annual_income: number | null
          approved_amount: number | null
          collateral_description: string | null
          collateral_value: number | null
          created_at: string
          credit_score: number | null
          employment_status: string | null
          first_payment_date: string | null
          funded_at: string | null
          id: string
          interest_rate: number | null
          loan_term_months: number
          loan_type: string
          monthly_payment: number | null
          purpose: string | null
          remaining_balance: number | null
          requested_amount: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          annual_income?: number | null
          approved_amount?: number | null
          collateral_description?: string | null
          collateral_value?: number | null
          created_at?: string
          credit_score?: number | null
          employment_status?: string | null
          first_payment_date?: string | null
          funded_at?: string | null
          id?: string
          interest_rate?: number | null
          loan_term_months: number
          loan_type: string
          monthly_payment?: number | null
          purpose?: string | null
          remaining_balance?: number | null
          requested_amount: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          annual_income?: number | null
          approved_amount?: number | null
          collateral_description?: string | null
          collateral_value?: number | null
          created_at?: string
          credit_score?: number | null
          employment_status?: string | null
          first_payment_date?: string | null
          funded_at?: string | null
          id?: string
          interest_rate?: number | null
          loan_term_months?: number
          loan_type?: string
          monthly_payment?: number | null
          purpose?: string | null
          remaining_balance?: number | null
          requested_amount?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          id: string
          large_transaction_alert: boolean | null
          large_transaction_amount: number | null
          low_balance_alert: boolean | null
          low_balance_threshold: number | null
          payment_reminders: boolean | null
          security_alerts: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          large_transaction_alert?: boolean | null
          large_transaction_amount?: number | null
          low_balance_alert?: boolean | null
          low_balance_threshold?: number | null
          payment_reminders?: boolean | null
          security_alerts?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          large_transaction_alert?: boolean | null
          large_transaction_amount?: number | null
          low_balance_alert?: boolean | null
          low_balance_threshold?: number | null
          payment_reminders?: boolean | null
          security_alerts?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          username: string | null
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
          username?: string | null
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
          username?: string | null
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
      usa_banks_directory: {
        Row: {
          bank_code: string
          bank_name: string
          bank_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          routing_number: string | null
          secondary_color: string | null
          supports_instant_verification: boolean | null
          swift_code: string | null
        }
        Insert: {
          bank_code: string
          bank_name: string
          bank_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          routing_number?: string | null
          secondary_color?: string | null
          supports_instant_verification?: boolean | null
          swift_code?: string | null
        }
        Update: {
          bank_code?: string
          bank_name?: string
          bank_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          routing_number?: string | null
          secondary_color?: string | null
          supports_instant_verification?: boolean | null
          swift_code?: string | null
        }
        Relationships: []
      }
      user_notifications: {
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
          user_id: string
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
          type?: string
          user_id: string
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
          user_id?: string
        }
        Relationships: []
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
      wire_transfers: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          fee_amount: number | null
          from_account_id: string
          id: string
          processed_at: string | null
          processed_by: string | null
          purpose: string | null
          recipient_account: string
          recipient_address: string | null
          recipient_bank: string
          recipient_name: string
          recipient_routing: string | null
          recipient_swift: string | null
          reference_number: string | null
          status: string | null
          transfer_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          fee_amount?: number | null
          from_account_id: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          purpose?: string | null
          recipient_account: string
          recipient_address?: string | null
          recipient_bank: string
          recipient_name: string
          recipient_routing?: string | null
          recipient_swift?: string | null
          reference_number?: string | null
          status?: string | null
          transfer_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          fee_amount?: number | null
          from_account_id?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          purpose?: string | null
          recipient_account?: string
          recipient_address?: string | null
          recipient_bank?: string
          recipient_name?: string
          recipient_routing?: string | null
          recipient_swift?: string | null
          reference_number?: string | null
          status?: string | null
          transfer_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wire_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      generate_application_number: { Args: never; Returns: string }
      get_user_by_username: {
        Args: { _username: string }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      setup_invest_group_overseas_account: { Args: never; Returns: undefined }
      setup_premium_user_accounts: { Args: never; Returns: undefined }
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
