import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Columns3, ListChecks, Plus, Trash2, X } from 'lucide-react';
import { useArtistLists, useArtistNotes } from '@/hooks/useArtistLists';
import { useArtists } from '@/hooks/useArtists';

interface ArtistListsPanelProps {
  professionalProfileId: string;
}

/** Listes de projet du professionnel, avec rôle envisagé par artiste et filtre par étiquette */
const ArtistListsPanel = ({ professionalProfileId }: ArtistListsPanelProps) => {
  // Tous les artistes, indépendamment des filtres de recherche en cours
  const { artists } = useArtists({ isUserAuthenticated: true });
  const { lists, unavailable, createList, deleteList, toggleArtist, setRole } = useArtistLists(professionalProfileId);
  const { noteFor, allTags } = useArtistNotes(professionalProfileId);
  const [newListName, setNewListName] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const artistById = new Map(artists.map(a => [a.id, a]));

  if (unavailable) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Les listes de projet seront disponibles après la mise à jour de la base de données.
        </CardContent>
      </Card>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createList.mutate({ name: newListName.trim() }, { onSuccess: () => setNewListName('') });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
            <Label htmlFor="panel-new-list" className="sr-only">Nom de la nouvelle liste</Label>
            <Input
              id="panel-new-list"
              className="flex-1 min-w-[220px]"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="Nouvelle liste (ex. Carmen 2027, Concours Sumi Jo)"
              maxLength={120}
            />
            <Button type="submit" disabled={!newListName.trim() || createList.isPending}>
              <Plus className="w-4 h-4 mr-1" />
              Créer la liste
            </Button>
          </form>
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtrer par étiquette :</span>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  size="sm"
                  variant={tagFilter === tag ? 'default' : 'outline'}
                  aria-pressed={tagFilter === tag}
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListChecks className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune liste</h3>
            <p className="text-muted-foreground">
              Créez une liste par production ou par concours, puis ajoutez-y des artistes depuis leur profil.
            </p>
          </CardContent>
        </Card>
      ) : (
        lists.map(list => {
          const items = list.items.filter(item =>
            !tagFilter || noteFor(item.artist_profile_id)?.tags.includes(tagFilter)
          );
          const compareIds = list.items.map(i => i.artist_profile_id).slice(0, 4).join(',');
          return (
            <Card key={list.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
                <CardTitle className="text-xl">
                  {list.name} <span className="text-base font-normal text-muted-foreground">({list.items.length})</span>
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  {list.items.length >= 2 && (
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/comparer?ids=${compareIds}`}>
                        <Columns3 className="w-4 h-4 mr-1" />
                        Comparer
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Supprimer la liste ${list.name}`}
                    onClick={() => { if (window.confirm(`Supprimer la liste « ${list.name} » ?`)) deleteList.mutate(list.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {tagFilter ? `Aucun artiste avec l'étiquette « ${tagFilter} ».` : 'Liste vide. Ajoutez des artistes depuis leur profil.'}
                  </p>
                ) : (
                  <ul className="divide-y">
                    {items.map(item => {
                      const artist = artistById.get(item.artist_profile_id);
                      const tags = noteFor(item.artist_profile_id)?.tags || [];
                      const roleId = `role-${item.id}`;
                      return (
                        <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                          <div className="flex-1 min-w-[180px]">
                            <Link to={`/artistes/${item.artist_profile_id}`} className="font-medium hover:underline">
                              {artist?.stage_name || 'Artiste'}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {[artist?.voice_type, artist?.location].filter(Boolean).join(' · ')}
                            </p>
                            {tags.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                              </div>
                            )}
                          </div>
                          <div className="w-full sm:w-56">
                            <Label htmlFor={roleId} className="sr-only">Rôle envisagé</Label>
                            <Input
                              id={roleId}
                              defaultValue={item.role_name || ''}
                              placeholder="Rôle envisagé"
                              onBlur={e => {
                                if (e.target.value !== (item.role_name || '')) setRole.mutate({ itemId: item.id, roleName: e.target.value.trim() });
                              }}
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`Retirer ${artist?.stage_name || 'cet artiste'} de la liste`}
                            onClick={() => toggleArtist.mutate({ listId: list.id, artistProfileId: item.artist_profile_id })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default ArtistListsPanel;
