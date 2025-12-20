
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { X, Send, Save, Paperclip, User, Building2, Upload, FileText, Settings, ChevronsUpDown, Check } from "lucide-react";
import { useMailbox } from "@/hooks/useMailbox";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MessageTemplates } from "./MessageTemplates";
import { MessageSignature } from "./MessageSignature";
import { cn } from "@/lib/utils";

interface ComposeMessageProps {
  onClose: () => void;
  replyTo?: {
    id: string;
    sender_id: string;
    subject: string;
    content: string;
  };
  recipientId?: string;
  recipientName?: string;
}

// Constante pour la taille maximale des fichiers (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB en octets

export const ComposeMessage = ({ 
  onClose, 
  replyTo, 
  recipientId, 
  recipientName 
}: ComposeMessageProps) => {
  const [recipient, setRecipient] = useState(recipientId || "");
  const [recipientDisplayName, setRecipientDisplayName] = useState(recipientName || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openContactSearch, setOpenContactSearch] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const { sendMessage, isSending, saveDraft } = useMailbox();
  const { toast } = useToast();

  // Fetch available contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      try {
        const [artistsQuery, professionalsQuery] = await Promise.all([
          supabase
            .from('artist_profiles')
            .select('id, stage_name, profile_image_url, user_id')
            .ilike('stage_name', `%${searchQuery}%`)
            .eq('is_active', true)
            .limit(10),
          supabase
            .from('professional_profiles')
            .select('id, company_name, logo_url, user_id')
            .ilike('company_name', `%${searchQuery}%`)
            .eq('is_active', true)
            .limit(10)
        ]);

        const contacts = [
          ...(artistsQuery.data?.map(a => ({ 
            id: a.user_id, 
            name: a.stage_name, 
            type: 'artist',
            avatar: a.profile_image_url 
          })) || []),
          ...(professionalsQuery.data?.map(p => ({ 
            id: p.user_id, 
            name: p.company_name, 
            type: 'professional',
            avatar: p.logo_url 
          })) || [])
        ];

        return contacts;
      } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];
      }
    },
    enabled: searchQuery.length >= 2,
  });

  useEffect(() => {
    if (replyTo) {
      setRecipient(replyTo.sender_id);
      setSubject(replyTo.subject.startsWith('Re: ') ? replyTo.subject : `Re: ${replyTo.subject}`);
      setContent(`\n\n--- Message original ---\n${replyTo.content}`);
    }
  }, [replyTo]);

  // Auto-save draft with debounce
  const autoSaveDraft = useCallback(async () => {
    if ((!recipient && !subject.trim() && !content.trim()) || replyTo) {
      return; // Don't save empty drafts or reply drafts
    }

    try {
      await saveDraft({
        recipient_id: recipient || undefined,
        subject: subject.trim() || undefined,
        content: content.trim() || undefined,
        attachment_urls: attachments.length > 0 ? attachments : undefined,
      });
    } catch (error) {
      console.error('Error auto-saving draft:', error);
    }
  }, [recipient, subject, content, attachments, replyTo, saveDraft]);

  // Auto-save effect with debounce
  useEffect(() => {
    // Clear previous timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      autoSaveDraft();
    }, 3000); // Auto-save after 3 seconds of inactivity

    setAutoSaveTimeout(timeout);

    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [recipient, subject, content, attachments, autoSaveDraft]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Fichier trop volumineux",
        description: `Le fichier "${file.name}" (${formatFileSize(file.size)}) dépasse la limite de ${formatFileSize(MAX_FILE_SIZE)}.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File): Promise<string> => {
    if (!validateFileSize(file)) {
      throw new Error('Fichier trop volumineux');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file);

    if (error) {
      console.error('Erreur upload:', error);
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }

    // Récupérer l'URL publique du fichier
    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Valider tous les fichiers avant de commencer l'upload
    const validFiles = fileArray.filter(validateFileSize);
    
    if (validFiles.length === 0) return;
    
    for (const file of validFiles) {
      const fileId = `${Date.now()}-${file.name}`;
      setUploadingFiles(prev => new Set(prev).add(fileId));
      
      try {
        const fileUrl = await uploadFile(file);
        setAttachments(prev => [...prev, fileUrl]);
        
        toast({
          title: "Fichier ajouté",
          description: `Le fichier ${file.name} (${formatFileSize(file.size)}) a été ajouté avec succès.`,
        });
      } catch (error) {
        console.error('Erreur lors de l\'upload du fichier:', error);
        toast({
          title: "Erreur d'upload",
          description: `Impossible d'uploader le fichier ${file.name}.`,
          variant: "destructive",
        });
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    }
  };

  const removeAttachment = async (attachmentUrl: string) => {
    try {
      // Extraire le nom du fichier depuis l'URL pour le supprimer du storage
      const urlParts = attachmentUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (fileName && attachmentUrl.includes('supabase')) {
        await supabase.storage
          .from('message-attachments')
          .remove([fileName]);
      }
      
      setAttachments(prev => prev.filter(url => url !== attachmentUrl));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Enlever le timestamp ajouté
      return fileName.split('-').slice(1).join('-') || fileName;
    } catch {
      return 'fichier';
    }
  };

  const handleSend = async () => {
    if (!recipient || !subject.trim()) return;

    try {
      await sendMessage({
        recipient_id: recipient,
        subject: subject.trim(),
        content: content.trim(),
        reply_to_id: replyTo?.id,
        attachment_urls: attachments.length > 0 ? attachments : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft({
        recipient_id: recipient || undefined,
        subject: subject.trim() || undefined,
        content: content.trim() || undefined,
        attachment_urls: attachments.length > 0 ? attachments : undefined,
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const canSend = recipient && subject.trim() && content.trim();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          {replyTo ? 'Répondre' : 'Nouveau message'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Destinataire</Label>
          {replyTo || recipientId ? (
            <Input
              id="recipient"
              value={recipientName || recipient}
              disabled
            />
          ) : (
            <Popover open={openContactSearch} onOpenChange={setOpenContactSearch}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openContactSearch}
                  className="w-full justify-between font-normal"
                >
                  {recipientDisplayName || "Sélectionner un destinataire..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Rechercher un contact..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {searchQuery.length < 2 
                        ? "Tapez au moins 2 caractères..." 
                        : "Aucun contact trouvé."}
                    </CommandEmpty>
                    <CommandGroup>
                      {contacts.map((contact) => (
                        <CommandItem
                          key={contact.id}
                          value={contact.id}
                          onSelect={() => {
                            setRecipient(contact.id);
                            setRecipientDisplayName(contact.name);
                            setOpenContactSearch(false);
                            setSearchQuery("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              recipient === contact.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {contact.type === 'artist' ? (
                            <User className="mr-2 h-4 w-4" />
                          ) : (
                            <Building2 className="mr-2 h-4 w-4" />
                          )}
                          <span>{contact.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Objet</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet du message..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Message</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tapez votre message ici..."
            className="min-h-[200px] resize-none"
          />
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2">
            <Label>Pièces jointes</Label>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm truncate">{getFileNameFromUrl(attachment)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadingFiles.size > 0 && (
          <div className="space-y-2">
            <Label>Upload en cours...</Label>
            <div className="flex flex-wrap gap-2">
              {Array.from(uploadingFiles).map((fileId) => (
                <div key={fileId} className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Upload className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Upload...</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates et Signature */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Modèles de messages
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Choisir un modèle</DialogTitle>
                </DialogHeader>
                <MessageTemplates 
                  onTemplateSelect={(template) => {
                    if (template.subject) setSubject(template.subject);
                    setContent(template.content);
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Signature
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Gestion des signatures</DialogTitle>
                </DialogHeader>
                <MessageSignature />
              </DialogContent>
            </Dialog>
          </div>

          {/* Actions principales */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.multiple = true;
                  fileInput.accept = '*/*';
                  fileInput.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) {
                      handleFileSelect(files);
                    }
                  };
                  fileInput.click();
                }}
                disabled={uploadingFiles.size > 0}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Joindre
              </Button>
              <span className="text-xs text-muted-foreground">
                (Max. {formatFileSize(MAX_FILE_SIZE)} par fichier)
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
              >
                <Save className="w-4 h-4 mr-2" />
                Brouillon
              </Button>
            </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!canSend || isSending || uploadingFiles.size > 0}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
