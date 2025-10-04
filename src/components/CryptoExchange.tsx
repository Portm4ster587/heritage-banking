import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bitcoin, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CryptoExchange = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cryptoAssets, setCryptoAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCryptoData();
    }
  }, [user]);

  const fetchCryptoData = async () => {
    try {
      const { data } = await supabase
        .from('crypto_assets')
        .select('*')
        .order('market_cap', { ascending: false });

      setCryptoAssets(data || []);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading crypto data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Crypto Exchange</h2>
        <Button onClick={fetchCryptoData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exchange Crypto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm">Amount</label>
            <Input type="number" placeholder="0.00" />
          </div>
          <Button className="w-full">
            <Bitcoin className="w-4 h-4 mr-2" />
            Exchange
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {cryptoAssets.map((asset) => (
          <Card key={asset.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{asset.name}</p>
                  <p className="text-sm text-muted-foreground">{asset.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${asset.current_price?.toFixed(2) || '0.00'}</p>
                  <p className={`text-sm ${asset.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.price_change_24h?.toFixed(2) || '0.00'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
