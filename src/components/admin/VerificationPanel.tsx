import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  Clock, 
  FileText, 
  User, 
  Building, 
  Mail, 
  Calendar,
  Eye
} from 'lucide-react';
import { 
  useAllVerificationRequests, 
  useUpdateVerificationRequest,
  type VerificationRequest 
} from '@/hooks/useVerification';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const VerificationPanel = () => {
  const { user } = useAuth();
  const { data: requests = [], isLoading } = useAllVerificationRequests();
  const { mutate: updateRequest, isPending } = useUpdateVerificationRequest();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  const handleStatusChange = (requestId: string, status: 'approved' | 'rejected') => {
    if (!user) return;

    updateRequest({
      requestId,
      status,
      notes: notes.trim() || undefined,
      reviewedBy: user.id
    });

    setSelectedRequest(null);
    setNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'approved': return <Check className="w-3 h-3" />;
      case 'rejected': return <X className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const RequestCard = ({ request }: { request: VerificationRequest }) => {
    const isSelected = selectedRequest === request.id;
    
    return (
      <Card className={`cursor-pointer transition-colors ${
        isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                {request.profile_type === 'professional' ? (
                  <Building className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div>
                <CardTitle className="text-sm">
                  {request.profile_type === 'professional' ? 'Professionnel' : 'Artiste'}
                </CardTitle>
                <CardDescription className="text-xs">
                  Demande #{request.id.slice(0, 8)}
                </CardDescription>
              </div>
            </div>
            
            <Badge 
              variant={getStatusColor(request.status || 'pending') as any}
              className="gap-1"
            >
              {getStatusIcon(request.status || 'pending')}
              {request.status === 'pending' ? 'En attente' :
               request.status === 'approved' ? 'Approuvée' :
               request.status === 'rejected' ? 'Rejetée' : request.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(request.created_at), {
                  addSuffix: true,
                  locale: fr
                })}
              </span>
            </div>
            
            {request.notes && (
              <div className="flex items-start gap-2">
                <FileText className="w-3 h-3 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground text-xs line-clamp-2">
                  {request.notes}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedRequest(isSelected ? null : request.id)}
              className="flex-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              {isSelected ? 'Fermer' : 'Examiner'}
            </Button>
            
            {request.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => handleStatusChange(request.id, 'approved')}
                  disabled={isPending}
                >
                  <Check className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleStatusChange(request.id, 'rejected')}
                  disabled={isPending}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const RequestDetails = ({ request }: { request: VerificationRequest }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Détails de la demande
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Informations générales</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-medium">
                {request.profile_type === 'professional' ? 'Professionnel' : 'Artiste'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Date de création:</span>
              <p className="font-medium">
                {new Date(request.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">ID Profil:</span>
              <p className="font-medium font-mono text-xs">
                {request.profile_id}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">ID Utilisateur:</span>
              <p className="font-medium font-mono text-xs">
                {request.user_id}
              </p>
            </div>
          </div>
        </div>

        {request.notes && (
          <div>
            <h4 className="font-medium mb-2">Notes de l'utilisateur</h4>
            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
              {request.notes}
            </p>
          </div>
        )}

        {request.documents && Object.keys(request.documents).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Documents fournis</h4>
            <div className="space-y-2">
              {Object.entries(request.documents).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{key}</span>
                  <Badge variant="outline">Document</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {request.status === 'pending' && (
          <div>
            <h4 className="font-medium mb-2">Actions</h4>
            <div className="space-y-3">
              <Textarea
                placeholder="Notes administratives (optionnel)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleStatusChange(request.id, 'approved')}
                  disabled={isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleStatusChange(request.id, 'rejected')}
                  disabled={isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeter
                </Button>
              </div>
            </div>
          </div>
        )}

        {request.status !== 'pending' && (
          <div>
            <h4 className="font-medium mb-2">Informations de traitement</h4>
            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Traité le:</span>{' '}
                {request.reviewed_at && new Date(request.reviewed_at).toLocaleDateString('fr-FR')}
              </p>
              <p>
                <span className="text-muted-foreground">Traité par:</span>{' '}
                {request.reviewed_by}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Gestion des vérifications</h2>
        <div className="flex items-center justify-center h-64">
          <p>Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des vérifications</h2>
        <p className="text-muted-foreground">
          Examinez et traitez les demandes de vérification des profils professionnels
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingRequests.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Requests List */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Demandes en attente</h3>
            <p className="text-sm text-muted-foreground">
              {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} à traiter
            </p>
          </div>
          
          <ScrollArea className="h-96">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune demande en attente</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} onClick={() => setSelectedRequest(request.id)}>
                    <RequestCard request={request} />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {processedRequests.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold">Demandes traitées</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-4">
                    {processedRequests.slice(0, 10).map((request) => (
                      <div key={request.id} onClick={() => setSelectedRequest(request.id)}>
                        <RequestCard request={request} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        {/* Request Details */}
        <div>
          {selectedRequest ? (
            <RequestDetails 
              request={requests.find(r => r.id === selectedRequest)!} 
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Sélectionnez une demande pour voir les détails</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPanel;