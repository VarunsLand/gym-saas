'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { useLeads } from '@/features/leads/hooks/useLeads';

export function AddSaleDialog() {
  const [open, setOpen] = useState(false);
  const [leadId, setLeadId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('MEMBERSHIP_PURCHASE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const queryClient = useQueryClient();
  const { data: leadsData } = useLeads();
  const leads = leadsData?.data?.leads || [];

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/sales', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      toast.success('Sale recorded successfully!');
      setOpen(false);
      // Reset form
      setLeadId(''); setAmount(''); setType('MEMBERSHIP_PURCHASE'); setDate(new Date().toISOString().split('T')[0]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !amount) return toast.error('Please fill required fields');
    mutation.mutate({ lead_id: leadId, amount: parseFloat(amount), type, date: new Date(date).toISOString() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 rounded-xl" />
        }
      >
        <Plus className="w-4 h-4" /> Add Sale
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Record a Sale</DialogTitle>
          <DialogDescription className="text-slate-400">
            Log a new membership purchase or renewal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Member</Label>
            <Select value={leadId} onValueChange={(val) => { if (val) setLeadId(val); }} required>
              <SelectTrigger className="bg-slate-900/50 border-white/10 text-slate-100">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead: any) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.first_name} {lead.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Amount ($)</Label>
              <Input 
                type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                className="bg-slate-900/50 border-white/10 text-slate-100" placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Date</Label>
              <Input 
                type="date" value={date} onChange={e => setDate(e.target.value)} required
                className="bg-slate-900/50 border-white/10 text-slate-100 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Sale Type</Label>
            <Select value={type} onValueChange={(val) => { if (val) setType(val); }}>
              <SelectTrigger className="bg-slate-900/50 border-white/10 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBERSHIP_PURCHASE">New Membership</SelectItem>
                <SelectItem value="MEMBERSHIP_RENEWAL">Renewal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-slate-300 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {mutation.isPending ? 'Saving...' : 'Save Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
