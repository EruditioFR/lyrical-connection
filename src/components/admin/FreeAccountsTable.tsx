import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, CreditCard } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import FreeAccountsTableSkeleton from './FreeAccountsTableSkeleton';
import AdminArtistProfileDialog from './AdminArtistProfileDialog';
import EditProfessionalProfileDialog from './EditProfessionalProfileDialog';
import DeleteProfileDialog from './DeleteProfileDialog';
import { InviteAccountButton } from './InviteAccountButton';
import type { Database } from '@/integrations/supabase/types';

type ProfessionalRole = Database['public']['Enums']['professional_role'];

interface Account {
  id: string;
  user_id: string;
  stage_name?: string;
  company_name?: string;
  contact_email: string;
  created_at: string;
  type: 'artist' | 'professional';
  bio?: string;
  voice_type?: string;
  location?: string;
  phone?: string;
  website?: string;
  nationality?: string;
  experience_years?: number;
  professional_role?: ProfessionalRole;
  team_description?: string;
  birth_date?: string;
  gender?: string;
  spoken_languages?: string[];
  project_description?: string;
  repertoire?: string[];
  cover_image_url?: string;
  is_free_account?: boolean;
}

interface FreeAccountsTableProps {
  filteredAccounts: Account[];
  accountType?: 'artist' | 'professional';
  onAccountUpdated?: () => void;
}

const FreeAccountsTable = ({ filteredAccounts, accountType, onAccountUpdated }: FreeAccountsTableProps) => {
  const { sendUpgradeRequest, isSendingUpgradeRequest, isLoadingAllAccounts } = useAdminManagement();

  if (isLoadingAllAccounts) {
    return <FreeAccountsTableSkeleton />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUpgradeRequest = (account: Account) => {
    sendUpgradeRequest({
      profileId: account.id,
      profileType: account.type,
      userId: account.user_id
    });
  };

  const artistAccounts = filteredAccounts.filter(account => account.type === 'artist');
  const professionalAccounts = filteredAccounts.filter(account => account.type === 'professional');

  const AccountTable = ({ accounts, type }: { accounts: Account[], type: 'artist' | 'professional' }) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{type === 'artist' ? 'Nom de scène' : 'Société'}</TableHead>
            <TableHead>Email de contact</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun compte {type === 'artist' ? 'artiste' : 'professionnel'} trouvé
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">
                  {type === 'artist' ? account.stage_name : account.company_name}
                </TableCell>
                <TableCell>{account.contact_email}</TableCell>
                <TableCell>
                  <Badge variant={account.is_free_account ? "secondary" : "default"} className="text-xs">
                    {account.is_free_account ? 'Gratuit' : 'Payant'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(account.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    {type === 'artist' && account.type === 'artist' && (
                      <AdminArtistProfileDialog 
                        account={account} 
                        onAccountUpdated={onAccountUpdated || (() => {})}
                      />
                    )}
                    {type === 'professional' && account.type === 'professional' && (
                      <EditProfessionalProfileDialog 
                        account={{
                          ...account,
                          type: 'professional' as const
                        }} 
                        onAccountUpdated={onAccountUpdated || (() => {})}
                      />
                    )}
                    {account.is_free_account && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpgradeRequest(account)}
                        disabled={isSendingUpgradeRequest}
                        className="gap-1"
                      >
                        {isSendingUpgradeRequest ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-3 w-3" />
                            Passer en payant
                          </>
                        )}
                      </Button>
                    )}
                    <InviteAccountButton
                      profileId={account.id}
                      profileType={type}
                      profileName={account.stage_name || account.company_name || 'Compte'}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="gap-1"
                    >
                      <a 
                        href={type === 'artist' ? `/artistes/${account.id}` : `/professionnels/${account.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Voir profil
                      </a>
                    </Button>
                    <DeleteProfileDialog 
                      account={account}
                      onProfileDeleted={onAccountUpdated || (() => {})}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {accountType 
              ? `Comptes ${accountType === 'artist' ? 'artistes' : 'professionnels'}`
              : 'Comptes'
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {accountType 
              ? `${accountType === 'artist' ? artistAccounts.length : professionalAccounts.length} compte(s) trouvé(s)`
              : `${filteredAccounts.length} compte(s) au total • ${artistAccounts.length} artiste(s) • ${professionalAccounts.length} professionnel(s)`
            }
          </p>
        </div>
      </div>

      {accountType ? (
        <AccountTable accounts={accountType === 'artist' ? artistAccounts : professionalAccounts} type={accountType} />
      ) : (
        <Tabs defaultValue="artists" className="space-y-4">
          <TabsList>
            <TabsTrigger value="artists" className="relative">
              Artistes
              {artistAccounts.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {artistAccounts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="professionals" className="relative">
              Professionnels
              {professionalAccounts.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {professionalAccounts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artists">
            <AccountTable accounts={artistAccounts} type="artist" />
          </TabsContent>

          <TabsContent value="professionals">
            <AccountTable accounts={professionalAccounts} type="professional" />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default FreeAccountsTable;
