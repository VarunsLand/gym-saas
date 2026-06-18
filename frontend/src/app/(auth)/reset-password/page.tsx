'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/features/auth/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { new_password: '', confirm_password: '' },
  });

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid or missing reset token.');
    }
  }, [token]);

  async function onSubmit(data: ResetPasswordValues) {
    if (!token) return;
    
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await authService.resetPassword({ token, new_password: data.new_password });
      setIsSuccess(true);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setErrorMsg(err?.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token || errorMsg === 'Invalid or missing reset token.') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md border-red-100 dark:border-red-900/50 shadow-sm">
          <CardHeader className="space-y-3 items-center text-center pb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-2">
              <AlertCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/forgot-password" className="w-full">
              <Button className="w-full active:scale-[0.98] transition-transform">
                Request new link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
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
              Password updated successfully
            </CardTitle>
            <CardDescription className="text-base text-slate-600 dark:text-slate-400">
              Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Link href="/login" className="w-full">
              <Button className="w-full active:scale-[0.98] transition-transform">
                Go to login <ArrowRight className="w-4 h-4 ml-2" />
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
            Set new password
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Choose a strong password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 dark:bg-red-900/10 dark:border-red-900/50 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2 text-left">
              <Label htmlFor="new_password">New password</Label>
              <Input 
                id="new_password" 
                type="password" 
                placeholder="••••••••" 
                {...register('new_password')} 
                disabled={isSubmitting}
                className="bg-white dark:bg-slate-950"
              />
              {errors.new_password && (
                <p className="text-sm font-medium text-red-500 dark:text-red-900">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input 
                id="confirm_password" 
                type="password" 
                placeholder="••••••••" 
                {...register('confirm_password')} 
                disabled={isSubmitting}
                className="bg-white dark:bg-slate-950"
              />
              {errors.confirm_password && (
                <p className="text-sm font-medium text-red-500 dark:text-red-900">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full active:scale-[0.98] transition-transform mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
