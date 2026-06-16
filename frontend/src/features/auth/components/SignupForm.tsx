'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const signupSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { signup, isSigningUp } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      business_name: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    },
  });

  function onSubmit(data: SignupValues) {
    signup(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="business_name">Business Name</Label>
        <Input id="business_name" placeholder="Acme Corp" {...register('business_name')} />
        {errors.business_name && <p className="text-sm font-medium text-red-500 dark:text-red-900">{errors.business_name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" placeholder="John" {...register('first_name')} />
          {errors.first_name && <p className="text-sm font-medium text-red-500 dark:text-red-900">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" placeholder="Doe" {...register('last_name')} />
          {errors.last_name && <p className="text-sm font-medium text-red-500 dark:text-red-900">{errors.last_name.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
        {errors.email && <p className="text-sm font-medium text-red-500 dark:text-red-900">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="text-sm font-medium text-red-500 dark:text-red-900">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isSigningUp}>
        {isSigningUp ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
