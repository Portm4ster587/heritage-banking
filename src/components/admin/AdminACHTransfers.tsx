import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Eye, 
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Landmark
} from 'lucide-react';

interface ACHTransfer {
  id: string;
  user_id: string;
  account_id: string;
  external_bank_id: string | null;
  amount: number;
  transfer_direction: string;
  ach_type: string | null;
  status: string | null;
  description: string | null;
  reference_number: string | null;
  scheduled_date: string | null;
  effective_date: string | null;
  admin_notes: string | null;
  created_at: string | null;
  processed_at: string | null;
}

export const AdminACHTransfers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<ACHTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState<ACHTransfer | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchTransfers();
    const channel = supabase
      .channel('admin-ach-transfers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ach_transfers' }, fetchTransfers)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('ach_transfers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching ACH transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveTransfer = async () => {
    if (!selectedTransfer) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('ach_transfers')
        .update({
          status: 'completed',
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
          effective_date: new Date().toISOString().split('T')[0],
          admin_notes: adminNote || 'Approved by admin'
        })
        .eq('id', selectedTransfer.id);

      if (error) throw error;

      // Update account balance based on transfer direction
      const { data: account } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', selectedTransfer.account_id)
        .single();

      if (account) {
        const newBalance = selectedTransfer.transfer_direction === 'inbound'
          ? account.balance + selectedTransfer.amount
          : account.balance - selectedTransfer.amount;

        await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', selectedTransfer.account_id);
      }

      // Notify user
      await supabase.from('user_notifications').insert({
        user_id: selectedTransfer.user_id,
        type: 'transfer',
        title: 'ACH Transfer Completed',
        message: `Your ${selectedTransfer.transfer_direction} ACH transfer of $${selectedTransfer.amount.toLocaleString()} has been processed.`,
        priority: 'high'
      });

      toast({ title: "ACH Transfer Approved", description: "Transfer has been processed" });
      fetchTransfers();
      setSelectedTransfer(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error approving ACH transfer:', error);
      toast({ title: "Error", description: "Failed to approve transfer", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const rejectTransfer = async () => {
    if (!selectedTransfer || !adminNote) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('ach_transfers')
        .update({
          status: 'rejected',
          processed_by: user?.id,
          processed_at: new Date().toISOString(),
          admin_notes: adminNote
        })
        .eq('id', selectedTransfer.id);

      if (error) throw error;

      await supabase.from('user_notifications').insert({
        user_id: selectedTransfer.user_id,
        type: 'transfer',
        title: 'ACH Transfer Rejected',
        message: `Your ACH transfer of $${selectedTransfer.amount.toLocaleString()} was rejected. Reason: ${adminNote}`,
        priority: 'high'
      });

      toast({ title: "ACH Transfer Rejected", description: "User has been notified" });
      fetchTransfers();
      setSelectedTransfer(null);
      setAdminNote('');
    } catch (error) {
      console.error('Error rejecting ACH transfer:', error);
      toast({ title: "Error", description: "Failed to reject transfer", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'processing': return <Badge className="bg-blue-500">Processing</Badge>;
      case 'scheduled': return <Badge className="bg-purple-500">Scheduled</Badge>;
      default: return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>;
    }
  };

  const filteredTransfers = transfers.filter(t =>
    t.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = transfers.filter(t => t.status === 'pending').length;

  if (loading) {
    return <div className="flex items-center justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            ACH Transfers
            {pendingCount > 0 && <Badge variant="destructive">{pendingCount} Pending</Badge>}
          </h3>
          <p className="text-sm text-muted-foreground">Manage ACH transfer requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transfers..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchTransfers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="text-sm">
                    {transfer.created_at && format(new Date(transfer.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {transfer.reference_number || transfer.id.slice(0, 8)}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transfer.transfer_direction === 'inbound' ? (
                        <ArrowDownCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="capitalize">{transfer.transfer_direction}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{transfer.ach_type || 'standard'}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">${transfer.amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedTransfer(transfer)}>
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No ACH transfers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transfer Details Dialog */}
      <Dialog open={!!selectedTransfer} onOpenChange={() => setSelectedTransfer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              ACH Transfer Details
            </DialogTitle>
            <DialogDescription>Review and manage this ACH transfer request</DialogDescription>
          </DialogHeader>
          
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference</p>
                  <p className="font-medium">{selectedTransfer.reference_number || selectedTransfer.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedTransfer.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Direction</p>
                  <div className="flex items-center gap-2">
                    {selectedTransfer.transfer_direction === 'inbound' ? (
                      <ArrowDownCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="capitalize font-medium">{selectedTransfer.transfer_direction}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline" className="capitalize">{selectedTransfer.ach_type || 'standard'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-lg">${selectedTransfer.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Date</p>
                  <p>{selectedTransfer.scheduled_date || 'Immediate'}</p>
                </div>
              </div>

              {selectedTransfer.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{selectedTransfer.description}</p>
                </div>
              )}

              {selectedTransfer.status === 'pending' && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Admin notes (required for rejection)"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedTransfer(null)}>Close</Button>
            {selectedTransfer?.status === 'pending' && (
              <>
                <Button variant="destructive" onClick={rejectTransfer} disabled={!adminNote || processing}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button onClick={approveTransfer} disabled={processing}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
