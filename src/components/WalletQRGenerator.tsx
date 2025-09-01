import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet,
  QrCode,
  Copy,
  Download,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';

interface CryptoWallet {
  id: string;
  wallet_type: string;
  wallet_address: string;
  balance: number;
  is_primary: boolean;
  status: string;
}

interface WalletAddress {
  id: string;
  crypto_wallet_id: string;
  address: string;
  qr_code_url: string;
  network: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const WalletQRGenerator = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [addresses, setAddresses] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [customAddress, setCustomAddress] = useState('');

  const cryptoNetworks = [
    { value: 'bitcoin', label: 'Bitcoin (BTC)', prefix: 'bc1' },
    { value: 'ethereum', label: 'Ethereum (ETH)', prefix: '0x' },
    { value: 'tron', label: 'Tron (TRX)', prefix: 'T' },
    { value: 'binance', label: 'Binance Smart Chain', prefix: '0x' },
    { value: 'solana', label: 'Solana (SOL)', prefix: '' },
    { value: 'cardano', label: 'Cardano (ADA)', prefix: 'addr1' },
    { value: 'ripple', label: 'Ripple (XRP)', prefix: 'r' },
  ];

  useEffect(() => {
    if (user) {
      fetchWallets();
      fetchAddresses();
    }
  }, [user]);

  const fetchWallets = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (error) throw error;
      setWallets(data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWalletAddress = (network: string): string => {
    const networkConfig = cryptoNetworks.find(n => n.value === network);
    const prefix = networkConfig?.prefix || '';
    
    // Generate a realistic looking address for demo purposes
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let address = prefix;
    
    const addressLength = network === 'ethereum' || network === 'binance' ? 42 : 
                         network === 'bitcoin' ? 62 : 
                         network === 'solana' ? 44 : 34;
    
    for (let i = prefix.length; i < addressLength; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return address;
  };

  const generateQRCode = async () => {
    if (!selectedWallet || !selectedNetwork) {
      toast({
        title: "Missing Information",
        description: "Please select a wallet and network",
        variant: "destructive"
      });
      return;
    }

    setGeneratingQR(true);
    
    try {
      const address = customAddress || generateWalletAddress(selectedNetwork);
      
      // Generate QR code URL (using a QR code service)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${address}`;
      
      const { data, error } = await supabase
        .from('wallet_addresses')
        .insert([{
          user_id: user?.id,
          crypto_wallet_id: selectedWallet,
          address: address,
          qr_code_url: qrCodeUrl,
          network: selectedNetwork,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "QR Code Generated!",
        description: "Wallet address and QR code have been created successfully",
      });

      setCustomAddress('');
      fetchAddresses();
      
      // Create admin notification if user is not admin
      if (!isAdmin) {
        await supabase.rpc('create_admin_notification', {
          notification_type: 'wallet_created',
          notification_title: 'New Wallet Address Generated',
          notification_message: `User generated a new ${selectedNetwork} wallet address: ${address.slice(0, 10)}...`,
          ref_user_id: user?.id,
          notification_priority: 'normal'
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingQR(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const downloadQR = (qrUrl: string, network: string) => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${network}-wallet-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h2 className="text-2xl font-semibold">Wallet QR Generator</h2>
          <p className="text-muted-foreground">Generate QR codes for your crypto wallet addresses</p>
        </div>
        {isAdmin && (
          <Badge variant="secondary" className="gap-1">
            <Eye className="w-4 h-4" />
            Admin View
          </Badge>
        )}
      </div>

      {/* QR Generator */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generate New QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Select Wallet</label>
              <Select value={selectedWallet} onValueChange={setSelectedWallet}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.wallet_type.toUpperCase()} Wallet
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Network</label>
              <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose network" />
                </SelectTrigger>
                <SelectContent>
                  {cryptoNetworks.map((network) => (
                    <SelectItem key={network.value} value={network.value}>
                      {network.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Custom Address (Optional)</label>
            <Input
              placeholder="Enter custom address or leave empty to auto-generate"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
            />
          </div>

          <Button 
            onClick={generateQRCode} 
            disabled={generatingQR || !selectedWallet || !selectedNetwork}
            className="w-full gap-2"
          >
            {generatingQR ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {generatingQR ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Addresses */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Generated Wallet Addresses</h3>
        
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Addresses Generated</h3>
              <p className="text-muted-foreground">
                Generate your first wallet QR code to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addresses.map((address) => (
              <Card key={address.id} className="banking-card hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{address.network}</CardTitle>
                    <Badge variant="outline">{address.network.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border">
                      <img 
                        src={address.qr_code_url} 
                        alt={`${address.network} QR Code`}
                        className="w-32 h-32"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs text-muted-foreground">WALLET ADDRESS</label>
                    <p className="text-sm font-mono bg-muted/20 p-2 rounded break-all">
                      {address.address}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => copyAddress(address.address)}
                      className="flex-1 gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadQR(address.qr_code_url, address.network)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      QR
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    Created {new Date(address.created_at).toLocaleDateString()}
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