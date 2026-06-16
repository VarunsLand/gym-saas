'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateInteraction } from '../hooks/useInteractions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const interactionSchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE']),
  notes: z.string().min(1, 'Notes are required'),
});

type InteractionFormValues = z.infer<typeof interactionSchema>;

export function CreateInteractionDialog({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: createInteraction, isPending } = useCreateInteraction(leadId);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: 'CALL',
      notes: '',
    },
  });

  const selectedType = watch('type');

  const onSubmit = (data: InteractionFormValues) => {
    createInteraction(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Log Interaction</Button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Interaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Interaction Type</Label>
            <Select 
              value={selectedType} 
              onValueChange={(val) => {
                if (val) setValue('type', val as "CALL" | "EMAIL" | "MEETING" | "NOTE");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CALL">Call</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="MEETING">Meeting</SelectItem>
                <SelectItem value="NOTE">Note</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Enter details..." 
              className="min-h-[100px]"
              {...register('notes')} 
            />
            {errors.notes && <p className="text-xs text-red-500">{errors.notes.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Interaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
