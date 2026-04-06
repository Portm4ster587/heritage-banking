import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import {
  ArrowLeft, User, DollarSign, CreditCard, History, MessageSquare,
  Send, Plus, Edit, Shield, Wallet, Ban, Unlock, Eye, RefreshCw,
  CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react';

interface AdminUserDetailPanelProps {
  userId: string;
  onBack: () => void;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  email?: string;
}

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  status: string | null;
  routing_number: string;
}

interface CardData {
  id: string;
  card_number: string;
  card_type: string;
  card_network: string;
  last4: string;
  expiry_date: string;
  status: string | null;
  spending_limit: number | null;
  is_locked: boolean | null;
  account_id: string;
}

export const AdminUserDetailPanel = ({ userId, onBack }: AdminUserDetailPanelProps) => {
  const { toast } = useToast();
  const { user: adminUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [wireTransfers, setWireTransfers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showBalanceEdit, setShowBalanceEdit] = useState(false);
  const [showInsertHistory, setShowInsertHistory] = useState(false);
  const [showIssueCard, setShowIssueCard] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form states
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [historyAmount, setHistoryAmount] = useState('');
  const [historyType, setHistoryType] = useState('credit');
  const [historyDesc, setHistoryDesc] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [cardNetwork, setCardNetwork] = useState('VISA');
  const [cardType, setCardType] = useState('Debit');
  const [cardLimit, setCardLimit] = useState('5000');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messagePriority, setMessagePriority] = useState('normal');

  useEffect(() => {
    fetchAllUserData();
  }, [userId]);

  const fetchAllUserData = async () => {
    setLoading(true);
    try {
      const [profileRes, accountsRes, cardsRes, transfersRes, wireRes, depositsRes, withdrawalsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('accounts').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
        supabase.from('cards').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('transfers').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
        supabase.from('wire_transfers').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
        supabase.from('deposit_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
        supabase.from('withdraw_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      ]);

      setProfile(profileRes.data);
      setAccounts(accountsRes.data || []);
      setCards(cardsRes.data || []);
      setTransfers(transfersRes.data || []);
      setWireTransfers(wireRes.data || []);
      setDeposits(depositsRes.data || []);
      setWithdrawals(withdrawalsRes.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown' : 'Loading...';
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  // ── Balance Edit ──
  const handleBalanceAdjust = async () => {
    if (!selectedAccount || !balanceAmount) return;
    const adj = parseFloat(balanceAmount);
    const newBal = (selectedAccount.balance || 0) + adj;
    const { error } = await supabase.from('accounts').update({ balance: newBal }).eq('id', selectedAccount.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Balance Updated', description: `New balance: $${newBal.toLocaleString()}` });
      fetchAllUserData();
      setShowBalanceEdit(false);
      setBalanceAmount('');
      setBalanceNote('');
    }
  };

  // ── Account Status ──
  const handleAccountStatus = async (accountId: string, status: string) => {
    const { error } = await supabase.from('accounts').update({ status }).eq('id', accountId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated', description: `Account set to ${status}` });
      fetchAllUserData();
    }
  };

  // ── Insert Transaction History ──
  const handleInsertHistory = async () => {
    if (!selectedAccount || !historyAmount || !historyDesc) return;
    const amount = parseFloat(historyAmount);
    const { error } = await supabase.from('transfers').insert({
      user_id: userId,
      from_account_id: historyType === 'debit' ? selectedAccount.id : null,
      to_account_id: historyType === 'credit' ? selectedAccount.id : null,
      amount,
      description: historyDesc,
      transfer_type: 'admin_adjustment',
      status: 'completed',
      completed_at: historyDate || new Date().toISOString(),
      approved_by_admin_id: adminUser?.id || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Transaction Added', description: `$${amount.toLocaleString()} ${historyType} recorded` });
      fetchAllUserData();
      setShowInsertHistory(false);
      setHistoryAmount('');
      setHistoryDesc('');
      setHistoryDate('');
    }
  };

  // ── Issue Card ──
  const handleIssueCard = async () => {
    if (!selectedAccount) return;
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    const prefix = cardNetwork === 'VISA' ? '4532' : cardNetwork === 'Mastercard' ? '5412' : '3782';
    const cardNum = prefix + Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('') + last4;
    const expMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const expYear = String(new Date().getFullYear() + 4).slice(-2);

    const { error } = await supabase.from('cards').insert({
      user_id: userId,
      account_id: selectedAccount.id,
      card_number: cardNum.slice(0, 4) + '********' + last4,
      card_type: cardType,
      card_network: cardNetwork,
      last4,
      expiry_date: `${expMonth}/${expYear}`,
      status: 'active',
      activation_status: 'activated',
      spending_limit: parseFloat(cardLimit) || 5000,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Card Issued', description: `${cardNetwork} ${cardType} ending in ${last4}` });
      fetchAllUserData();
      setShowIssueCard(false);
    }
  };

  // ── Send System Message ──
  const handleSendMessage = async () => {
    if (!messageTitle || !messageBody) return;
    const { error } = await supabase.from('user_notifications').insert({
      user_id: userId,
      title: messageTitle,
      message: messageBody,
      type: 'system',
      priority: messagePriority,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Message Sent', description: `Notification sent to ${userName}` });
      setShowSendMessage(false);
      setMessageTitle('');
      setMessageBody('');
    }
  };

  const statusBadge = (status: string | null) => {
    const s = status || 'pending';
    const variants: Record<string, string> = {
      active: 'bg-green-500/20 text-green-600',
      completed: 'bg-green-500/20 text-green-600',
      approved: 'bg-green-500/20 text-green-600',
      pending: 'bg-yellow-500/20 text-yellow-600',
      frozen: 'bg-blue-500/20 text-blue-600',
      hold: 'bg-orange-500/20 text-orange-600',
      rejected: 'bg-red-500/20 text-red-600',
      failed: 'bg-red-500/20 text-red-600',
    };
    return <Badge className={variants[s] || 'bg-muted text-muted-foreground'}>{s}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {userName}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">{userId.slice(0, 12)}...</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Balance</p>
          <p className="text-2xl font-bold text-primary">${totalBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => setShowSendMessage(true)}>
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="text-xs">Send Message</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => { setSelectedAccount(accounts[0]); setShowInsertHistory(true); }}>
          <History className="w-5 h-5 text-primary" />
          <span className="text-xs">Insert History</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => { setSelectedAccount(accounts[0]); setShowIssueCard(true); }}>
          <CreditCard className="w-5 h-5 text-primary" />
          <span className="text-xs">Issue Card</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => { setSelectedAccount(accounts[0]); setShowBalanceEdit(true); }}>
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="text-xs">Edit Balance</span>
        </Button>
      </div>

      {/* Profile Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground text-xs">Username</p><p className="font-medium">{profile?.username || 'N/A'}</p></div>
            <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{profile?.phone || 'N/A'}</p></div>
            <div><p className="text-muted-foreground text-xs">City</p><p className="font-medium">{profile?.city || 'N/A'}, {profile?.state || ''}</p></div>
            <div><p className="text-muted-foreground text-xs">Zip</p><p className="font-medium">{profile?.zip_code || 'N/A'}</p></div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="wires">Wires</TabsTrigger>
        </TabsList>

        {/* ── Accounts Tab ── */}
        <TabsContent value="accounts" className="space-y-3">
          {accounts.map((acc) => (
            <Card key={acc.id}>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{acc.account_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    <p className="text-xs text-muted-foreground font-mono">Acct: {acc.account_number} • Rtn: {acc.routing_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold">${(acc.balance || 0).toLocaleString()}</p>
                    {statusBadge(acc.status)}
                    <Select value={acc.status || 'active'} onValueChange={(v) => handleAccountStatus(acc.id, v)}>
                      <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                        <SelectItem value="frozen">Frozen</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedAccount(acc); setShowBalanceEdit(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Cards Tab ── */}
        <TabsContent value="cards" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setSelectedAccount(accounts[0]); setShowIssueCard(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Issue New Card
            </Button>
          </div>
          {cards.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No cards issued</p>
          ) : cards.map((card) => (
            <Card key={card.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-semibold">{card.card_network} {card.card_type}</p>
                      <p className="text-xs text-muted-foreground">****{card.last4} • Exp {card.expiry_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(card.status)}
                    {card.spending_limit && <span className="text-xs text-muted-foreground">Limit: ${card.spending_limit.toLocaleString()}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Transfers Tab ── */}
        <TabsContent value="transfers">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{format(new Date(t.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{t.transfer_type}</Badge></TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{t.description || t.recipient_name || '—'}</TableCell>
                    <TableCell className="font-semibold">${t.amount?.toLocaleString()}</TableCell>
                    <TableCell>{statusBadge(t.status)}</TableCell>
                  </TableRow>
                ))}
                {transfers.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No transfers</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        {/* ── Deposits Tab ── */}
        <TabsContent value="deposits">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...deposits, ...withdrawals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-xs">{format(new Date(d.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{d.method} {d.destination ? '(W)' : '(D)'}</Badge></TableCell>
                    <TableCell className="font-semibold">${d.amount?.toLocaleString()}</TableCell>
                    <TableCell>{statusBadge(d.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        {/* ── Wire Transfers Tab ── */}
        <TabsContent value="wires">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wireTransfers.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="text-xs">{format(new Date(w.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-sm">{w.recipient_name}</TableCell>
                    <TableCell className="text-xs">{w.recipient_bank}</TableCell>
                    <TableCell className="font-semibold">${w.amount?.toLocaleString()}</TableCell>
                    <TableCell>{statusBadge(w.status)}</TableCell>
                  </TableRow>
                ))}
                {wireTransfers.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No wire transfers</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* ── Balance Edit Dialog ── */}
      <Dialog open={showBalanceEdit} onOpenChange={setShowBalanceEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Account Balance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Account</Label>
              <Select value={selectedAccount?.id || ''} onValueChange={(v) => setSelectedAccount(accounts.find(a => a.id === v) || null)}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')} (${a.balance?.toLocaleString()})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (+/-)</Label>
              <Input type="number" step="0.01" value={balanceAmount} onChange={(e) => setBalanceAmount(e.target.value)} placeholder="+1000 or -500" />
            </div>
            <div>
              <Label>Note</Label>
              <Input value={balanceNote} onChange={(e) => setBalanceNote(e.target.value)} placeholder="Reason for adjustment" />
            </div>
            {balanceAmount && selectedAccount && (
              <p className="text-sm font-medium p-3 bg-muted rounded-lg">
                New Balance: ${((selectedAccount.balance || 0) + parseFloat(balanceAmount || '0')).toLocaleString()}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBalanceEdit(false)}>Cancel</Button>
            <Button onClick={handleBalanceAdjust} disabled={!balanceAmount || !selectedAccount}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Insert History Dialog ── */}
      <Dialog open={showInsertHistory} onOpenChange={setShowInsertHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Transaction Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Account</Label>
              <Select value={selectedAccount?.id || ''} onValueChange={(v) => setSelectedAccount(accounts.find(a => a.id === v) || null)}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={historyType} onValueChange={setHistoryType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (+)</SelectItem>
                    <SelectItem value="debit">Debit (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={historyAmount} onChange={(e) => setHistoryAmount(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={historyDesc} onChange={(e) => setHistoryDesc(e.target.value)} placeholder="Wire Transfer from Acme Corp" />
            </div>
            <div>
              <Label>Date (optional, defaults to now)</Label>
              <Input type="datetime-local" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInsertHistory(false)}>Cancel</Button>
            <Button onClick={handleInsertHistory} disabled={!historyAmount || !historyDesc || !selectedAccount}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Issue Card Dialog ── */}
      <Dialog open={showIssueCard} onOpenChange={setShowIssueCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue New Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Link to Account</Label>
              <Select value={selectedAccount?.id || ''} onValueChange={(v) => setSelectedAccount(accounts.find(a => a.id === v) || null)}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.account_type.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Network</Label>
                <Select value={cardNetwork} onValueChange={setCardNetwork}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISA">VISA</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="Amex">Amex</SelectItem>
                    <SelectItem value="Discover">Discover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={cardType} onValueChange={setCardType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                    <SelectItem value="Platinum">Platinum</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Spending Limit</Label>
              <Input type="number" value={cardLimit} onChange={(e) => setCardLimit(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueCard(false)}>Cancel</Button>
            <Button onClick={handleIssueCard} disabled={!selectedAccount}>Issue Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Send Message Dialog ── */}
      <Dialog open={showSendMessage} onOpenChange={setShowSendMessage}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send System Message to {userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} placeholder="Account Update" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} placeholder="Your account has been updated..." rows={4} />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={messagePriority} onValueChange={setMessagePriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendMessage(false)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={!messageTitle || !messageBody}>
              <Send className="w-4 h-4 mr-2" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
