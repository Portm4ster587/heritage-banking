import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, Wallet, Edit, Save, RefreshCw, Copy, QrCode } from 'lucide-react';

interface CryptoWallet {
  id: string;
  currency: string;
  currency_name: string;
  wallet_address: string;
  network: string;
  is_active: boolean;
  qr_code_url: string | null;
  created_at: string;
}

export const AdminCryptoWallets = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_crypto_wallets')
        .select('*')
        .order('currency');

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast({
        title: "Error",
        description: "Failed to load crypto wallets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWallet = async () => {
    if (!editingWallet || !newAddress) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_crypto_wallets')
        .update({ 
          wallet_address: newAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingWallet.id);

      if (error) throw error;

      toast({
        title: "Wallet Updated",
        description: `${editingWallet.currency} wallet address has been updated`,
      });

      fetchWallets();
      setEditingWallet(null);
      setNewAddress('');
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast({
        title: "Error",
        description: "Failed to update wallet",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleWalletStatus = async (wallet: CryptoWallet) => {
    try {
      const { error } = await supabase
        .from('admin_crypto_wallets')
        .update({ is_active: !wallet.is_active })
        .eq('id', wallet.id);

      if (error) throw error;

      toast({
        title: wallet.is_active ? "Wallet Disabled" : "Wallet Enabled",
        description: `${wallet.currency} deposits are now ${wallet.is_active ? 'disabled' : 'enabled'}`,
      });

      fetchWallets();
    } catch (error) {
      console.error('Error toggling wallet:', error);
      toast({
        title: "Error",
        description: "Failed to update wallet status",
        variant: "destructive"
      });
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const getCryptoIcon = (currency: string) => {
    const icons: Record<string, string> = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT': '₮',
      'USDC': '$',
      'LTC': 'Ł',
      'BNB': '💰'
    };
    return icons[currency] || '🪙';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Crypto Deposit Wallets
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage cryptocurrency wallet addresses for user deposits
          </p>
        </div>
        <Button variant="outline" onClick={fetchWallets}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <TableRow key={wallet.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCryptoIcon(wallet.currency)}</span>
                      <div>
                        <p className="font-medium">{wallet.currency}</p>
                        <p className="text-xs text-muted-foreground">{wallet.currency_name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{wallet.network}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                        {wallet.wallet_address === 'pending_admin_setup' 
                          ? '⚠️ Not configured' 
                          : wallet.wallet_address}
                      </code>
                      {wallet.wallet_address !== 'pending_admin_setup' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyAddress(wallet.wallet_address)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={wallet.is_active}
                        onCheckedChange={() => toggleWalletStatus(wallet)}
                      />
                      <Badge variant={wallet.is_active ? "default" : "secondary"}>
                        {wallet.is_active ? "Active" : "Disabled"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingWallet(wallet);
                        setNewAddress(wallet.wallet_address === 'pending_admin_setup' ? '' : wallet.wallet_address);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Wallet Dialog */}
      <Dialog open={!!editingWallet} onOpenChange={() => setEditingWallet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{editingWallet && getCryptoIcon(editingWallet.currency)}</span>
              Edit {editingWallet?.currency} Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={editingWallet?.currency_name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Network</Label>
              <Input value={editingWallet?.network || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input
                placeholder="Enter your wallet address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Users will send deposits to this address
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingWallet(null)}>
              Cancel
            </Button>
            <Button onClick={updateWallet} disabled={saving || !newAddress}>
              {saving ? "Saving..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Address
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
