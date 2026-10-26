import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, CalendarClock } from 'lucide-react';
import { APPLICATION_PIPELINE, applicationStatusLabel, type ApplicationStatus } from '@/constants/applicationStatus';
import { toCSV, downloadFile } from '@/utils/auditionSchedule';
import type { ApplicationWithDetails } from '@/hooks/useApplications';

interface ApplicationsPipelineProps {
  applications: ApplicationWithDetails[];
  castingTitle: string;
  isUpdating: boolean;
  onMove: (applicationId: string, status: ApplicationStatus) => void;
}

const formatAudition = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Vue en colonnes des candidatures d'un casting : reçues → présélectionnées → retenues / refusées */
const ApplicationsPipeline = ({ applications, castingTitle, isUpdating, onMove }: ApplicationsPipelineProps) => {
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);

  const exportCsv = () => {
    const rows = applications.map(a => [
      a.artist_profiles?.stage_name,
      a.artist_profiles?.voice_type,
      a.artist_profiles?.location,
      applicationStatusLabel(a.status),
      new Date(a.created_at).toLocaleDateString('fr-FR'),
      a.audition_scheduled_at ? new Date(a.audition_scheduled_at).toLocaleString('fr-FR') : '',
      a.artist_profiles?.contact_email,
      a.artist_profiles?.phone,
      a.professional_notes,
    ]);
    const csv = toCSV(['Artiste', 'Tessiture', 'Lieu', 'Statut', 'Candidature', 'Audition', 'E-mail', 'Téléphone', 'Notes'], rows);
    downloadFile(`candidatures-${castingTitle.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}.csv`, csv, 'text/csv;charset=utf-8');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Faites glisser une candidature d'une colonne à l'autre, ou utilisez les flèches.
        </p>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={applications.length === 0}>
          <Download className="h-4 w-4 mr-1" />
          Exporter en CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {APPLICATION_PIPELINE.map((column, index) => {
          const items = applications.filter(a => a.status === column.status);
          const previous = APPLICATION_PIPELINE[index - 1];
          const next = APPLICATION_PIPELINE[index + 1];
          return (
            <section
              key={column.status}
              aria-label={`${column.plural} (${items.length})`}
              className={`rounded-lg border bg-muted/40 p-3 transition-colors ${dragOver === column.status ? 'border-primary bg-primary/5' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(column.status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData('text/plain');
                const app = applications.find(a => a.id === id);
                if (app && app.status !== column.status) onMove(id, column.status);
              }}
            >
              <h3 className="mb-3 flex items-baseline justify-between text-base">
                {column.plural}
                <span className="text-sm font-normal text-muted-foreground">{items.length}</span>
              </h3>
              <ul className="space-y-2">
                {items.map(app => (
                  <li
                    key={app.id}
                    draggable={!isUpdating}
                    onDragStart={e => e.dataTransfer.setData('text/plain', app.id)}
                  >
                    <Card className="cursor-grab active:cursor-grabbing">
                      <CardContent className="space-y-2 p-3">
                        <div>
                          <Link to={`/artistes/${app.artist_profile_id}`} className="font-medium hover:underline">
                            {app.artist_profiles?.stage_name || 'Artiste'}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {[app.artist_profiles?.voice_type, app.artist_profiles?.location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        {app.audition_scheduled_at && (
                          <p className="flex items-center gap-1 text-sm">
                            <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            Audition le {formatAudition(app.audition_scheduled_at)}
                          </p>
                        )}
                        <div className="flex justify-between">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!previous || isUpdating}
                            aria-label={previous ? `Passer ${app.artist_profiles?.stage_name} en « ${previous.label} »` : 'Première étape'}
                            onClick={() => previous && onMove(app.id, previous.status)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={!next || isUpdating}
                            aria-label={next ? `Passer ${app.artist_profiles?.stage_name} en « ${next.label} »` : 'Dernière étape'}
                            onClick={() => next && onMove(app.id, next.status)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
              {items.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Aucune</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ApplicationsPipeline;
