'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateUser } from '../hooks/useUsers';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserRole } from '../types';

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['ADMIN', 'STAFF']),
});

type UserFormValues = z.infer<typeof userSchema>;

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createUser, isPending } = useCreateUser();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'STAFF',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: UserFormValues) => {
    createUser(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
        toast.success('User created successfully');
      },
      onError: (error: Error) => {
        const message = (error as import('axios').AxiosError<{ message?: string }>).response?.data?.message || 'Failed to create user';
        toast.error(message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add User</Button>} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...register('first_name')} />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...register('last_name')} />
              {errors.last_name && <p className="text-xs text-red-500">{errors.last_name.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select 
              value={selectedRole} 
              onValueChange={(val) => setValue('role', val as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
