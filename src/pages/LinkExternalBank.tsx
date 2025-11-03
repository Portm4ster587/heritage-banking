import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Building2, Landmark, Shield, Search, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Bank {
  id: string;
  bank_name: string;
  bank_code: string;
  routing_number: string;
  bank_type: string;
  primary_color: string;
  secondary_color: string;
}

export default function LinkExternalBank() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredBanks(
        banks.filter(bank =>
          bank.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.bank_code.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredBanks(banks);
    }
  }, [searchTerm, banks]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('usa_banks_directory')
        .select('*')
        .eq('is_active', true)
        .order('bank_name');

      if (error) throw error;
      setBanks(data || []);
      setFilteredBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: "Error Loading Banks",
        description: "Failed to load banks directory",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    navigate('/link-external-bank/connect', { state: { bank } });
  };

  const getBankIcon = (type: string) => {
    switch (type) {
      case 'credit_union':
        return <Shield className="w-8 h-8" />;
      case 'online':
        return <LinkIcon className="w-8 h-8" />;
      default:
        return <Building2 className="w-8 h-8" />;
    }
  };

  const getBankTypeColor = (type: string) => {
    switch (type) {
      case 'credit_union':
        return 'bg-green-500/10 text-green-700';
      case 'online':
        return 'bg-blue-500/10 text-blue-700';
      default:
        return 'bg-heritage-blue/10 text-heritage-blue';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-heritage-blue via-heritage-blue-dark to-heritage-blue py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-heritage-gold hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-heritage-blue rounded-full flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-heritage-gold" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-heritage-blue">Link External Bank Account</CardTitle>
                  <CardDescription className="text-lg">Connect accounts from other banks securely</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white/95 backdrop-blur mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search banks by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Banks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-gold mx-auto"></div>
            <p className="text-white mt-4">Loading banks...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBanks.map((bank) => (
              <Card
                key={bank.id}
                className="bg-white/95 backdrop-blur hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => handleBankSelect(bank)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: bank.primary_color + '15',
                        color: bank.primary_color
                      }}
                    >
                      {getBankIcon(bank.bank_type)}
                    </div>
                    <Badge className={getBankTypeColor(bank.bank_type)}>
                      {bank.bank_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-heritage-blue mb-2 group-hover:text-heritage-gold transition-colors">
                    {bank.bank_name}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Code: <span className="font-mono font-semibold">{bank.bank_code}</span></p>
                    {bank.routing_number && (
                      <p>Routing: <span className="font-mono">{bank.routing_number}</span></p>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4 bg-heritage-blue hover:bg-heritage-blue-dark text-heritage-gold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBankSelect(bank);
                    }}
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect Account
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredBanks.length === 0 && !loading && (
          <Card className="bg-white/95 backdrop-blur">
            <CardContent className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-heritage-blue mb-2">No Banks Found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="bg-heritage-blue/10 backdrop-blur mt-6 border-heritage-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-heritage-gold flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-heritage-blue mb-1">Bank-Level Security</h4>
                <p className="text-sm text-heritage-blue/70">
                  Your account information is encrypted and protected with industry-leading security standards. 
                  We use bank-level encryption and never store your login credentials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}