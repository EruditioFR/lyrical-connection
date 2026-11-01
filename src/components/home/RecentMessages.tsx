import React from 'react';
import { initials } from '@/lib/utils';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DashboardMessage } from '@/hooks/useDashboardData';
import { Panel, PanelList, PanelLink, PanelEmpty, PanelSkeleton, UnreadDot } from '@/components/dashboard/Panel';

interface RecentMessagesProps {
  messages: DashboardMessage[];
  isLoading: boolean;
}

const RecentMessages: React.FC<RecentMessagesProps> = ({ messages, isLoading }) => (
  <Panel title="Messages récents" action={{ to: '/messages', label: 'Messagerie' }}>
    {isLoading ? (
      <PanelSkeleton />
    ) : messages.length === 0 ? (
      <PanelEmpty>Aucun message pour le moment.</PanelEmpty>
    ) : (
      <PanelList>
        {messages.map((message) => (
          <PanelLink key={message.id} to="/messages">
            <Avatar className="h-10 w-10">
              <AvatarImage src={message.sender_avatar} alt="" />
              <AvatarFallback>{initials(message.sender_name || 'U')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className={`text-sm truncate ${message.is_read ? '' : 'font-semibold'}`}>{message.sender_name}</p>
                <time dateTime={message.created_at} className="text-xs text-muted-foreground shrink-0">
                  {formatDistance(new Date(message.created_at), new Date(), { addSuffix: true, locale: fr })}
                </time>
              </div>
              <p className="text-sm truncate">{message.subject}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{message.content}</p>
            </div>
            {!message.is_read && <UnreadDot />}
          </PanelLink>
        ))}
      </PanelList>
    )}
  </Panel>
);

export default RecentMessages;
