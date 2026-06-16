'use client';

import { useSettings } from '@/features/settings/hooks/useSettings';
import { WorkspaceProfileSettings } from '@/features/settings/components/WorkspaceProfileSettings';
import { LeadSourcesSettings } from '@/features/settings/components/LeadSourcesSettings';

export default function SettingsPage() {
  const { 
    profile, 
    isProfileLoading, 
    updateProfile, 
    isUpdatingProfile,
    leadSources,
    isLeadSourcesLoading,
    createLeadSource,
    isCreatingLeadSource
  } = useSettings();

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Workspace Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your workspace configuration and preferences.
          </p>
        </div>

        <WorkspaceProfileSettings 
          profile={profile}
          isLoading={isProfileLoading}
          onUpdate={updateProfile}
          isUpdating={isUpdatingProfile}
        />

        <LeadSourcesSettings
          sources={leadSources}
          isLoading={isLeadSourcesLoading}
          onCreate={createLeadSource}
          isCreating={isCreatingLeadSource}
        />
      </div>
    </div>
  );
}
