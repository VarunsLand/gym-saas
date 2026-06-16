'use client';

import { UsersList } from '@/features/users/components/UsersList';
import { CreateUserDialog } from '@/features/users/components/CreateUserDialog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UsersPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  // Users page specific protection (ADMIN only)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'ADMIN') {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Users Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your workspace staff and administrator roles.
            </p>
          </div>
          <CreateUserDialog />
        </div>

        {/* Users Table */}
        <section>
          <UsersList />
        </section>
      </div>
    </div>
  );
}
