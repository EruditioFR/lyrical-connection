import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DashboardMessage } from '@/hooks/useDashboardData';

interface RecentMessagesProps {
  messages: DashboardMessage[];
  isLoading: boolean;
}

const RecentMessages: React.FC<RecentMessagesProps> = ({ messages, isLoading }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages récents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages récents
          </CardTitle>
          <Link to="/messages">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun message récent
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={message.sender_avatar} />
                  <AvatarFallback>
                    {getInitials(message.sender_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {message.sender_name}
                    </p>
                    {!message.is_read && (
                      <Badge variant="default" className="text-xs">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-foreground truncate mb-1">
                    {message.subject}
                  </p>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {message.content}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    {formatDistance(new Date(message.created_at), new Date(), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t">
              <Link to="/messages" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Accéder à la messagerie
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentMessages;