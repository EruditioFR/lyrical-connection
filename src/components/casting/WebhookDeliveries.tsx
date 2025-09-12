import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { useWebhookDeliveries } from '@/hooks/useWebhookDeliveries';

export const WebhookDeliveries = () => {
  const { deliveries, retryDelivery, isLoading } = useWebhookDeliveries();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default' as const,
      failed: 'destructive' as const,
      pending: 'secondary' as const
    };
    
    const labels = {
      success: 'Succès',
      failed: 'Échec',
      pending: 'En attente'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Mock data - would be replaced with real webhook deliveries
  const mockDeliveries = [
    {
      id: '1',
      endpoint_url: 'https://api.example.com/webhooks/casting',
      event_type: 'casting.scored',
      status: 'success',
      response_code: 200,
      attempts: 1,
      created_at: '2024-01-15T10:30:00Z',
      next_retry_at: null,
      payload: { casting_id: 'cast_123', total_score: 8.5 }
    },
    {
      id: '2',
      endpoint_url: 'https://staging.company.com/api/webhooks',
      event_type: 'applicant.assigned',
      status: 'failed',
      response_code: 500,
      attempts: 3,
      created_at: '2024-01-15T09:15:00Z',
      next_retry_at: '2024-01-15T11:00:00Z',
      payload: { applicant_id: 'app_456', role_id: 'role_789' }
    },
    {
      id: '3',
      endpoint_url: 'https://app.casting-platform.com/hooks',
      event_type: 'casting.completed',
      status: 'pending',
      response_code: null,
      attempts: 0,
      created_at: '2024-01-15T10:45:00Z',
      next_retry_at: '2024-01-15T10:46:00Z',
      payload: { casting_id: 'cast_789', assigned_count: 5 }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Livraisons Webhook</h3>
          <p className="text-sm text-muted-foreground">
            Surveillez les notifications webhook envoyées à vos endpoints
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Succès</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Échecs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">92.8%</p>
                <p className="text-xs text-muted-foreground">Taux de succès</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Livraisons Récentes</CardTitle>
          <CardDescription>
            Historique des derniers événements webhook envoyés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDeliveries.map((delivery) => (
              <div key={delivery.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(delivery.status)}
                    <div>
                      <h4 className="font-medium">{delivery.event_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {delivery.endpoint_url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(delivery.status)}
                    {delivery.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retryDelivery.mutate(delivery.id)}
                        disabled={retryDelivery.isPending}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Réessayer
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Code de réponse:</span>
                    <p className="text-muted-foreground">
                      {delivery.response_code || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Tentatives:</span>
                    <p className="text-muted-foreground">
                      {delivery.attempts}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Créé le:</span>
                    <p className="text-muted-foreground">
                      {new Date(delivery.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Prochain essai:</span>
                    <p className="text-muted-foreground">
                      {delivery.next_retry_at 
                        ? new Date(delivery.next_retry_at).toLocaleString('fr-FR')
                        : 'Aucun'
                      }
                    </p>
                  </div>
                </div>

                {delivery.payload && (
                  <details className="space-y-2">
                    <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      Voir le payload
                    </summary>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(delivery.payload, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};