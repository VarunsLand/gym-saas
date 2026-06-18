'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Edit2, Check, X } from 'lucide-react';
import { useUpdateLead } from '../hooks/useLeads';

interface LeadDescriptionCardProps {
  leadId: string;
  description?: string | null;
}

export function LeadDescriptionCard({ leadId, description }: LeadDescriptionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentDesc, setCurrentDesc] = useState(description || '');
  const { mutate: updateLead, isPending } = useUpdateLead();

  const handleSave = () => {
    updateLead(
      { id: leadId, data: { description: currentDesc === '' ? undefined : currentDesc } },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setCurrentDesc(description || '');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4" />
          About Lead
        </CardTitle>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 text-xs text-muted-foreground hover:text-indigo-600">
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={currentDesc}
              onChange={(e) => setCurrentDesc(e.target.value)}
              placeholder="Add background context, requirements, or general notes about this lead..."
              className="min-h-[120px] resize-y bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                {isPending ? 'Saving...' : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 min-h-[80px] whitespace-pre-wrap">
            {description ? description : <span className="text-slate-400 italic">No description provided.</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
