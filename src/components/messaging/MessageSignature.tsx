import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Signature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

interface MessageSignatureProps {
  onSignatureSelect?: (signature: Signature) => void;
  currentSignature?: string;
}

const defaultSignature: Signature = {
  id: 'default',
  name: 'Signature par défaut',
  content: `Cordialement,
{{name}}

{{title}}
{{company}}
{{phone}} | {{email}}`,
  isDefault: true
};

export const MessageSignature = ({ onSignatureSelect, currentSignature }: MessageSignatureProps) => {
  const [signatures, setSignatures] = useState<Signature[]>([defaultSignature]);
  const [isManaging, setIsManaging] = useState(false);
  const [autoSignature, setAutoSignature] = useState(true);
  const [editingSignature, setEditingSignature] = useState<Signature | null>(null);
  const [newSignature, setNewSignature] = useState<Omit<Signature, 'id'>>({
    name: '',
    content: '',
    isDefault: false
  });
  const { toast } = useToast();

  const handleCreateSignature = () => {
    if (!newSignature.name.trim() || !newSignature.content.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et le contenu de la signature sont requis.",
        variant: "destructive"
      });
      return;
    }

    const signature: Signature = {
      id: Date.now().toString(),
      ...newSignature,
      isDefault: signatures.length === 0 ? true : newSignature.isDefault
    };

    // Si cette signature est définie par défaut, enlever le statut par défaut des autres
    if (signature.isDefault) {
      setSignatures(prev => prev.map(s => ({ ...s, isDefault: false })));
    }

    setSignatures(prev => [...prev, signature]);
    setNewSignature({ name: '', content: '', isDefault: false });
    
    toast({
      title: "Signature créée",
      description: `La signature "${signature.name}" a été créée avec succès.`
    });
  };

  const handleUpdateSignature = () => {
    if (!editingSignature) return;

    // Si cette signature est définie par défaut, enlever le statut par défaut des autres
    if (editingSignature.isDefault) {
      setSignatures(prev => prev.map(s => 
        s.id === editingSignature.id ? editingSignature : { ...s, isDefault: false }
      ));
    } else {
      setSignatures(prev => prev.map(s => 
        s.id === editingSignature.id ? editingSignature : s
      ));
    }
    
    setEditingSignature(null);
    
    toast({
      title: "Signature mise à jour",
      description: `La signature "${editingSignature.name}" a été mise à jour.`
    });
  };

  const handleDeleteSignature = (signatureId: string) => {
    const signature = signatures.find(s => s.id === signatureId);
    setSignatures(prev => prev.filter(s => s.id !== signatureId));
    
    toast({
      title: "Signature supprimée",
      description: `La signature "${signature?.name}" a été supprimée.`
    });
  };

  const setDefaultSignature = (signatureId: string) => {
    setSignatures(prev => prev.map(s => ({
      ...s,
      isDefault: s.id === signatureId
    })));
    
    toast({
      title: "Signature par défaut",
      description: "Signature par défaut mise à jour."
    });
  };

  const getDefaultSignature = () => {
    return signatures.find(s => s.isDefault) || signatures[0];
  };

  const processSignatureVariables = (content: string): string => {
    // Ici, vous pourriez remplacer les variables par des données réelles de l'utilisateur
    const variables: Record<string, string> = {
      '{{name}}': 'Jean Dupont',
      '{{title}}': 'Baryton',
      '{{company}}': 'Opéra de Paris',
      '{{phone}}': '+33 1 23 45 67 89',
      '{{email}}': 'jean.dupont@example.com'
    };

    let processedContent = content;
    Object.entries(variables).forEach(([variable, value]) => {
      processedContent = processedContent.replace(new RegExp(variable, 'g'), value);
    });

    return processedContent;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-signature"
            checked={autoSignature}
            onCheckedChange={setAutoSignature}
          />
          <Label htmlFor="auto-signature">Signature automatique</Label>
        </div>
        
        <Dialog open={isManaging} onOpenChange={setIsManaging}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Gérer les signatures
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gestion des signatures</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Liste des signatures existantes */}
              <div className="space-y-4">
                <h3 className="font-semibold">Signatures existantes</h3>
                
                {signatures.map((signature) => (
                  <Card key={signature.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {signature.name}
                          {signature.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Par défaut
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingSignature(signature)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {signatures.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSignature(signature.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap border rounded p-2 bg-muted/50">
                        {processSignatureVariables(signature.content)}
                      </pre>
                      {!signature.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setDefaultSignature(signature.id)}
                        >
                          Définir par défaut
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Formulaire de création/édition */}
              <div className="space-y-4">
                <h3 className="font-semibold">
                  {editingSignature ? 'Modifier la signature' : 'Nouvelle signature'}
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom de la signature</Label>
                    <Input
                      value={editingSignature?.name || newSignature.name}
                      onChange={(e) => {
                        if (editingSignature) {
                          setEditingSignature({ ...editingSignature, name: e.target.value });
                        } else {
                          setNewSignature(prev => ({ ...prev, name: e.target.value }));
                        }
                      }}
                      placeholder="Ex: Signature professionnelle"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Contenu de la signature</Label>
                    <Textarea
                      value={editingSignature?.content || newSignature.content}
                      onChange={(e) => {
                        if (editingSignature) {
                          setEditingSignature({ ...editingSignature, content: e.target.value });
                        } else {
                          setNewSignature(prev => ({ ...prev, content: e.target.value }));
                        }
                      }}
                      placeholder="Contenu de votre signature..."
                      className="min-h-[150px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Variables disponibles : {`{{name}}, {{title}}, {{company}}, {{phone}}, {{email}}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editingSignature?.isDefault || newSignature.isDefault}
                      onCheckedChange={(checked) => {
                        if (editingSignature) {
                          setEditingSignature({ ...editingSignature, isDefault: checked });
                        } else {
                          setNewSignature(prev => ({ ...prev, isDefault: checked }));
                        }
                      }}
                    />
                    <Label>Signature par défaut</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    {editingSignature ? (
                      <>
                        <Button onClick={handleUpdateSignature}>
                          Sauvegarder
                        </Button>
                        <Button variant="outline" onClick={() => setEditingSignature(null)}>
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={handleCreateSignature}>
                          <Plus className="w-4 h-4 mr-2" />
                          Créer
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setNewSignature({ name: '', content: '', isDefault: false })}
                        >
                          Réinitialiser
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {autoSignature && (
        <div className="p-3 bg-muted/50 rounded border">
          <p className="text-xs text-muted-foreground mb-2">Aperçu de la signature par défaut :</p>
          <pre className="text-xs whitespace-pre-wrap">
            {processSignatureVariables(getDefaultSignature()?.content || '')}
          </pre>
        </div>
      )}
    </div>
  );
};