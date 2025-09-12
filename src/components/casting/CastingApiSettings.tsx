import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCastingApi } from '@/hooks/useCastingApi';

export const CastingApiSettings = () => {
  const { apiKeys, createApiKey, deleteApiKey, toggleApiKey } = useCastingApi();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom pour la clé API",
        variant: "destructive"
      });
      return;
    }

    try {
      await createApiKey.mutateAsync({ name: newKeyName });
      setNewKeyName('');
      toast({
        title: "Clé API créée",
        description: "La nouvelle clé API a été créée avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la clé API",
        variant: "destructive"
      });
    }
  };

  const handleToggleVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleCopyKey = (keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    toast({
      title: "Copié",
      description: "Clé API copiée dans le presse-papiers"
    });
  };

  return (
    <div className="space-y-6">
      {/* Create new API key */}
      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle clé API</CardTitle>
          <CardDescription>
            Générez une nouvelle clé API pour accéder au système de casting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="keyName">Nom de la clé</Label>
              <Input
                id="keyName"
                placeholder="Production API, Staging API..."
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateApiKey} disabled={createApiKey.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {createApiKey.isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing API keys */}
      <Card>
        <CardHeader>
          <CardTitle>Clés API existantes</CardTitle>
          <CardDescription>
            Gérez vos clés API actives et leurs permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys?.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              Aucune clé API configurée
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys?.map((apiKey) => (
                <div key={apiKey.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{apiKey.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Créée le {new Date(apiKey.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={apiKey.is_active ? "default" : "secondary"}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={apiKey.is_active}
                        onCheckedChange={() => toggleApiKey.mutate(apiKey.id)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Clé API</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        type={showKeys[apiKey.id] ? "text" : "password"}
                        value={showKeys[apiKey.id] ? apiKey.key_hash : "••••••••••••••••••••••••••••••••"}
                        className="font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyKey(showKeys[apiKey.id] ? apiKey.key_hash : "••••••••••••••••••••••••••••••••")}
                        disabled={!showKeys[apiKey.id]}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteApiKey.mutate(apiKey.id)}
                        disabled={deleteApiKey.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Dernière utilisation:</span>
                      <p className="text-muted-foreground">
                        {apiKey.last_used_at 
                          ? new Date(apiKey.last_used_at).toLocaleString('fr-FR')
                          : 'Jamais utilisée'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Taux limite:</span>
                      <p className="text-muted-foreground">1000 req/heure</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
