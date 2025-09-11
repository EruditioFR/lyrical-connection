import React from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useMailbox } from '@/hooks/useMailbox';

const MailIcon = () => {
  const navigate = useNavigate();
  const { unreadCount } = useMailbox();

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="relative p-2 hover:bg-gray-100"
    >
      <Mail className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default MailIcon;