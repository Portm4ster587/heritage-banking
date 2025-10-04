import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet,
  RefreshCw,
  Bitcoin
} from 'lucide-react';

interface CryptoWallet {
  id: string;
  asset_symbol: string;
  wallet_address: string | null;
  balance: number | null;
  created_at: string;
  updated_at: string;
}

export const WalletQRGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWallets();
    }
  }, [user]);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Crypto Wallets</h2>
          <p className="text-muted-foreground">View your cryptocurrency wallet addresses</p>
        </div>
        <RefreshCw className="w-5 h-5 text-muted-foreground cursor-pointer" onClick={fetchWallets} />
      </div>

      {/* Crypto Wallets List */}
      <div className="space-y-4">
        {wallets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Crypto Wallets</h3>
              <p className="text-muted-foreground">
                You don't have any crypto wallets yet
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="banking-card hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bitcoin className="w-5 h-5" />
                      {wallet.asset_symbol.toUpperCase()}
                    </CardTitle>
                    <Badge variant="outline">Wallet</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wallet Address */}
                  {wallet.wallet_address && (
                    <div>
                      <label className="text-xs text-muted-foreground">WALLET ADDRESS</label>
                      <p className="text-sm font-mono bg-muted/20 p-2 rounded break-all mt-1">
                        {wallet.wallet_address}
                      </p>
                    </div>
                  )}

                  {/* Balance */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Balance:</span>
                    <span className="text-lg font-bold">
                      {wallet.balance?.toFixed(8) || '0.00000000'} {wallet.asset_symbol.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Created {new Date(wallet.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
