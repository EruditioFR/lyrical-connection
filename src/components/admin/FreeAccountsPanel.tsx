
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Briefcase, 
  Plus, 
  CreditCard,
  Mail,
  Calendar,
  Building
} from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import CreateFreeAccountDialog from './CreateFreeAccountDialog';

const FreeAccountsPanel = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { 
    freeAccounts, 
    isLoadingFreeAccounts, 
    sendUpgradeRequest, 
    isSendingUpgradeRequest 
  } = useAdminManagement();

  const handleUpgradeRequest = (profileId: string, profileType: 'artist' | 'professional', userId: string) => {
    sendUpgradeRequest({ profileId, profileType, userId });
  };

  if (isLoadingFreeAccounts) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Chargement...</h3>
            <p className="text-muted-foreground">Récupération des comptes gratuits...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAccounts = (freeAccounts?.artists?.length || 0) + (freeAccounts?.professionals?.length || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comptes gratuits</h2>
          <p className="text-muted-foreground">
            Gérez les comptes gratuits créés par les administrateurs ({totalAccounts} comptes)
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un compte gratuit
        </Button>
      </div>

      {/* Comptes artistes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Comptes artistes ({freeAccounts?.artists?.length || 0})
          </CardTitle>
          <CardDescription>
            Artistes avec des comptes gratuits créés par les administrateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {freeAccounts?.artists?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun compte artiste gratuit trouvé
            </p>
          ) : (
            <div className="grid gap-4">
              {freeAccounts?.artists?.map((artist) => (
                <div key={artist.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{artist.stage_name}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <User className="h-3 w-3" />
                        Artiste
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {artist.contact_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {artist.contact_email}
                        </div>
                      )}
                      {artist.voice_type && (
                        <div className="flex items-center gap-1">
                          <span>{artist.voice_type}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(artist.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUpgradeRequest(artist.id, 'artist', artist.user_id)}
                    disabled={isSendingUpgradeRequest}
                    variant="outline"
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Passer en payant
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comptes professionnels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Comptes professionnels ({freeAccounts?.professionals?.length || 0})
          </CardTitle>
          <CardDescription>
            Professionnels avec des comptes gratuits créés par les administrateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {freeAccounts?.professionals?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun compte professionnel gratuit trouvé
            </p>
          ) : (
            <div className="grid gap-4">
              {freeAccounts?.professionals?.map((professional) => (
                <div key={professional.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{professional.company_name}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <Building className="h-3 w-3" />
                        Professionnel
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {professional.contact_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {professional.contact_email}
                        </div>
                      )}
                      {professional.professional_role && (
                        <div className="flex items-center gap-1">
                          <span>{professional.professional_role.replace('_', ' ')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(professional.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUpgradeRequest(professional.id, 'professional', professional.user_id)}
                    disabled={isSendingUpgradeRequest}
                    variant="outline"
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Passer en payant
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateFreeAccountDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};

export default FreeAccountsPanel;
