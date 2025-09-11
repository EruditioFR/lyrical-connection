import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Printer, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  is_starred: boolean;
  attachment_urls?: string[];
  created_at: string;
  reply_to_id?: string;
  sender?: {
    stage_name?: string;
    company_name?: string;
  };
  recipient?: {
    stage_name?: string;
    company_name?: string;
  };
}

interface MessageExportProps {
  messages: Message[];
  selectedMessages: string[];
  folder: string;
}

interface ExportOptions {
  format: 'pdf' | 'html' | 'txt' | 'csv';
  includeAttachments: boolean;
  includeMetadata: boolean;
  dateRange: 'all' | 'selected' | 'last30' | 'last90';
}

export const MessageExport = ({ messages, selectedMessages, folder }: MessageExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeAttachments: false,
    includeMetadata: true,
    dateRange: selectedMessages.length > 0 ? 'selected' : 'all'
  });
  const { toast } = useToast();

  const getMessagesToExport = (): Message[] => {
    switch (exportOptions.dateRange) {
      case 'selected':
        return messages.filter(m => selectedMessages.includes(m.id));
      case 'last30':
        const date30 = new Date();
        date30.setDate(date30.getDate() - 30);
        return messages.filter(m => new Date(m.created_at) >= date30);
      case 'last90':
        const date90 = new Date();
        date90.setDate(date90.getDate() - 90);
        return messages.filter(m => new Date(m.created_at) >= date90);
      default:
        return messages;
    }
  };

  const generateCSV = (messagesToExport: Message[]): string => {
    const headers = ['Date', 'Expéditeur', 'Destinataire', 'Objet', 'Lu', 'Étoilé'];
    if (exportOptions.includeMetadata) {
      headers.push('ID', 'Réponse à');
    }
    headers.push('Contenu');

    const rows = messagesToExport.map(message => {
      const row = [
        new Date(message.created_at).toLocaleDateString('fr-FR'),
        message.sender?.stage_name || message.sender?.company_name || 'Inconnu',
        message.recipient?.stage_name || message.recipient?.company_name || 'Inconnu',
        message.subject || '(sans objet)',
        message.is_read ? 'Oui' : 'Non',
        message.is_starred ? 'Oui' : 'Non'
      ];
      
      if (exportOptions.includeMetadata) {
        row.push(message.id, message.reply_to_id || '');
      }
      
      row.push(message.content.replace(/"/g, '""'));
      
      return row.map(field => `"${field}"`).join(',');
    });

    return [headers.map(h => `"${h}"`).join(','), ...rows].join('\n');
  };

  const generateHTML = (messagesToExport: Message[]): string => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Export Messages - ${folder}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { border-bottom: 2px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
        .message { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 8px; }
        .message-header { background: #f5f5f5; padding: 15px; border-bottom: 1px solid #ddd; }
        .message-body { padding: 15px; }
        .metadata { font-size: 0.9em; color: #666; margin-bottom: 10px; }
        .subject { font-size: 1.1em; font-weight: bold; margin-bottom: 5px; }
        .content { line-height: 1.6; white-space: pre-wrap; }
        .attachments { margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; }
        .attachment { display: inline-block; background: #e9ecef; padding: 5px 10px; margin: 2px; border-radius: 4px; font-size: 0.9em; }
        .starred { color: #ffc107; }
        .unread { font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Export Messages - ${folder.charAt(0).toUpperCase() + folder.slice(1)}</h1>
        <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>${messagesToExport.length} message(s) exporté(s)</p>
    </div>
    
    ${messagesToExport.map(message => `
        <div class="message">
            <div class="message-header">
                <div class="subject ${!message.is_read ? 'unread' : ''}">${message.subject || '(sans objet)'}</div>
                <div class="metadata">
                    <strong>De :</strong> ${message.sender?.stage_name || message.sender?.company_name || 'Inconnu'} 
                    <br>
                    <strong>À :</strong> ${message.recipient?.stage_name || message.recipient?.company_name || 'Inconnu'}
                    <br>
                    <strong>Date :</strong> ${new Date(message.created_at).toLocaleDateString('fr-FR')} à ${new Date(message.created_at).toLocaleTimeString('fr-FR')}
                    ${message.is_starred ? '<span class="starred"> ★</span>' : ''}
                    ${exportOptions.includeMetadata ? `<br><strong>ID :</strong> ${message.id}` : ''}
                    ${message.reply_to_id && exportOptions.includeMetadata ? `<br><strong>Réponse à :</strong> ${message.reply_to_id}` : ''}
                </div>
            </div>
            <div class="message-body">
                <div class="content">${message.content}</div>
                ${message.attachment_urls && message.attachment_urls.length > 0 ? `
                    <div class="attachments">
                        <strong>Pièces jointes :</strong><br>
                        ${message.attachment_urls.map(url => `<span class="attachment">${url.split('/').pop()}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
    return htmlContent;
  };

  const generateText = (messagesToExport: Message[]): string => {
    const textContent = `EXPORT MESSAGES - ${folder.toUpperCase()}
${'='.repeat(50)}
Généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
Nombre de messages : ${messagesToExport.length}

${messagesToExport.map((message, index) => `
MESSAGE ${index + 1}
${'-'.repeat(20)}
Objet : ${message.subject || '(sans objet)'}${message.is_starred ? ' ★' : ''}${!message.is_read ? ' [NON LU]' : ''}
De : ${message.sender?.stage_name || message.sender?.company_name || 'Inconnu'}
À : ${message.recipient?.stage_name || message.recipient?.company_name || 'Inconnu'}
Date : ${new Date(message.created_at).toLocaleDateString('fr-FR')} à ${new Date(message.created_at).toLocaleTimeString('fr-FR')}
${exportOptions.includeMetadata ? `ID : ${message.id}` : ''}
${message.reply_to_id && exportOptions.includeMetadata ? `Réponse à : ${message.reply_to_id}` : ''}

Contenu :
${message.content}

${message.attachment_urls && message.attachment_urls.length > 0 ? `Pièces jointes : ${message.attachment_urls.map(url => url.split('/').pop()).join(', ')}` : ''}
`).join('\n')}`;
    return textContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const messagesToExport = getMessagesToExport();
      
      if (messagesToExport.length === 0) {
        toast({
          title: "Aucun message à exporter",
          description: "Aucun message ne correspond aux critères sélectionnés.",
          variant: "destructive"
        });
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const baseFilename = `messages-${folder}-${timestamp}`;

      let content: string;
      let mimeType: string;
      let extension: string;

      switch (exportOptions.format) {
        case 'csv':
          content = generateCSV(messagesToExport);
          mimeType = 'text/csv;charset=utf-8;';
          extension = 'csv';
          break;
        case 'html':
          content = generateHTML(messagesToExport);
          mimeType = 'text/html;charset=utf-8;';
          extension = 'html';
          break;
        case 'txt':
          content = generateText(messagesToExport);
          mimeType = 'text/plain;charset=utf-8;';
          extension = 'txt';
          break;
        case 'pdf':
          // Pour le PDF, on pourrait utiliser jsPDF ou une autre solution
          content = generateHTML(messagesToExport);
          mimeType = 'text/html;charset=utf-8;';
          extension = 'html'; // Temporairement en HTML
          toast({
            title: "Export PDF",
            description: "L'export PDF sera disponible prochainement. Export en HTML généré.",
          });
          break;
        default:
          throw new Error('Format non supporté');
      }

      downloadFile(content, `${baseFilename}.${extension}`, mimeType);

      toast({
        title: "Export réussi",
        description: `${messagesToExport.length} message(s) exporté(s) en ${exportOptions.format.toUpperCase()}.`
      });
    } catch (error) {
      console.error('Error exporting messages:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const messagesToPrint = getMessagesToExport();
    const htmlContent = generateHTML(messagesToPrint);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exporter les messages</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-4">
                  <p><strong>{getMessagesToExport().length}</strong> message(s) seront exportés</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Format d'export</Label>
                    <Select 
                      value={exportOptions.format} 
                      onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF (Recommandé)</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                        <SelectItem value="txt">Texte brut</SelectItem>
                        <SelectItem value="csv">CSV (Tableau)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Période</Label>
                    <Select 
                      value={exportOptions.dateRange} 
                      onValueChange={(value) => setExportOptions(prev => ({ ...prev, dateRange: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedMessages.length > 0 && (
                          <SelectItem value="selected">Messages sélectionnés ({selectedMessages.length})</SelectItem>
                        )}
                        <SelectItem value="all">Tous les messages</SelectItem>
                        <SelectItem value="last30">30 derniers jours</SelectItem>
                        <SelectItem value="last90">90 derniers jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Options</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="metadata"
                        checked={exportOptions.includeMetadata}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                        }
                      />
                      <Label htmlFor="metadata" className="text-sm">
                        Inclure les métadonnées (ID, dates détaillées)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="attachments"
                        checked={exportOptions.includeAttachments}
                        onCheckedChange={(checked) => 
                          setExportOptions(prev => ({ ...prev, includeAttachments: !!checked }))
                        }
                      />
                      <Label htmlFor="attachments" className="text-sm">
                        Inclure les références aux pièces jointes
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleExport} disabled={isExporting} className="flex-1">
                <FileText className="w-4 h-4 mr-2" />
                {isExporting ? 'Export...' : 'Exporter'}
              </Button>
              
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};