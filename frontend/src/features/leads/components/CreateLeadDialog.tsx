'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateLead } from '../hooks/useLeads';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Controller } from 'react-hook-form';

const leadSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone_number: z.string().min(5, 'Phone number is required'),
  service: z.string().optional(),
  description: z.string().max(5000, 'Description is too long').optional().or(z.literal('')),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export function CreateLeadDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createLead, isPending } = useCreateLead();

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      service: '',
      description: '',
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    // Convert empty string email to undefined to match backend expectations if needed
    const payload = {
      ...data,
      email: data.email === '' ? undefined : data.email,
      service: data.service === '' ? undefined : data.service,
      description: data.description === '' ? undefined : data.description,
    };
    
    createLead(payload, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add New Member</Button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" placeholder="Jane" {...register('first_name')} />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" placeholder="Smith" {...register('last_name')} />
              {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number *</Label>
            <Input id="phone_number" placeholder="+1234567890" {...register('phone_number')} />
            {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Membership Plan</Label>
            <Controller
              control={control}
              name="service"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                    <SelectItem value="Pro Plan">Pro Plan</SelectItem>
                    <SelectItem value="Elite Plan">Elite Plan</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea 
              id="description" 
              placeholder="Add background context, requirements, or general notes about this member..." 
              className="resize-none min-h-[100px]"
              {...register('description')} 
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
