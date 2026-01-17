import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Activity, Search, RefreshCw, User, Send, CreditCard, DollarSign, FileText } from 'lucide-react';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  amount?: number;
  status: string;
  created_at: string;
  type: string;
}

export const UserActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // Combine multiple sources for activity
      const [transfersRes, depositsRes, withdrawalsRes, applicationsRes] = await Promise.all([
        supabase.from('transfers').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('deposit_requests').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('withdraw_requests').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('account_applications').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      const combinedLogs: ActivityLog[] = [];

      // Process transfers
      transfersRes.data?.forEach(t => {
        combinedLogs.push({
          id: t.id,
          user_id: t.user_id,
          action: `${t.transfer_type} Transfer`,
          details: t.description || `Transfer to ${t.recipient_name || 'account'}`,
          amount: t.amount,
          status: t.status || 'pending',
          created_at: t.created_at,
          type: 'transfer'
        });
      });

      // Process deposits
      depositsRes.data?.forEach(d => {
        combinedLogs.push({
          id: d.id,
          user_id: d.user_id,
          action: `${d.method} Deposit`,
          details: d.notes || 'Deposit request',
          amount: d.amount,
          status: d.status || 'pending',
          created_at: d.created_at || new Date().toISOString(),
          type: 'deposit'
        });
      });

      // Process withdrawals
      withdrawalsRes.data?.forEach(w => {
        combinedLogs.push({
          id: w.id,
          user_id: w.user_id,
          action: `${w.method} Withdrawal`,
          details: `To: ${w.destination}`,
          amount: w.amount,
          status: w.status || 'pending',
          created_at: w.created_at || new Date().toISOString(),
          type: 'withdrawal'
        });
      });

      // Process applications
      applicationsRes.data?.forEach(a => {
        combinedLogs.push({
          id: a.id,
          user_id: a.user_id || 'guest',
          action: `${a.application_type} Application`,
          details: `${a.first_name} ${a.last_name} - ${a.email}`,
          amount: a.initial_deposit_amount || undefined,
          status: a.status,
          created_at: a.created_at || new Date().toISOString(),
          type: 'application'
        });
      });

      // Sort by date
      combinedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setLogs(combinedLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer': return <Send className="h-4 w-4 text-blue-500" />;
      case 'deposit': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <CreditCard className="h-4 w-4 text-orange-500" />;
      case 'application': return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity Logs
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchActivityLogs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={`${log.type}-${log.id}`}>
                    <TableCell>{getTypeIcon(log.type)}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.details}</TableCell>
                    <TableCell>
                      {log.amount ? `$${log.amount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
