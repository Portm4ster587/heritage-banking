import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Eye,
  Edit,
  AlertTriangle,
  Building,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
  Ban,
  Unlock,
  Shield,
  Activity,
  TrendingUp,
  Wallet,
  Send,
  History,
  Undo2,
  Receipt,
  Landmark,
  PiggyBank,
  Mail,
  BadgeCheck,
  Percent,
  CalendarDays,
  UserCheck,
  FileCheck,
  Globe,
  Bitcoin
} from 'lucide-react';
import { AdminCryptoWallets } from './AdminCryptoWallets';
import { AdminWireTransfers } from './AdminWireTransfers';
import { AdminACHTransfers } from './AdminACHTransfers';

interface UserAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  balance: number;
  status: string;
  routing_number: string;
  created_at: string;
  email?: string;
}

interface Transfer {
  id: string;
  user_id: string;
  amount: number;
  status: string | null;
  transfer_type: string;
  description: string | null;
  recipient_name: string | null;
  recipient_account: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  created_at: string;
  approved_by_admin_id: string | null;
}

interface Application {
  id: string;
  user_id: string | null;
  application_type: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  application_number: string;
  submitted_at: string | null;
  annual_income: number | null;
  initial_deposit_amount: number | null;
  admin_notes: string | null;
}

interface DepositRequest {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  method: string;
  status: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string | null;
}

interface WithdrawRequest {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  method: string;
  destination: string;
  status: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string | null;
}

interface CardData {
  id: string;
  user_id: string;
  account_id: string;
  card_number: string;
  card_type: string;
  card_network: string;
  last4: string;
  expiry_date: string;
  status: string | null;
  activation_status: string | null;
  spending_limit: number | null;
  is_locked: boolean | null;
  created_at: string | null;
}

interface LoanApplication {
  id: string;
  user_id: string;
  loan_type: string;
  requested_amount: number;
  approved_amount: number | null;
  interest_rate: number | null;
  loan_term_months: number;
  status: string;
  purpose: string | null;
  annual_income: number | null;
  credit_score: number | null;
  admin_notes: string | null;
  created_at: string;
}

interface IdVerification {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  verification_level: string | null;
  document_type: string | null;
  verification_score: number | null;
  failure_reason: string | null;
  admin_notes: string | null;
  created_at: string;
}

export const FullAdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data states
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [idVerifications, setIdVerifications] = useState<IdVerification[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    pendingTransfers: 0,
    pendingApplications: 0,
    todayTransactions: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    activeCards: 0,
    pendingLoans: 0,
    pendingVerifications: 0
  });

  // Dialog states
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawRequest | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<IdVerification | null>(null);
  const [balanceAdjustment, setBalanceAdjustment] = useState('');
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [loanInterestRate, setLoanInterestRate] = useState('');
  const [loanApprovedAmount, setLoanApprovedAmount] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
      const cleanup = setupRealtimeSubscriptions();
      return cleanup;
    }
  }, [isAdmin]);

  const setupRealtimeSubscriptions = () => {
    const transfersChannel = supabase
      .channel('admin-transfers')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transfers' },
        () => {
          fetchTransfers();
          fetchStats();
        }
      )
      .subscribe();

    const accountsChannel = supabase
      .channel('admin-accounts')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'accounts' },
        () => {
          fetchAccounts();
          fetchStats();
        }
      )
      .subscribe();

    const applicationsChannel = supabase
      .channel('admin-applications')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'account_applications' },
        () => fetchApplications()
      )
      .subscribe();

    const depositsChannel = supabase
      .channel('admin-deposits')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deposit_requests' },
        () => {
          fetchDeposits();
          fetchStats();
        }
      )
      .subscribe();

    const withdrawalsChannel = supabase
      .channel('admin-withdrawals')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'withdraw_requests' },
        () => {
          fetchWithdrawals();
          fetchStats();
        }
      )
      .subscribe();

    const cardsChannel = supabase
      .channel('admin-cards')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        () => fetchCards()
      )
      .subscribe();

    return () => {
      transfersChannel.unsubscribe();
      accountsChannel.unsubscribe();
      applicationsChannel.unsubscribe();
      depositsChannel.unsubscribe();
      withdrawalsChannel.unsubscribe();
      cardsChannel.unsubscribe();
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAccounts(),
      fetchTransfers(),
      fetchApplications(),
      fetchDeposits(),
      fetchWithdrawals(),
      fetchCards(),
      fetchLoanApplications(),
      fetchIdVerifications(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('account_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('deposit_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdraw_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const fetchLoanApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoanApplications(data || []);
    } catch (error) {
      console.error('Error fetching loan applications:', error);
    }
  };

  const fetchIdVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('id_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdVerifications(data || []);
    } catch (error) {
      console.error('Error fetching ID verifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [accountsRes, transfersRes, applicationsRes, depositsRes, withdrawalsRes, cardsRes, loansRes, verificationsRes] = await Promise.all([
        supabase.from('accounts').select('balance, user_id'),
        supabase.from('transfers').select('status, created_at'),
        supabase.from('account_applications').select('status'),
        supabase.from('deposit_requests').select('status'),
        supabase.from('withdraw_requests').select('status'),
        supabase.from('cards').select('status'),
        supabase.from('loan_applications').select('status'),
        supabase.from('id_verifications').select('status')
      ]);

      const uniqueUsers = new Set(accountsRes.data?.map(a => a.user_id) || []);
      const totalBalance = accountsRes.data?.reduce((sum, a) => sum + (a.balance || 0), 0) || 0;
      const pendingTransfers = transfersRes.data?.filter(t => t.status === 'pending_approval').length || 0;
      const pendingApplications = applicationsRes.data?.filter(a => a.status === 'pending').length || 0;
      const pendingDeposits = depositsRes.data?.filter(d => d.status === 'pending').length || 0;
      const pendingWithdrawals = withdrawalsRes.data?.filter(w => w.status === 'pending').length || 0;
      const activeCards = cardsRes.data?.filter(c => c.status === 'active').length || 0;
      const pendingLoans = loansRes.data?.filter(l => l.status === 'pending').length || 0;
      const pendingVerifications = verificationsRes.data?.filter(v => v.status === 'pending').length || 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTransactions = transfersRes.data?.filter(t => new Date(t.created_at) >= today).length || 0;

      setStats({
        totalUsers: uniqueUsers.size,
        totalBalance,
        pendingTransfers,
        pendingApplications,
        todayTransactions,
        pendingDeposits,
        pendingWithdrawals,
        activeCards,
        pendingLoans,
        pendingVerifications
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Send Email Notification
  const sendEmailNotification = async (to: string, subject: string, type: string, data: any) => {
    try {
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: { to, subject, type, data }
      });
      if (error) throw error;
      console.log('Email notification sent to:', to);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  // Account Management Functions
  const updateAccountStatus = async (accountId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Account Updated",
        description: `Account status changed to ${status}`,
      });

      fetchAccounts();
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive"
      });
    }
  };

  const adjustAccountBalance = async () => {
    if (!selectedAccount || !balanceAdjustment) return;

    try {
      const adjustment = parseFloat(balanceAdjustment);
      const newBalance = selectedAccount.balance + adjustment;

      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccount.id);

      if (error) throw error;

      // Log the adjustment as a transfer
      await supabase.from('transfers').insert({
        user_id: selectedAccount.user_id,
        amount: Math.abs(adjustment),
        transfer_type: adjustment > 0 ? 'credit_adjustment' : 'debit_adjustment',
        status: 'completed',
        description: adjustmentNote || `Admin balance adjustment: ${adjustment > 0 ? '+' : ''}${adjustment}`,
        to_account_id: adjustment > 0 ? selectedAccount.id : null,
        from_account_id: adjustment < 0 ? selectedAccount.id : null,
        approved_by_admin_id: user?.id
      });

      toast({
        title: "Balance Adjusted",
        description: `New balance: $${newBalance.toLocaleString()}`,
      });

      fetchAccounts();
      fetchTransfers();
      setSelectedAccount(null);
      setBalanceAdjustment('');
      setAdjustmentNote('');
    } catch (error) {
      console.error('Error adjusting balance:', error);
      toast({
        title: "Error",
        description: "Failed to adjust balance",
        variant: "destructive"
      });
    }
  };

  // Transfer Management Functions
  const approveTransfer = async (transferId: string) => {
    try {
      const transfer = transfers.find(t => t.id === transferId);
      if (!transfer) return;

      // Update transfer status
      const { error: transferError } = await supabase
        .from('transfers')
        .update({ 
          status: 'completed',
          approved_by_admin_id: user?.id,
          completed_at: new Date().toISOString()
        })
        .eq('id', transferId);

      if (transferError) throw transferError;

      // Deduct from source account
      if (transfer.from_account_id) {
        const { data: fromAccount } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transfer.from_account_id)
          .single();
        
        if (fromAccount) {
          await supabase
            .from('accounts')
            .update({ balance: fromAccount.balance - transfer.amount })
            .eq('id', transfer.from_account_id);
        }
      }

      // Create notification for user
      await supabase.from('user_notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer',
        title: 'Transfer Approved',
        message: `Your transfer of $${transfer.amount.toLocaleString()} has been approved and completed.`,
        priority: 'high'
      });

      toast({
        title: "Transfer Approved",
        description: "Transfer has been completed successfully",
      });

      fetchTransfers();
      fetchAccounts();
      setSelectedTransfer(null);
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast({
        title: "Error",
        description: "Failed to approve transfer",
        variant: "destructive"
      });
    }
  };

  const rejectTransfer = async (transferId: string, reason: string) => {
    try {
      const transfer = transfers.find(t => t.id === transferId);
      if (!transfer) return;

      const { error } = await supabase
        .from('transfers')
        .update({ 
          status: 'rejected',
          description: `${transfer.description || ''} - Rejected: ${reason}`
        })
        .eq('id', transferId);

      if (error) throw error;

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: transfer.user_id,
        type: 'transfer',
        title: 'Transfer Rejected',
        message: `Your transfer of $${transfer.amount.toLocaleString()} was rejected. Reason: ${reason}`,
        priority: 'high'
      });

      toast({
        title: "Transfer Rejected",
        description: "User has been notified",
      });

      fetchTransfers();
      setSelectedTransfer(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting transfer:', error);
      toast({
        title: "Error",
        description: "Failed to reject transfer",
        variant: "destructive"
      });
    }
  };

  // Application Management Functions
  const approveApplication = async (applicationId: string) => {
    try {
      const application = applications.find(a => a.id === applicationId);
      if (!application) return;

      // Update application status
      const { error } = await supabase
        .from('account_applications')
        .update({ 
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          approval_date: new Date().toISOString(),
          admin_notes: adminNote || 'Approved by admin'
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Create account for user if user_id exists
      if (application.user_id) {
        const accountNumber = `${application.application_type.toUpperCase().slice(0, 3)}${Date.now()}`;
        
        await supabase.from('accounts').insert({
          user_id: application.user_id,
          account_number: accountNumber,
          account_type: application.application_type,
          routing_number: '021000021',
          balance: application.initial_deposit_amount || 0,
          status: 'active'
        });

        // Notify user
        await supabase.from('user_notifications').insert({
          user_id: application.user_id,
          type: 'application',
          title: 'Application Approved!',
          message: `Your ${application.application_type} application has been approved. Your new account is ready.`,
          priority: 'high'
        });
      }

      toast({
        title: "Application Approved",
        description: "Account has been created for the user",
      });

      fetchApplications();
      fetchAccounts();
      setSelectedApplication(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive"
      });
    }
  };

  const rejectApplication = async (applicationId: string, reason: string) => {
    try {
      const application = applications.find(a => a.id === applicationId);
      if (!application) return;

      const { error } = await supabase
        .from('account_applications')
        .update({ 
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
          admin_notes: adminNote
        })
        .eq('id', applicationId);

      if (error) throw error;

      if (application.user_id) {
        await supabase.from('user_notifications').insert({
          user_id: application.user_id,
          type: 'application',
          title: 'Application Update',
          message: `Your ${application.application_type} application could not be approved. Reason: ${reason}`,
          priority: 'normal'
        });
      }

      toast({
        title: "Application Rejected",
        description: "Applicant has been notified",
      });

      fetchApplications();
      setSelectedApplication(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive"
      });
    }
  };

  // Deposit Management Functions
  const approveDeposit = async (depositId: string) => {
    try {
      const deposit = deposits.find(d => d.id === depositId);
      if (!deposit) return;

      // Update deposit status
      const { error } = await supabase
        .from('deposit_requests')
        .update({ 
          status: 'completed',
          processed_by_admin_id: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', depositId);

      if (error) throw error;

      // Add to account balance
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', deposit.account_id)
        .single();

      if (account) {
        await supabase
          .from('accounts')
          .update({ balance: account.balance + deposit.amount })
          .eq('id', deposit.account_id);
      }

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: deposit.user_id,
        type: 'transaction',
        title: 'Deposit Approved',
        message: `Your deposit of $${deposit.amount.toLocaleString()} has been approved and credited to your account.`,
        priority: 'high'
      });

      toast({
        title: "Deposit Approved",
        description: "Funds have been credited to the account",
      });

      fetchDeposits();
      fetchAccounts();
      setSelectedDeposit(null);
    } catch (error) {
      console.error('Error approving deposit:', error);
      toast({ title: "Error", description: "Failed to approve deposit", variant: "destructive" });
    }
  };

  const rejectDeposit = async (depositId: string, reason: string) => {
    try {
      const deposit = deposits.find(d => d.id === depositId);
      if (!deposit) return;

      const { error } = await supabase
        .from('deposit_requests')
        .update({ 
          status: 'rejected',
          notes: reason,
          processed_by_admin_id: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', depositId);

      if (error) throw error;

      await supabase.from('user_notifications').insert({
        user_id: deposit.user_id,
        type: 'transaction',
        title: 'Deposit Rejected',
        message: `Your deposit of $${deposit.amount.toLocaleString()} was rejected. Reason: ${reason}`,
        priority: 'high'
      });

      toast({ title: "Deposit Rejected", description: "User has been notified" });
      fetchDeposits();
      setSelectedDeposit(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting deposit:', error);
      toast({ title: "Error", description: "Failed to reject deposit", variant: "destructive" });
    }
  };

  // Withdrawal Management Functions
  const approveWithdrawal = async (withdrawalId: string) => {
    try {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) return;

      // Check balance first
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', withdrawal.account_id)
        .single();

      if (!account || account.balance < withdrawal.amount) {
        toast({ title: "Insufficient Funds", description: "Account balance is too low", variant: "destructive" });
        return;
      }

      // Update withdrawal status
      const { error } = await supabase
        .from('withdraw_requests')
        .update({ 
          status: 'completed',
          processed_by_admin_id: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      // Deduct from account balance
      await supabase
        .from('accounts')
        .update({ balance: account.balance - withdrawal.amount })
        .eq('id', withdrawal.account_id);

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: withdrawal.user_id,
        type: 'transaction',
        title: 'Withdrawal Approved',
        message: `Your withdrawal of $${withdrawal.amount.toLocaleString()} has been processed.`,
        priority: 'high'
      });

      toast({ title: "Withdrawal Approved", description: "Funds have been deducted" });
      fetchWithdrawals();
      fetchAccounts();
      setSelectedWithdrawal(null);
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({ title: "Error", description: "Failed to approve withdrawal", variant: "destructive" });
    }
  };

  const rejectWithdrawal = async (withdrawalId: string, reason: string) => {
    try {
      const withdrawal = withdrawals.find(w => w.id === withdrawalId);
      if (!withdrawal) return;

      const { error } = await supabase
        .from('withdraw_requests')
        .update({ 
          status: 'rejected',
          notes: reason,
          processed_by_admin_id: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId);

      if (error) throw error;

      await supabase.from('user_notifications').insert({
        user_id: withdrawal.user_id,
        type: 'transaction',
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of $${withdrawal.amount.toLocaleString()} was rejected. Reason: ${reason}`,
        priority: 'high'
      });

      toast({ title: "Withdrawal Rejected", description: "User has been notified" });
      fetchWithdrawals();
      setSelectedWithdrawal(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({ title: "Error", description: "Failed to reject withdrawal", variant: "destructive" });
    }
  };

  // Refund Function
  const issueRefund = async (transferId: string) => {
    try {
      const transfer = transfers.find(t => t.id === transferId);
      if (!transfer || transfer.status !== 'completed') return;

      // Refund to source account
      if (transfer.from_account_id) {
        const { data: fromAccount } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transfer.from_account_id)
          .single();

        if (fromAccount) {
          await supabase
            .from('accounts')
            .update({ balance: fromAccount.balance + transfer.amount })
            .eq('id', transfer.from_account_id);
        }
      }

      // Mark original transfer as refunded
      await supabase
        .from('transfers')
        .update({ status: 'refunded', description: `${transfer.description || ''} - REFUNDED: ${refundReason}` })
        .eq('id', transferId);

      // Create refund record
      await supabase.from('transfers').insert({
        user_id: transfer.user_id,
        amount: transfer.amount,
        transfer_type: 'refund',
        status: 'completed',
        description: `Refund for transfer ${transfer.id.slice(0, 8)}: ${refundReason}`,
        to_account_id: transfer.from_account_id,
        approved_by_admin_id: user?.id
      });

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: transfer.user_id,
        type: 'transaction',
        title: 'Refund Issued',
        message: `A refund of $${transfer.amount.toLocaleString()} has been credited to your account.`,
        priority: 'high'
      });

      toast({ title: "Refund Issued", description: "Funds have been returned to the account" });
      fetchTransfers();
      fetchAccounts();
      setSelectedTransfer(null);
      setRefundReason('');
    } catch (error) {
      console.error('Error issuing refund:', error);
      toast({ title: "Error", description: "Failed to issue refund", variant: "destructive" });
    }
  };

  // Card Management Functions
  const updateCardStatus = async (cardId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ status, activation_status: status === 'active' ? 'activated' : 'inactive' })
        .eq('id', cardId);

      if (error) throw error;

      const card = cards.find(c => c.id === cardId);
      if (card) {
        await supabase.from('user_notifications').insert({
          user_id: card.user_id,
          type: 'info',
          title: 'Card Status Updated',
          message: `Your card ending in ${card.last4} has been ${status === 'active' ? 'activated' : status}.`,
          priority: 'normal'
        });
      }

      toast({ title: "Card Updated", description: `Card status changed to ${status}` });
      fetchCards();
      setSelectedCard(null);
    } catch (error) {
      console.error('Error updating card:', error);
      toast({ title: "Error", description: "Failed to update card", variant: "destructive" });
    }
  };

  // Loan Management Functions
  const approveLoan = async (loanId: string) => {
    try {
      const loan = loanApplications.find(l => l.id === loanId);
      if (!loan) return;

      const approvedAmt = parseFloat(loanApprovedAmount) || loan.requested_amount;
      const interestRate = parseFloat(loanInterestRate) || 8.5;
      const monthlyPayment = (approvedAmt * (1 + (interestRate / 100) * (loan.loan_term_months / 12))) / loan.loan_term_months;

      const { error } = await supabase
        .from('loan_applications')
        .update({
          status: 'approved',
          approved_amount: approvedAmt,
          interest_rate: interestRate,
          monthly_payment: monthlyPayment,
          remaining_balance: approvedAmt,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNote
        })
        .eq('id', loanId);

      if (error) throw error;

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: loan.user_id,
        type: 'application',
        title: 'Loan Approved!',
        message: `Your ${loan.loan_type.replace('_', ' ')} for $${approvedAmt.toLocaleString()} has been approved at ${interestRate}% APR.`,
        priority: 'high'
      });

      toast({ title: "Loan Approved", description: `$${approvedAmt.toLocaleString()} at ${interestRate}% APR` });
      fetchLoanApplications();
      setSelectedLoan(null);
      setLoanInterestRate('');
      setLoanApprovedAmount('');
      setAdminNote('');
    } catch (error) {
      console.error('Error approving loan:', error);
      toast({ title: "Error", description: "Failed to approve loan", variant: "destructive" });
    }
  };

  const rejectLoan = async (loanId: string, reason: string) => {
    try {
      const loan = loanApplications.find(l => l.id === loanId);
      if (!loan) return;

      const { error } = await supabase
        .from('loan_applications')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: reason
        })
        .eq('id', loanId);

      if (error) throw error;

      await supabase.from('user_notifications').insert({
        user_id: loan.user_id,
        type: 'application',
        title: 'Loan Application Update',
        message: `Your ${loan.loan_type.replace('_', ' ')} application was not approved. Reason: ${reason}`,
        priority: 'normal'
      });

      toast({ title: "Loan Rejected", description: "Applicant has been notified" });
      fetchLoanApplications();
      setSelectedLoan(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast({ title: "Error", description: "Failed to reject loan", variant: "destructive" });
    }
  };

  // ID Verification Functions
  const approveVerification = async (verificationId: string) => {
    try {
      const verification = idVerifications.find(v => v.id === verificationId);
      if (!verification) return;

      const { error } = await supabase
        .from('id_verifications')
        .update({
          status: 'verified',
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          verification_score: 100,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          admin_notes: adminNote
        })
        .eq('id', verificationId);

      if (error) throw error;

      await supabase.from('user_notifications').insert({
        user_id: verification.user_id,
        type: 'info',
        title: 'Identity Verified!',
        message: 'Your identity has been successfully verified. You now have full access to all Heritage Bank features.',
        priority: 'high'
      });

      toast({ title: "Identity Verified", description: "User now has full access" });
      fetchIdVerifications();
      setSelectedVerification(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({ title: "Error", description: "Failed to verify identity", variant: "destructive" });
    }
  };

  const rejectVerification = async (verificationId: string, reason: string) => {
    try {
      const verification = idVerifications.find(v => v.id === verificationId);
      if (!verification) return;

      const { error } = await supabase
        .from('id_verifications')
        .update({
          status: 'failed',
          failure_reason: reason,
          admin_notes: adminNote
        })
        .eq('id', verificationId);

      if (error) throw error;

      await supabase.from('user_notifications').insert({
        user_id: verification.user_id,
        type: 'info',
        title: 'Verification Update',
        message: `Your identity verification could not be completed. Reason: ${reason}`,
        priority: 'high'
      });

      toast({ title: "Verification Rejected", description: "User has been notified" });
      fetchIdVerifications();
      setSelectedVerification(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({ title: "Error", description: "Failed to reject verification", variant: "destructive" });
    }
  };

  const pendingLoansList = loanApplications.filter(l => l.status === 'pending');
  const pendingVerificationsList = idVerifications.filter(v => v.status === 'pending');

  // Filter functions
  const filteredAccounts = accounts.filter(a => 
    a.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.account_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransfers = transfers.filter(t =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transfer_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApplications = applications.filter(a =>
    a.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.application_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTransfers = transfers.filter(t => t.status === 'pending_approval');
  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Administration</h1>
          <p className="text-muted-foreground">Full banking ecosystem management</p>
        </div>
        <Button onClick={fetchAllData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Users</p>
                <p className="text-lg font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-bold">${(stats.totalBalance / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.pendingTransfers > 0 ? 'from-orange-500/10 border-orange-500/40' : 'from-muted/10'}`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Send className="w-6 h-6 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Transfers</p>
                <p className="text-lg font-bold">{stats.pendingTransfers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.pendingApplications > 0 ? 'from-purple-500/10 border-purple-500/40' : 'from-muted/10'}`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Applications</p>
                <p className="text-lg font-bold">{stats.pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.pendingDeposits > 0 ? 'from-emerald-500/10 border-emerald-500/40' : 'from-muted/10'}`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-6 h-6 text-emerald-500" />
              <div>
                <p className="text-xs text-muted-foreground">Deposits</p>
                <p className="text-lg font-bold">{stats.pendingDeposits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.pendingWithdrawals > 0 ? 'from-red-500/10 border-red-500/40' : 'from-muted/10'}`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Withdrawals</p>
                <p className="text-lg font-bold">{stats.pendingWithdrawals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/10 border-indigo-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="text-xs text-muted-foreground">Cards</p>
                <p className="text-lg font-bold">{stats.activeCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 border-cyan-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-500" />
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-lg font-bold">{stats.todayTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search accounts, transfers, applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="accounts" className="text-xs">Accounts ({accounts.length})</TabsTrigger>
          <TabsTrigger value="transfers" className="text-xs relative">
            Transfers
            {stats.pendingTransfers > 0 && <Badge className="ml-1 h-5 bg-orange-500 text-[10px]">{stats.pendingTransfers}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="deposits" className="text-xs relative">
            Deposits
            {stats.pendingDeposits > 0 && <Badge className="ml-1 h-5 bg-emerald-500 text-[10px]">{stats.pendingDeposits}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs relative">
            Withdrawals
            {stats.pendingWithdrawals > 0 && <Badge className="ml-1 h-5 bg-red-500 text-[10px]">{stats.pendingWithdrawals}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="applications" className="text-xs relative">
            Applications
            {stats.pendingApplications > 0 && <Badge className="ml-1 h-5 bg-purple-500 text-[10px]">{stats.pendingApplications}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="loans" className="text-xs relative">
            Loans
            {stats.pendingLoans > 0 && <Badge className="ml-1 h-5 bg-amber-500 text-[10px]">{stats.pendingLoans}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="verifications" className="text-xs relative">
            KYC
            {stats.pendingVerifications > 0 && <Badge className="ml-1 h-5 bg-blue-500 text-[10px]">{stats.pendingVerifications}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="cards" className="text-xs">Cards ({cards.length})</TabsTrigger>
          <TabsTrigger value="wire-transfers" className="text-xs">
            <Send className="w-3 h-3 mr-1" />Wire
          </TabsTrigger>
          <TabsTrigger value="ach-transfers" className="text-xs">
            <Landmark className="w-3 h-3 mr-1" />ACH
          </TabsTrigger>
          <TabsTrigger value="crypto-wallets" className="text-xs">
            <Bitcoin className="w-3 h-3 mr-1" />Crypto
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Pending Transfer Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingTransfers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending transfers</p>
                ) : (
                  <div className="space-y-3">
                    {pendingTransfers.slice(0, 5).map(transfer => (
                      <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {transfer.transfer_type} • {transfer.recipient_name || 'External'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => approveTransfer(transfer.id)} className="bg-green-500 hover:bg-green-600">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setSelectedTransfer(transfer)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transfers.slice(0, 5).map(transfer => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {transfer.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : transfer.status === 'rejected' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">${transfer.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transfer.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                        {transfer.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map(account => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.account_number}</TableCell>
                      <TableCell className="capitalize">{account.account_type.replace('_', ' ')}</TableCell>
                      <TableCell className="font-mono text-xs">{account.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${account.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.status === 'active' ? 'default' : 'destructive'}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedAccount(account)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {account.status === 'active' ? (
                            <Button size="sm" variant="ghost" onClick={() => updateAccountStatus(account.id, 'frozen')}>
                              <Ban className="w-4 h-4 text-red-500" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => updateAccountStatus(account.id, 'active')}>
                              <Unlock className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map(transfer => (
                    <TableRow key={transfer.id}>
                      <TableCell>{format(new Date(transfer.created_at), 'MMM dd, HH:mm')}</TableCell>
                      <TableCell className="capitalize">{transfer.transfer_type.replace('_', ' ')}</TableCell>
                      <TableCell>{transfer.recipient_name || 'Internal'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${transfer.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transfer.status === 'completed' ? 'default' :
                          transfer.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transfer.status === 'pending_approval' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => approveTransfer(transfer.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedTransfer(transfer)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        {transfer.status !== 'pending_approval' && (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTransfer(transfer)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-mono text-xs">{app.application_number}</TableCell>
                      <TableCell>{app.first_name} {app.last_name}</TableCell>
                      <TableCell className="capitalize">{app.application_type.replace('_', ' ')}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>${(app.annual_income || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          app.status === 'approved' ? 'default' :
                          app.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {app.status === 'pending' ? (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => approveApplication(app.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedApplication(app)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedApplication(app)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deposits Tab */}
        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                Deposit Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map(deposit => (
                    <TableRow key={deposit.id}>
                      <TableCell>{deposit.created_at ? format(new Date(deposit.created_at), 'MMM dd, HH:mm') : '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{deposit.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{deposit.method}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        +${deposit.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={deposit.status === 'completed' ? 'default' : deposit.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deposit.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => approveDeposit(deposit.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedDeposit(deposit)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {deposits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No deposit requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-red-500" />
                Withdrawal Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map(withdrawal => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>{withdrawal.created_at ? format(new Date(withdrawal.created_at), 'MMM dd, HH:mm') : '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{withdrawal.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{withdrawal.method}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{withdrawal.destination}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        -${withdrawal.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={withdrawal.status === 'completed' ? 'default' : withdrawal.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => approveWithdrawal(withdrawal.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedWithdrawal(withdrawal)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {withdrawals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No withdrawal requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-500" />
                Card Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.map(card => (
                    <TableRow key={card.id}>
                      <TableCell className="font-mono">**** {card.last4}</TableCell>
                      <TableCell className="capitalize">{card.card_type}</TableCell>
                      <TableCell className="capitalize">{card.card_network}</TableCell>
                      <TableCell>{card.expiry_date}</TableCell>
                      <TableCell>${(card.spending_limit || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={card.status === 'active' ? 'default' : card.status === 'blocked' ? 'destructive' : 'secondary'}>
                          {card.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {card.status !== 'active' ? (
                            <Button size="sm" variant="ghost" onClick={() => updateCardStatus(card.id, 'active')}>
                              <Unlock className="w-4 h-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => updateCardStatus(card.id, 'blocked')}>
                              <Ban className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cards.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No cards found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-amber-500" />
                Loan Applications
              </CardTitle>
              <CardDescription>Review and manage loan requests with interest rate configuration</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanApplications.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell>{format(new Date(loan.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="capitalize">{loan.loan_type.replace('_', ' ')}</TableCell>
                      <TableCell className="font-semibold">${loan.requested_amount.toLocaleString()}</TableCell>
                      <TableCell>{loan.loan_term_months} months</TableCell>
                      <TableCell>${(loan.annual_income || 0).toLocaleString()}</TableCell>
                      <TableCell>{loan.credit_score || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          loan.status === 'approved' || loan.status === 'funded' ? 'default' :
                          loan.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loan.status === 'pending' ? (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => setSelectedLoan(loan)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => { setSelectedLoan(loan); setAdminNote(''); }}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedLoan(loan)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {loanApplications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No loan applications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Verifications Tab */}
        <TabsContent value="verifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-500" />
                ID Verifications (KYC)
              </CardTitle>
              <CardDescription>Review identity verification submissions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {idVerifications.map(verification => (
                    <TableRow key={verification.id}>
                      <TableCell>{format(new Date(verification.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-mono text-xs">{verification.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{verification.verification_type.replace('_', ' ')}</TableCell>
                      <TableCell className="capitalize">{verification.verification_level || 'basic'}</TableCell>
                      <TableCell className="capitalize">{verification.document_type || 'N/A'}</TableCell>
                      <TableCell>{verification.verification_score || 'Pending'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          verification.status === 'verified' ? 'default' :
                          verification.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {verification.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {verification.status === 'pending' ? (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => approveVerification(verification.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedVerification(verification)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedVerification(verification)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {idVerifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No ID verifications found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wire Transfers Tab */}
        <TabsContent value="wire-transfers">
          <AdminWireTransfers />
        </TabsContent>

        {/* ACH Transfers Tab */}
        <TabsContent value="ach-transfers">
          <AdminACHTransfers />
        </TabsContent>

        {/* Crypto Wallets Tab */}
        <TabsContent value="crypto-wallets">
          <AdminCryptoWallets />
        </TabsContent>

        {/* All Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Complete Transaction History</CardTitle>
              <CardDescription>All transfers and transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map(transfer => (
                    <TableRow key={transfer.id}>
                      <TableCell>{format(new Date(transfer.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell className="font-mono text-xs">{transfer.user_id.slice(0, 8)}...</TableCell>
                      <TableCell className="capitalize">{transfer.transfer_type.replace('_', ' ')}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{transfer.description || '-'}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${transfer.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transfer.status === 'completed' ? 'default' :
                          transfer.status === 'rejected' || transfer.status === 'refunded' ? 'destructive' : 'secondary'
                        }>
                          {transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transfer.status === 'completed' && transfer.transfer_type !== 'refund' && (
                          <Button size="sm" variant="ghost" onClick={() => setSelectedTransfer(transfer)}>
                            <Undo2 className="w-4 h-4 text-orange-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Edit Dialog */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Account</DialogTitle>
            <DialogDescription>
              Account: {selectedAccount?.account_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Account Type</Label>
                  <p className="font-medium capitalize">{selectedAccount.account_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Current Balance</Label>
                  <p className="font-medium text-lg">${selectedAccount.balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Balance Adjustment</Label>
                <Input
                  type="number"
                  placeholder="Enter amount (+/-)"
                  value={balanceAdjustment}
                  onChange={(e) => setBalanceAdjustment(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use positive for credit, negative for debit
                </p>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Note</Label>
                <Textarea
                  placeholder="Reason for adjustment..."
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={adjustAccountBalance} disabled={!balanceAdjustment}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Apply Adjustment
                </Button>
                {selectedAccount.status === 'active' ? (
                  <Button variant="destructive" onClick={() => updateAccountStatus(selectedAccount.id, 'frozen')}>
                    <Ban className="w-4 h-4 mr-2" />
                    Freeze Account
                  </Button>
                ) : (
                  <Button variant="default" onClick={() => updateAccountStatus(selectedAccount.id, 'active')}>
                    <Unlock className="w-4 h-4 mr-2" />
                    Activate Account
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Reject Dialog */}
      <Dialog open={!!selectedTransfer && selectedTransfer.status === 'pending_approval'} onOpenChange={() => setSelectedTransfer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer</DialogTitle>
            <DialogDescription>
              Transfer of ${selectedTransfer?.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransfer(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedTransfer && rejectTransfer(selectedTransfer.id, adminNote)}
              disabled={!adminNote}
            >
              Reject Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Application #{selectedApplication?.application_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Applicant Name</Label>
                  <p className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                </div>
                <div>
                  <Label>Application Type</Label>
                  <p className="font-medium capitalize">{selectedApplication.application_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedApplication.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedApplication.phone}</p>
                </div>
                <div>
                  <Label>Annual Income</Label>
                  <p className="font-medium">${(selectedApplication.annual_income || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Initial Deposit</Label>
                  <p className="font-medium">${(selectedApplication.initial_deposit_amount || 0).toLocaleString()}</p>
                </div>
              </div>

              {selectedApplication.status === 'pending' && (
                <>
                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Textarea
                      placeholder="Add notes about this application..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-green-500 hover:bg-green-600" onClick={() => approveApplication(selectedApplication.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button variant="destructive" onClick={() => rejectApplication(selectedApplication.id, adminNote || 'Application rejected')}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                </>
              )}

              {selectedApplication.status !== 'pending' && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Status: <Badge>{selectedApplication.status}</Badge>
                  </p>
                  {selectedApplication.admin_notes && (
                    <p className="text-sm mt-2">Notes: {selectedApplication.admin_notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deposit Reject Dialog */}
      <Dialog open={!!selectedDeposit} onOpenChange={() => setSelectedDeposit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit</DialogTitle>
            <DialogDescription>Amount: ${selectedDeposit?.amount.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Rejection reason..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDeposit(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedDeposit && rejectDeposit(selectedDeposit.id, adminNote)} disabled={!adminNote}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Reject Dialog */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>Amount: ${selectedWithdrawal?.amount.toLocaleString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Rejection reason..." value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedWithdrawal && rejectWithdrawal(selectedWithdrawal.id, adminNote)} disabled={!adminNote}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Refund Dialog */}
      <Dialog open={!!selectedTransfer && selectedTransfer.status === 'completed'} onOpenChange={() => setSelectedTransfer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
            <DialogDescription>Refund ${selectedTransfer?.amount.toLocaleString()} to user</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Refund reason..." value={refundReason} onChange={(e) => setRefundReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransfer(null)}>Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => selectedTransfer && issueRefund(selectedTransfer.id)} disabled={!refundReason}>
              <Undo2 className="w-4 h-4 mr-2" />Issue Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loan Approval Dialog */}
      <Dialog open={!!selectedLoan && selectedLoan.status === 'pending'} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-amber-500" />
              Loan Application Review
            </DialogTitle>
            <DialogDescription>
              {selectedLoan?.loan_type.replace('_', ' ')} - ${selectedLoan?.requested_amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requested Amount</Label>
                  <p className="font-medium text-lg">${selectedLoan.requested_amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Loan Term</Label>
                  <p className="font-medium">{selectedLoan.loan_term_months} months</p>
                </div>
                <div>
                  <Label>Annual Income</Label>
                  <p className="font-medium">${(selectedLoan.annual_income || 0).toLocaleString()}</p>
                </div>
                <div>
                  <Label>Credit Score</Label>
                  <p className="font-medium">{selectedLoan.credit_score || 'Not provided'}</p>
                </div>
                <div className="col-span-2">
                  <Label>Purpose</Label>
                  <p className="font-medium">{selectedLoan.purpose || 'Not specified'}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Interest Rate (APR %)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="8.5"
                      value={loanInterestRate}
                      onChange={(e) => setLoanInterestRate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Approved Amount
                    </Label>
                    <Input
                      type="number"
                      placeholder={selectedLoan.requested_amount.toString()}
                      value={loanApprovedAmount}
                      onChange={(e) => setLoanApprovedAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea
                    placeholder="Add notes about this loan..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="bg-green-500 hover:bg-green-600 flex-1" 
                  onClick={() => approveLoan(selectedLoan.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Loan
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => rejectLoan(selectedLoan.id, adminNote || 'Loan application rejected')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Loan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Rejection Dialog */}
      <Dialog open={!!selectedVerification && selectedVerification.status === 'pending'} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>User ID: {selectedVerification?.user_id.slice(0, 8)}...</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea 
              placeholder="Reason for rejection (e.g., document unclear, expired ID)..." 
              value={adminNote} 
              onChange={(e) => setAdminNote(e.target.value)} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVerification(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedVerification && rejectVerification(selectedVerification.id, adminNote)}
              disabled={!adminNote}
            >
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};