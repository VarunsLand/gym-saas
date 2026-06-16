'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeadSource } from '../types';
import { format } from 'date-fns';
import { PlusCircle, Search, Tags } from 'lucide-react';

interface LeadSourcesSettingsProps {
  sources: LeadSource[];
  isLoading: boolean;
  onCreate: (data: { name: string }) => void;
  isCreating: boolean;
}

export function LeadSourcesSettings({ sources, isLoading, onCreate, isCreating }: LeadSourcesSettingsProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [newSourceName, setNewSourceName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [localError, setLocalError] = useState('');

  const filteredSources = sources.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    const trimmedName = newSourceName.trim();
    if (!trimmedName) {
      setLocalError('Lead source name cannot be empty');
      return;
    }

    // Check for duplicates (case-insensitive)
    const isDuplicate = sources.some(s => s.name.toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      setLocalError('A lead source with this name already exists');
      return;
    }

    onCreate({ name: trimmedName });
    setNewSourceName('');
  };

  if (isLoading) {
    return <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse h-[300px]"></div>;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-slate-200/60 dark:border-slate-800/60 overflow-hidden mt-6">
      <div className="p-6 border-b flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold leading-none tracking-tight">Lead Sources</h3>
          <p className="text-sm text-muted-foreground mt-2">Manage where your leads are coming from.</p>
        </div>
        
        {isAdmin && (
          <form onSubmit={handleCreate} className="flex items-start gap-2 w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full md:w-64">
              <Input 
                placeholder="New lead source name" 
                value={newSourceName} 
                onChange={(e) => {
                  setNewSourceName(e.target.value);
                  setLocalError('');
                }}
                disabled={isCreating}
              />
              {localError && <span className="text-xs text-destructive">{localError}</span>}
            </div>
            <Button type="submit" disabled={isCreating || !newSourceName.trim()} size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add
            </Button>
          </form>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search sources..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>

        {filteredSources.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-4">
              <Tags className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No lead sources found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {searchQuery ? 'No lead sources match your search.' : 'Add your first lead source above to start tracking where leads come from.'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Source Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSources.map((source) => (
                  <tr key={source.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{source.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${source.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                        {source.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(source.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
