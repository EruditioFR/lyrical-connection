import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Edit, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'casting' | 'collaboration' | 'general' | 'business';
}

interface MessageTemplatesProps {
  onTemplateSelect: (template: MessageTemplate) => void;
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Demande d\'audition',
    subject: 'Demande d\'audition - {{role}}',
    content: `Bonjour,

J'espère que ce message vous trouve en bonne santé.

Je me permets de vous contacter concernant l'audition pour le rôle de {{role}} dans {{production}}. Fort(e) de {{experience}} d'expérience dans le domaine lyrique, je serais très intéressé(e) par cette opportunité.

Mon répertoire inclut notamment {{repertoire}}, et je serais ravi(e) de vous présenter mes interprétations lors d'une audition.

Je reste à votre disposition pour tout complément d'information.

Cordialement,
{{signature}}`,
    category: 'casting'
  },
  {
    id: '2',
    name: 'Proposition de collaboration',
    subject: 'Proposition de collaboration artistique',
    content: `Bonjour,

J'ai eu l'occasion de découvrir votre travail et je suis très impressionné(e) par votre approche artistique.

Je travaille actuellement sur {{project}} et je pense que votre profil correspondrait parfaitement à ce que nous recherchons.

Seriez-vous disponible pour échanger sur cette collaboration potentielle ?

Dans l'attente de votre retour.

Bien cordialement,
{{signature}}`,
    category: 'collaboration'
  },
  {
    id: '3',
    name: 'Suivi après audition',
    subject: 'Suivi - Audition du {{date}}',
    content: `Bonjour,

Je vous remercie pour l'audition que j'ai passée le {{date}} pour le rôle de {{role}}.

J'ai été ravi(e) de rencontrer l'équipe et de présenter mon interprétation. Cette expérience a renforcé mon intérêt pour ce projet.

Je me tiens à votre disposition pour tout complément d'information et reste dans l'attente de votre retour.

Cordialement,
{{signature}}`,
    category: 'casting'
  }
];

export const MessageTemplates = ({ onTemplateSelect }: MessageTemplatesProps) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Omit<MessageTemplate, 'id'>>({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });
  const { toast } = useToast();

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et le contenu du modèle sont requis.",
        variant: "destructive"
      });
      return;
    }

    const template: MessageTemplate = {
      id: Date.now().toString(),
      ...newTemplate
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', subject: '', content: '', category: 'general' });
    setIsCreating(false);
    
    toast({
      title: "Modèle créé",
      description: `Le modèle "${template.name}" a été créé avec succès.`
    });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    setTemplates(prev => prev.map(t => 
      t.id === editingTemplate.id ? editingTemplate : t
    ));
    setEditingTemplate(null);
    
    toast({
      title: "Modèle mis à jour",
      description: `Le modèle "${editingTemplate.name}" a été mis à jour.`
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    
    toast({
      title: "Modèle supprimé",
      description: `Le modèle "${template?.name}" a été supprimé.`
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'casting': return 'Casting';
      case 'collaboration': return 'Collaboration';
      case 'business': return 'Professionnel';
      default: return 'Général';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'casting': return 'bg-blue-100 text-blue-800';
      case 'collaboration': return 'bg-green-100 text-green-800';
      case 'business': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Modèles de messages</h3>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau modèle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouveau modèle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du modèle</Label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nom du modèle..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casting">Casting</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                      <SelectItem value="business">Professionnel</SelectItem>
                      <SelectItem value="general">Général</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Objet (optionnel)</Label>
                <Input
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Objet du message..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Contenu</Label>
                <Textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenu du modèle... Utilisez {{variable}} pour les variables."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles : {`{{role}}, {{production}}, {{experience}}, {{repertoire}}, {{project}}, {{date}}, {{signature}}`}
                </p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 space-y-2"
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-medium">{template.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>
                  
                  {template.subject && (
                    <p className="text-sm font-medium text-muted-foreground">
                      Objet : {template.subject}
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Modifier le modèle</DialogTitle>
                      </DialogHeader>
                      {editingTemplate && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nom du modèle</Label>
                              <Input
                                value={editingTemplate.name}
                                onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Catégorie</Label>
                              <Select 
                                value={editingTemplate.category} 
                                onValueChange={(value) => setEditingTemplate(prev => prev ? ({ ...prev, category: value as any }) : null)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="casting">Casting</SelectItem>
                                  <SelectItem value="collaboration">Collaboration</SelectItem>
                                  <SelectItem value="business">Professionnel</SelectItem>
                                  <SelectItem value="general">Général</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Objet</Label>
                            <Input
                              value={editingTemplate.subject}
                              onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, subject: e.target.value }) : null)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Contenu</Label>
                            <Textarea
                              value={editingTemplate.content}
                              onChange={(e) => setEditingTemplate(prev => prev ? ({ ...prev, content: e.target.value }) : null)}
                              className="min-h-[200px]"
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                              Annuler
                            </Button>
                            <Button onClick={handleUpdateTemplate}>
                              Sauvegarder
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  {!defaultTemplates.find(t => t.id === template.id) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};