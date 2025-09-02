import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const majorBanks = [
  { name: 'Bank of America', code: 'BAC', logo: '🏛️' },
  { name: 'Wells Fargo', code: 'WFC', logo: '🐎' },
  { name: 'JPMorgan Chase', code: 'JPM', logo: '🏦' },
  { name: 'Citibank', code: 'CITI', logo: '🌐' },
  { name: 'U.S. Bank', code: 'USB', logo: '🏛️' },
  { name: 'PNC Bank', code: 'PNC', logo: '🏢' },
  { name: 'Capital One', code: 'COF', logo: '🏦' },
  { name: 'TD Bank', code: 'TD', logo: '🍁' },
  { name: 'Regions Bank', code: 'RF', logo: '🏛️' },
  { name: 'Fifth Third Bank', code: '53', logo: '🏦' }
];

interface ExternalAccount {
  id: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  account_holder: string;
  is_verified: boolean;
}

export const ExternalBankTransfer = () => {
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking',
    account_holder: ''
  });
  const [selectedBank, setSelectedBank] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedExternalAccount, setSelectedExternalAccount] = useState('');
  const { toast } = useToast();

  const handleAddExternalAccount = () => {
    if (!newAccount.bank_name || !newAccount.account_number || !newAccount.routing_number || !newAccount.account_holder) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const account: ExternalAccount = {
      id: Math.random().toString(),
      ...newAccount,
      is_verified: false
    };

    setExternalAccounts([...externalAccounts, account]);
    setNewAccount({
      bank_name: '',
      account_number: '',
      routing_number: '',
      account_type: 'checking',
      account_holder: ''
    });
    setShowAddForm(false);
    setSelectedBank('');

    toast({
      title: "External Account Added",
      description: "Your external bank account has been added for verification"
    });
  };

  const handleExternalTransfer = () => {
    if (!selectedExternalAccount || !transferAmount) {
      toast({
        title: "Missing Information", 
        description: "Please select an account and enter amount",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "External Transfer Initiated",
      description: `Transfer of $${transferAmount} to external account initiated. Processing time: 1-3 business days.`
    });

    setTransferAmount('');
    setSelectedExternalAccount('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">External Bank Transfers</h2>
          <p className="text-muted-foreground">Transfer funds to and from external US bank accounts</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="banking-button">
          <Plus className="w-4 h-4 mr-2" />
          Add External Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Form */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              <span>External Transfer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select External Account</Label>
              <Select value={selectedExternalAccount} onValueChange={setSelectedExternalAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose external account" />
                </SelectTrigger>
                <SelectContent>
                  {externalAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.bank_name} - {account.account_type} (...{account.account_number.slice(-4)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Transfer Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <Button 
              onClick={handleExternalTransfer}
              disabled={!selectedExternalAccount || !transferAmount}
              className="w-full banking-button"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Initiate External Transfer
            </Button>

            <p className="text-xs text-muted-foreground">
              External transfers typically take 1-3 business days to complete.
            </p>
          </CardContent>
        </Card>

        {/* External Accounts List */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle>Linked External Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {externalAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No external accounts linked</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(true)}
                  className="mt-4"
                >
                  Add Your First Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {externalAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {majorBanks.find(b => b.name === account.bank_name)?.logo || '🏦'}
                      </div>
                      <div>
                        <p className="font-medium">{account.bank_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.account_type} (...{account.account_number.slice(-4)})
                        </p>
                        <p className="text-sm text-muted-foreground">{account.account_holder}</p>
                      </div>
                    </div>
                    <Badge variant={account.is_verified ? "default" : "secondary"}>
                      {account.is_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-scale-in">
            <CardHeader>
              <CardTitle>Add External Bank Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Bank</Label>
                <Select value={selectedBank} onValueChange={(value) => {
                  setSelectedBank(value);
                  const bank = majorBanks.find(b => b.code === value);
                  if (bank) {
                    setNewAccount(prev => ({ ...prev, bank_name: bank.name }));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {majorBanks.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{bank.logo}</span>
                          <span>{bank.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Account Holder Name</Label>
                <Input
                  value={newAccount.account_holder}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, account_holder: e.target.value }))}
                  placeholder="Full name as it appears on account"
                />
              </div>

              <div>
                <Label>Account Number</Label>
                <Input
                  value={newAccount.account_number}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, account_number: e.target.value }))}
                  placeholder="Account number"
                />
              </div>

              <div>
                <Label>Routing Number</Label>
                <Input
                  value={newAccount.routing_number}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, routing_number: e.target.value }))}
                  placeholder="9-digit routing number"
                />
              </div>

              <div>
                <Label>Account Type</Label>
                <Select 
                  value={newAccount.account_type} 
                  onValueChange={(value) => setNewAccount(prev => ({ ...prev, account_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddExternalAccount}
                  className="flex-1 banking-button"
                >
                  Add Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};