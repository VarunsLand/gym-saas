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

const EXPENSE_CATEGORIES = [
  'RENT', 'ELECTRICITY', 'TRAINER_SALARY', 'EQUIPMENT', 
  'MAINTENANCE', 'MARKETING', 'INTERNET', 'OTHER'
];

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('RENT');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { category: string; amount: number; notes: string; date: string }) => {
      const response = await api.post('/expenses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardAnalytics'] });
      toast.success('Expense recorded successfully!');
      setOpen(false);
      setCategory('RENT'); setAmount(''); setNotes(''); setDate(new Date().toISOString().split('T')[0]);
    },
    onError: (error: unknown) => {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Failed to record expense');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return toast.error('Please enter amount');
    mutation.mutate({ category, amount: parseFloat(amount), notes, date: new Date(date).toISOString() });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" className="bg-rose-600 hover:bg-rose-500 text-white gap-2 rounded-xl" />
        }
      >
        <Plus className="w-4 h-4" /> Add Expense
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-100">Log an Expense</DialogTitle>
          <DialogDescription className="text-slate-400">
            Record a new business expense.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Category</Label>
            <Select value={category} onValueChange={(val) => { if (val) setCategory(val); }}>
              <SelectTrigger className="bg-slate-900/50 border-white/10 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace('_', ' ')}
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
            <Label className="text-slate-300">Notes (Optional)</Label>
            <Input 
              value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-slate-900/50 border-white/10 text-slate-100" placeholder="e.g., Internet bill for June"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-slate-300 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-rose-600 hover:bg-rose-500 text-white">
              {mutation.isPending ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
