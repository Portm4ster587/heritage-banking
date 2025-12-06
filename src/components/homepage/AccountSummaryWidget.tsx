import { Eye, EyeOff, Copy, Check, Building2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { HeritageSVGLogo } from "../HeritageSVGLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  routing_number: string;
  status: string;
}

interface AccountSummaryWidgetProps {
  compact?: boolean;
}

export const AccountSummaryWidget = ({ compact = false }: AccountSummaryWidgetProps) => {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [primaryAccount, setPrimaryAccount] = useState<Account | null>(null);

  const heritageRouting = "021000021";

  useEffect(() => {
    if (user) {
      fetchUserAccounts();
    } else {
      // Show demo data for non-logged in users
      setTotalBalance(2333287.00);
      setPrimaryAccount({
        id: 'demo',
        account_number: '8847291034',
        account_type: 'personal_checking',
        balance: 2333287.00,
        routing_number: heritageRouting,
        status: 'active'
      });
      setLoading(false);
    }
  }, [user]);

  const fetchUserAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;

      if (data && data.length > 0) {
        setAccounts(data);
        const total = data.reduce((sum, acc) => sum + (acc.balance || 0), 0);
        setTotalBalance(total);
        setPrimaryAccount(data[0]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const accountNumber = primaryAccount?.account_number || '••••••••';

  if (loading) {
    return (
      <div className={`bg-[#0a1628] rounded-2xl overflow-hidden shadow-2xl border border-heritage-gold/20 ${compact ? 'p-4' : ''}`}>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-heritage-gold animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0a1628] rounded-2xl overflow-hidden shadow-2xl border border-heritage-gold/20 ${compact ? '' : ''}`}>
      {/* Header with Logo */}
      <div className={`bg-gradient-to-r from-[#0d2140] to-[#1a365d] ${compact ? 'p-4' : 'p-6'} border-b border-heritage-gold/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HeritageSVGLogo size={compact ? "sm" : "lg"} className="animate-pulse" />
            <div>
              <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-heritage-gold tracking-wide`}>HERITAGE</h3>
              <p className="text-heritage-gold/80 text-xs">BANK</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-heritage-gold/60 text-xs">Heritage US</p>
            <p className="text-white font-mono text-xs sm:text-sm">Ecosystem Account</p>
          </div>
        </div>
      </div>

      {/* Balance Section - Navy Blue Container */}
      <div className={`bg-[#0d2140] ${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-heritage-gold/80 text-xs sm:text-sm font-medium">Available Balance</p>
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="text-heritage-gold hover:text-heritage-gold/80 transition-colors"
          >
            {showBalance ? <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
        <p className={`${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'} font-bold text-white mb-2 tracking-wide`}>
          {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
        </p>
        <p className="text-heritage-gold/60 text-xs">USD - United States Dollar</p>
        {user && accounts.length > 1 && (
          <p className="text-heritage-gold/80 text-xs mt-2">{accounts.length} active accounts</p>
        )}
      </div>

      {/* Account Details - Navy Blue Container */}
      <div className={`bg-[#0a1628] ${compact ? 'p-4 space-y-3' : 'p-6 space-y-4'}`}>
        {/* Account Number */}
        <div className={`bg-[#0d2140] rounded-xl ${compact ? 'p-3' : 'p-4'} border border-heritage-gold/10`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-heritage-gold/60 text-xs mb-1">Account Number</p>
              <p className={`text-white font-mono ${compact ? 'text-sm' : 'text-base sm:text-lg'} tracking-wider truncate`}>
                {showBalance ? accountNumber : '•••• •••• ••••'}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(accountNumber, 'account')}
              className="text-heritage-gold hover:text-heritage-gold/80 transition-colors p-1 sm:p-2 flex-shrink-0"
            >
              {copied === 'account' ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Routing Number */}
        <div className={`bg-[#0d2140] rounded-xl ${compact ? 'p-3' : 'p-4'} border border-heritage-gold/10`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-heritage-gold/60 text-xs mb-1">Heritage US Routing Number</p>
              <p className={`text-white font-mono ${compact ? 'text-sm' : 'text-base sm:text-lg'} tracking-wider`}>{heritageRouting}</p>
            </div>
            <button
              onClick={() => copyToClipboard(heritageRouting, 'routing')}
              className="text-heritage-gold hover:text-heritage-gold/80 transition-colors p-1 sm:p-2 flex-shrink-0"
            >
              {copied === 'routing' ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Bank Info */}
        <div className={`bg-[#0d2140] rounded-xl ${compact ? 'p-3' : 'p-4'} border border-heritage-gold/10`}>
          <div className="flex items-center space-x-3">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-heritage-gold flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-heritage-gold/60 text-xs">Bank Name</p>
              <p className="text-white font-semibold text-sm sm:text-base truncate">Heritage Bank US</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`bg-gradient-to-r from-[#0d2140] to-[#1a365d] ${compact ? 'p-3' : 'p-4'} border-t border-heritage-gold/20`}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-heritage-gold/60">FDIC Insured • Member FDIC</span>
          <span className="text-heritage-gold font-semibold">Since 1892</span>
        </div>
      </div>
    </div>
  );
};
