
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  User, 
  Briefcase, 
  Mail,
  Calendar,
  CreditCard,
  MoreHorizontal,
  CheckSquare
} from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';

interface FreeAccount {
  id: string;
  user_id: string;
  stage_name?: string;
  company_name?: string;
  contact_email: string;
  created_at: string;
  type: 'artist' | 'professional';
}

interface FreeAccountsTableProps {
  filteredAccounts: FreeAccount[];
}

const FreeAccountsTable = ({ filteredAccounts }: FreeAccountsTableProps) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const { sendUpgradeRequest, isSendingUpgradeRequest } = useAdminManagement();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccounts(filteredAccounts.map(account => account.id));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectAccount = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts(prev => [...prev, accountId]);
    } else {
      setSelectedAccounts(prev => prev.filter(id => id !== accountId));
    }
  };

  const handleBulkUpgrade = () => {
    selectedAccounts.forEach(accountId => {
      const account = filteredAccounts.find(acc => acc.id === accountId);
      if (account) {
        sendUpgradeRequest({
          profileId: account.id,
          profileType: account.type,
          userId: account.user_id
        });
      }
    });
    setSelectedAccounts([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAccountAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 jour';
    if (diffDays < 7) return `${diffDays} jours`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semaines`;
    return `${Math.floor(diffDays / 30)} mois`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Comptes gratuits ({filteredAccounts.length})
            </CardTitle>
            <CardDescription>
              Gérez les comptes gratuits créés par les administrateurs
            </CardDescription>
          </div>
          
          {selectedAccounts.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedAccounts.length} sélectionné{selectedAccounts.length > 1 ? 's' : ''}
              </Badge>
              <Button
                onClick={handleBulkUpgrade}
                disabled={isSendingUpgradeRequest}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Upgrade en lot
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun compte gratuit trouvé</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedAccounts.length === filteredAccounts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Âge</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={(checked) => handleSelectAccount(account.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {account.type === 'artist' ? (
                        <User className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Briefcase className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium">
                        {account.stage_name || account.company_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.type === 'artist' ? 'default' : 'secondary'}>
                      {account.type === 'artist' ? 'Artiste' : 'Professionnel'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {account.contact_email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(account.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getAccountAge(account.created_at).includes('mois') ? 'destructive' : 'outline'}
                    >
                      {getAccountAge(account.created_at)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => sendUpgradeRequest({
                        profileId: account.id,
                        profileType: account.type,
                        userId: account.user_id
                      })}
                      disabled={isSendingUpgradeRequest}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <CreditCard className="h-3 w-3" />
                      Upgrade
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FreeAccountsTable;
