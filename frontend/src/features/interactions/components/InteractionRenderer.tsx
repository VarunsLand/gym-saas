import { formatDistanceToNow } from 'date-fns';
import { PhoneCall, Mail, Users, FileText, MessageSquare, MapPin, Tag } from 'lucide-react';
import { Interaction } from '../types';

interface InteractionRendererProps {
  interaction: Interaction;
  // If true, it means it's displayed globally (Dashboard), so we might want to show Lead name
  showLeadContext?: boolean; 
}

const getIconAndColor = (type: string) => {
  switch (type) {
    case 'CALL':
      return { Icon: PhoneCall, color: 'bg-blue-100 text-blue-600', border: 'border-blue-200' };
    case 'EMAIL':
      return { Icon: Mail, color: 'bg-purple-100 text-purple-600', border: 'border-purple-200' };
    case 'MEETING':
      return { Icon: Users, color: 'bg-orange-100 text-orange-600', border: 'border-orange-200' };
    case 'NOTE':
      return { Icon: FileText, color: 'bg-gray-100 text-gray-600', border: 'border-gray-200' };
    case 'WHATSAPP':
      return { Icon: MessageSquare, color: 'bg-green-100 text-green-600', border: 'border-green-200' };
    case 'WALK_IN':
      return { Icon: MapPin, color: 'bg-teal-100 text-teal-600', border: 'border-teal-200' };
    case 'STATUS_CHANGE':
      return { Icon: Tag, color: 'bg-pink-100 text-pink-600', border: 'border-pink-200' };
    default:
      return { Icon: FileText, color: 'bg-gray-100 text-gray-600', border: 'border-gray-200' };
  }
};

export function InteractionRenderer({ interaction, showLeadContext = false }: InteractionRendererProps) {
  const { Icon, color } = getIconAndColor(interaction.type);

  // Generate a title based on context and type
  let title = interaction.type.replace('_', ' ');
  if (showLeadContext && interaction.lead) {
    title = `${title} - ${interaction.lead.first_name} ${interaction.lead.last_name || ''}`;
  } else if (interaction.user) {
    title = `${title} by ${interaction.user.first_name}`;
  }

  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm bg-card">
        <div className="flex items-center justify-between space-x-2 mb-1">
          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {title}
          </div>
          <time className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
          </time>
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-sm whitespace-pre-wrap">
          {interaction.notes || 'No details provided.'}
        </div>
      </div>
    </div>
  );
}
