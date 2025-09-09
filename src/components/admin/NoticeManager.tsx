import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Calendar, User } from 'lucide-react';

interface Notice {
  name: string;
  title: string;
  content: string;
  lastModified: string;
  size: string;
}

const NoticeManager = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        // Charger la notice des comptes gratuits
        const response = await fetch('/NOTICE_COMPTES_GRATUITS.md');
        if (response.ok) {
          const content = await response.text();
          const notice: Notice = {
            name: 'NOTICE_COMPTES_GRATUITS.md',
            title: 'Notice : Création et Gestion des Comptes Gratuits',
            content: content,
            lastModified: new Date().toLocaleDateString('fr-FR'),
            size: `${Math.round(content.length / 1024)} KB`
          };
          setNotices([notice]);
          setSelectedNotice(notice);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Chargement des notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Notices et Documentation</h2>
          <p className="text-muted-foreground mt-1">
            Consultez toutes les notices techniques et guides d'utilisation
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {notices.length} notice{notices.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des notices */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notices disponibles</CardTitle>
              <CardDescription>
                Cliquez sur une notice pour la consulter
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64">
                <div className="space-y-2 p-4">
                  {notices.map((notice) => (
                    <div
                      key={notice.name}
                      onClick={() => setSelectedNotice(notice)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedNotice?.name === notice.name 
                          ? 'bg-muted border-primary' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">
                            {notice.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {notice.lastModified}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {notice.size}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Contenu de la notice sélectionnée */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {selectedNotice ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedNotice.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Fichier: {selectedNotice.name} • Mis à jour le {selectedNotice.lastModified}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {selectedNotice.size}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <div className="p-6">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed">
                        {selectedNotice.content}
                      </pre>
                    </div>
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez une notice pour la consulter</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NoticeManager;