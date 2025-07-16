
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Crown } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { useUserRoles } from '@/hooks/useUserRoles';

interface UpgradeAccountButtonProps {
  profileId: string;
  profileType: 'artist' | 'professional';
  userId: string;
  isFreeAccount?: boolean;
  className?: string;
}

const UpgradeAccountButton = ({ 
  profileId, 
  profileType, 
  userId, 
  isFreeAccount = false,
  className = "" 
}: UpgradeAccountButtonProps) => {
  const { sendUpgradeRequest, isSendingUpgradeRequest } = useAdminManagement();
  const { isAdmin } = useUserRoles();

  // Seuls les admins peuvent voir ce bouton sur les comptes gratuits
  if (!isAdmin || !isFreeAccount) {
    return null;
  }

  const handleUpgrade = () => {
    sendUpgradeRequest({
      profileId,
      profileType,
      userId
    });
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isSendingUpgradeRequest}
      className={`gap-2 ${className}`}
      variant="default"
    >
      {isSendingUpgradeRequest ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Traitement...
        </>
      ) : (
        <>
          <Crown className="h-4 w-4" />
          Passer en compte payant
        </>
      )}
    </Button>
  );
};

export default UpgradeAccountButton;
