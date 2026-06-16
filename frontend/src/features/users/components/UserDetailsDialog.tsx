'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUpdateUserRole } from '../hooks/useUsers';
import { User, UserRole } from '../types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function UserDetailsDialog({ user, children }: { user: User; children: React.ReactElement }) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const { mutate: updateRole, isPending } = useUpdateUserRole();

  const isSelf = currentUser?.id === user.id;

  const handleRoleChange = (newRole: UserRole) => {
    updateRole({ id: user.id, data: { role: newRole } }, {
      onSuccess: () => {
        toast.success(`Role updated to ${newRole}`);
      },
      onError: (error: Error) => {
        const message = (error as import('axios').AxiosError<{ message?: string }>).response?.data?.message || 'Failed to update role';
        toast.error(message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Profile Overview (Read-Only) */}
          <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-base font-semibold">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created Date</p>
              <p className="text-base">{format(new Date(user.created_at), 'PPP')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={user.status === 'INACTIVE' ? 'secondary' : 'default'} className="mt-1">
                {user.status || 'ACTIVE'}
              </Badge>
            </div>
          </div>

          {/* Role Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Workspace Role</Label>
              {isSelf && (
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                  <ShieldAlert className="w-3 h-3 mr-1" />
                  Self
                </Badge>
              )}
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger render={
                  <div className="w-full">
                    <Select 
                      value={user.role} 
                      onValueChange={(val) => handleRoleChange(val as UserRole)}
                      disabled={isSelf || isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STAFF">
                          <div className="flex items-center">
                            Staff
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center">
                            <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                } />
                {isSelf && (
                  <TooltipContent side="top">
                    <p>You cannot modify your own role.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            <p className="text-xs text-muted-foreground mt-2">
              Admins have full access to workspace settings and user management.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
