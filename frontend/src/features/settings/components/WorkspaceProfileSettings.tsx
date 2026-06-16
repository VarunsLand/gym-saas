'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkspaceProfile } from '../types';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  industry: z.string().nullable().optional(),
  timezone: z.string().min(1, 'Timezone is required')
});

type ProfileValues = z.infer<typeof profileSchema>;

interface WorkspaceProfileSettingsProps {
  profile?: WorkspaceProfile;
  isLoading: boolean;
  onUpdate: (data: ProfileValues) => void;
  isUpdating: boolean;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
];

export function WorkspaceProfileSettings({ profile, isLoading, onUpdate, isUpdating }: WorkspaceProfileSettingsProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      industry: '',
      timezone: 'UTC'
    }
  });

  const watchTimezone = watch('timezone');

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        industry: profile.industry || '',
        timezone: profile.timezone
      });
    }
  }, [profile, reset]);

  if (isLoading) {
    return <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse h-[300px]"></div>;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold leading-none tracking-tight">Workspace Profile</h3>
        <p className="text-sm text-muted-foreground mt-2">Manage your company&apos;s core configuration and localization settings.</p>
      </div>
      <div className="p-6">
        {!isAdmin && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-md text-sm">
            Your role provides read-only access to workspace settings.
          </div>
        )}
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-6 max-w-xl">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input id="name" placeholder="Acme Corp" {...register('name')} readOnly={!isAdmin} className={!isAdmin ? "bg-muted" : ""} />
            {errors.name && <p className="text-sm font-medium text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" placeholder="Technology, Real Estate, etc." {...register('industry')} readOnly={!isAdmin} className={!isAdmin ? "bg-muted" : ""} />
            {errors.industry && <p className="text-sm font-medium text-destructive">{errors.industry.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Default Timezone</Label>
            <Select 
              disabled={!isAdmin} 
              value={watchTimezone || ''} 
              onValueChange={(val) => { if (val) setValue('timezone', val, { shouldValidate: true }) }}
            >
              <SelectTrigger className={!isAdmin ? "bg-muted" : ""}>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label} ({tz.value})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timezone && <p className="text-sm font-medium text-destructive">{errors.timezone.message}</p>}
          </div>

          {profile?.updated_at && (
            <p className="text-xs text-muted-foreground italic">
              Last updated: {format(new Date(profile.updated_at), 'PPP pp')}
            </p>
          )}

          {isAdmin && (
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
