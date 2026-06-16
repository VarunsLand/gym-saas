'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import api from '@/services/api';
import { useCreateTask } from '../hooks/useTasks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const taskSchema = z.object({
  assigned_to: z.string().min(1, 'Assignee is required'),
  due_date: z.date(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function CreateTaskDialog({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: createTask, isPending } = useCreateTask(leadId);

  // Fetch users for the assignment dropdown
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const users = usersData?.data?.users || [];

  const { handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      assigned_to: "",
    }
  });

  const selectedAssignee = watch('assigned_to');
  const selectedDate = watch('due_date');

  const onSubmit = (data: TaskFormValues) => {
    createTask({
      assigned_to: data.assigned_to,
      due_date: data.due_date.toISOString(),
    }, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Schedule Task</Button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Follow-up Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          
          <div className="space-y-2 flex flex-col">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger render={
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              } />
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue('due_date', date)}
                />
              </PopoverContent>
            </Popover>
            {errors.due_date && <p className="text-xs text-red-500">{errors.due_date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select 
              value={selectedAssignee || ""} 
              onValueChange={(val) => setValue('assigned_to', val as string)}
              disabled={isLoadingUsers}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select user"} />
              </SelectTrigger>
              <SelectContent>
                {users.map((u: { id: string; first_name: string; last_name: string }) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.first_name} {u.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigned_to && <p className="text-xs text-red-500">{errors.assigned_to.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Schedule Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
