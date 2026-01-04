import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AccountLookupResult {
  found: boolean;
  accountName?: string;
  bankName?: string;
  accountType?: string;
  isInternal?: boolean;
  verified?: boolean;
  message?: string;
}

export const useAccountLookup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccountLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookupAccount = async (accountNumber: string, routingNumber?: string, bankCode?: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('lookup-account-name', {
        body: { accountNumber, routingNumber, bankCode }
      });

      if (fnError) {
        setError(fnError.message);
        return null;
      }

      setResult(data);
      return data as AccountLookupResult;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return { lookupAccount, loading, result, error, clearResult };
};
