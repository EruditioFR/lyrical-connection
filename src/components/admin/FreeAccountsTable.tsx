
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, CreditCard } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';

interface Account {
  id: string;
  user_id: string;
  stage_name?: string;
  company_name?: string;
  contact_email: string;
  created_at: string;
  type: 'artist' | 'professional';
}

interface FreeAccountsTableProps {
  filteredAccounts: Account[];
}

const FreeAccountsTable = ({ filteredAccounts }: FreeAccountsTableProps) => {
  const { sendUpgradeRequest, isSendingUpgradeRequest } = useAdminManagement();

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
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
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
                <TableCell>{formatDate(account.created_at)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Gratuit
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpgradeRequest(account)}
                      disabled={isSendingUpgradeRequest}
                      className="gap-1"
                    >
                      <CreditCard className="h-3 w-3" />
                      Passer en payant
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="gap-1"
                    >
                      <a 
                        href={type === 'artist' ? `/artist/${account.id}` : `/professional/${account.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Voir profil
                      </a>
                    </Button>
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
          <h3 className="text-lg font-semibold">Comptes gratuits créés</h3>
          <p className="text-sm text-muted-foreground">
            {filteredAccounts.length} compte(s) au total • {artistAccounts.length} artiste(s) • {professionalAccounts.length} professionnel(s)
          </p>
        </div>
      </div>

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
    </div>
  );
};

export default FreeAccountsTable;
