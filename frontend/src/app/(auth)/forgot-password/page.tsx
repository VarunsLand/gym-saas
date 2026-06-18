'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/features/auth/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(data: ForgotPasswordValues) {
    try {
      setIsSubmitting(true);
      await authService.forgotPassword(data);
      // We always show success even if the email doesn't exist (anti-enumeration)
      setIsSuccess(true);
    } catch {
      // Still show success to prevent email enumeration, unless it's a massive network error
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md border-green-100 dark:border-green-900/50 shadow-sm">
          <CardHeader className="space-y-3 items-center text-center pb-6">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Check your inbox
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              If an account exists with that email, a secure reset link has been sent.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full active:scale-[0.98] transition-transform">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-sm border-slate-200/60 dark:border-slate-800/60">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Reset your password
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Enter your email address and we will send you a secure reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                {...register('email')} 
                disabled={isSubmitting}
                className="bg-white dark:bg-slate-950"
              />
              {errors.email && (
                <p className="text-sm font-medium text-red-500 dark:text-red-900">
                  {errors.email.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full active:scale-[0.98] transition-transform" disabled={isSubmitting}>
              {isSubmitting ? 'Sending link...' : 'Send reset link'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Remembered your password?{' '}
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400 font-medium transition-colors hover:text-blue-700">
              Return to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
