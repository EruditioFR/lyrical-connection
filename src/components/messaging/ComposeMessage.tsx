import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, Save, Paperclip, User, Building2 } from "lucide-react";
import { useMailbox } from "@/hooks/useMailbox";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

export const ComposeMessage = ({ 
  onClose, 
  replyTo, 
  recipientId, 
  recipientName 
}: ComposeMessageProps) => {
  const [recipient, setRecipient] = useState(recipientId || "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { sendMessage, isSending, saveDraft } = useMailbox();

  // Fetch available contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const [artistsQuery, professionalsQuery] = await Promise.all([
        supabase
          .from('artist_profiles')
          .select('id, stage_name, profile_image_url')
          .ilike('stage_name', `%${searchQuery}%`)
          .eq('is_active', true)
          .limit(10),
        supabase
          .from('professional_profiles')
          .select('id, company_name, logo_url')
          .ilike('company_name', `%${searchQuery}%`)
          .eq('is_active', true)
          .limit(10)
      ]);

      const contacts = [
        ...(artistsQuery.data?.map(a => ({ 
          id: a.id, 
          name: a.stage_name, 
          type: 'artist',
          avatar: a.profile_image_url 
        })) || []),
        ...(professionalsQuery.data?.map(p => ({ 
          id: p.id, 
          name: p.company_name, 
          type: 'professional',
          avatar: p.logo_url 
        })) || [])
      ];

      return contacts;
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
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un destinataire..." />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    placeholder="Rechercher un contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center gap-2">
                      {contact.type === 'artist' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                      <span>{contact.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <span className="text-sm truncate">{attachment}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.multiple = true;
                fileInput.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) {
                    const fileNames = Array.from(files).map(file => file.name);
                    setAttachments(prev => [...prev, ...fileNames]);
                  }
                };
                fileInput.click();
              }}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Joindre
            </Button>

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
              disabled={!canSend || isSending}
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