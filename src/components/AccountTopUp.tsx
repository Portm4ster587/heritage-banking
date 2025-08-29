import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, Bitcoin, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  lastFour: string;
  routingNumber: string;
}

const mockBanks: BankAccount[] = [
  {
    id: "1",
    bankName: "Chase Bank",
    accountType: "Checking",
    lastFour: "1234",
    routingNumber: "021000021"
  },
  {
    id: "2", 
    bankName: "Bank of America",
    accountType: "Savings",
    lastFour: "5678",
    routingNumber: "011401533"
  },
  {
    id: "3",
    bankName: "Wells Fargo",
    accountType: "Checking", 
    lastFour: "9012",
    routingNumber: "121000248"
  }
];

export const AccountTopUp = () => {
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");
  const [cryptoWallet, setCryptoWallet] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [topUpMethod, setTopUpMethod] = useState<string>("crypto");
  const { toast } = useToast();

  const handleTopUp = async (method: string) => {
    if (!topUpAmount) {
      toast({
        title: "Amount Required",
        description: "Please enter an amount to top up",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(topUpAmount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      if (method === "crypto") {
        toast({
          title: "Crypto Top-Up Initiated",
          description: `Processing $${amount} crypto deposit. Check your crypto wallet for confirmation.`,
        });
      } else if (method === "bank") {
        if (!selectedBank) {
          toast({
            title: "Bank Required",
            description: "Please select a bank account",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
        toast({
          title: "Bank Transfer Initiated", 
          description: `Processing $${amount} transfer from your selected bank account.`,
        });
      } else if (method === "card") {
        if (!cardNumber || !expiryDate || !cvv) {
          toast({
            title: "Card Details Required",
            description: "Please fill in all card details",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
        toast({
          title: "Card Payment Processed",
          description: `Successfully added $${amount} to your account via card payment.`,
        });
      }

      // Reset form
      setTopUpAmount("");
      setSelectedBank("");
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setCryptoWallet("");
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="animate-slide-up">
        <h2 className="text-3xl font-bold text-primary mb-2">Account Top-Up</h2>
        <p className="text-muted-foreground">Add funds to your Heritage Bank account using multiple payment methods</p>
      </div>

      <Card className="banking-card">
        <CardHeader>
          <CardTitle>Fund Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Top-Up Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>

            {/* Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="target-account">Destination Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account to fund" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Personal Checking (...1234)</SelectItem>
                  <SelectItem value="savings">Personal Savings (...5678)</SelectItem>
                  <SelectItem value="business">Business Checking (...9012)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Tabs */}
            <Tabs value={topUpMethod} onValueChange={setTopUpMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
                <TabsTrigger value="card">Debit/Credit Card</TabsTrigger>
              </TabsList>

              {/* Crypto Top-Up */}
              <TabsContent value="crypto" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bitcoin className="h-5 w-5 text-orange-500" />
                      <span>Cryptocurrency Top-Up</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <p className="text-sm text-orange-800">
                        Crypto payments are processed instantly but may have network fees
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Supported Cryptocurrencies</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['BTC', 'ETH', 'USDT', 'LTC'].map((crypto) => (
                          <Badge key={crypto} variant="outline" className="justify-center p-2">
                            {crypto}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleTopUp('crypto')}
                      disabled={isProcessing}
                      className="w-full banking-button"
                    >
                      {isProcessing ? "Processing..." : "Pay with Crypto"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bank Transfer */}
              <TabsContent value="bank" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <span>Bank Account Transfer</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Your Bank</Label>
                      <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockBanks.map((bank) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.bankName} - {bank.accountType} (...{bank.lastFour})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        Bank transfers are secure and typically process within 1-3 business days
                      </p>
                    </div>

                    <Button 
                      onClick={() => handleTopUp('bank')}
                      disabled={isProcessing}
                      className="w-full banking-button"
                    >
                      {isProcessing ? "Processing..." : "Transfer from Bank"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Card Payment */}
              <TabsContent value="card" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <span>Debit/Credit Card</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm text-green-800">
                        Card payments are processed instantly and securely encrypted
                      </p>
                    </div>

                    <Button 
                      onClick={() => handleTopUp('card')}
                      disabled={isProcessing}
                      className="w-full banking-button"
                    >
                      {isProcessing ? "Processing..." : "Pay with Card"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Recent Top-Ups */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle>Recent Top-Ups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Card Payment</p>
                  <p className="text-sm text-muted-foreground">January 15, 2024</p>
                </div>
              </div>
              <div className="text-right">  
                <p className="font-semibold text-green-600">+$500.00</p>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Bitcoin className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Crypto (BTC)</p>
                  <p className="text-sm text-muted-foreground">January 10, 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+$1,250.00</p>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">January 8, 2024</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">+$2,000.00</p>
                <Badge variant="secondary">Processing</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};