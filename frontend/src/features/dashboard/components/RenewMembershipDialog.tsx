'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRenewLead } from '@/features/leads/hooks/useLeads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const renewSchema = z.object({
  duration_months: z.coerce.number().min(1, 'Duration must be at least 1 month'),
  amount: z.coerce.number().min(0, 'Amount must be a positive number'),
  payment_method: z.string().min(1, 'Please select a payment method'),
});

type RenewFormValues = z.infer<typeof renewSchema>;

interface RenewMembershipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: any; // Using any for simplicity here, maps to Lead
}

export function RenewMembershipDialog({ open, onOpenChange, member }: RenewMembershipDialogProps) {
  const { mutate: renewMember, isPending } = useRenewLead();

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<RenewFormValues>({
    resolver: zodResolver(renewSchema),
    defaultValues: {
      duration_months: 1,
      amount: 0,
      payment_method: 'CASH',
    },
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        duration_months: 1,
        amount: 0,
        payment_method: 'CASH',
      });
    }
  }, [open, reset]);

  const onSubmit = (data: RenewFormValues) => {
    if (!member) return;
    renewMember(
      { id: member.id, data },
      {
        onSuccess: () => {
          onOpenChange(false);
          reset();
        },
      }
    );
  };

  if (!member) return null;

  const currentExpiry = member.expiry_date ? new Date(member.expiry_date) : null;
  const isExpired = currentExpiry ? currentExpiry < new Date() : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#0f172a] border-white/10 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Renew Membership</DialogTitle>
        </DialogHeader>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Member</span>
            <span className="font-medium text-slate-200">{member.first_name} {member.last_name}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Current Plan</span>
            <span className="font-medium text-slate-200">{member.service || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Current Expiry</span>
            <span className={`font-medium ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
              {currentExpiry ? format(currentExpiry, 'dd MMM yyyy') : 'No expiry set'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Duration (Months)</Label>
              <Input
                type="number"
                placeholder="1"
                {...register('duration_months')}
                className="bg-slate-950 border-white/10 text-white"
              />
              {errors.duration_months && <p className="text-xs text-red-500">{errors.duration_months.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Amount (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                {...register('amount')}
                className="bg-slate-950 border-white/10 text-white"
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Payment Method</Label>
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.payment_method && <p className="text-xs text-red-500">{errors.payment_method.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-transparent"
            >
              {isPending ? 'Processing...' : 'Confirm Renewal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
