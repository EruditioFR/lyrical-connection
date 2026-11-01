import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Plus, X } from 'lucide-react';
import { useArtistLists, useArtistNotes } from '@/hooks/useArtistLists';

interface ProfessionalArtistToolsProps {
  professionalProfileId: string;
  artistProfileId: string;
  artistName: string;
}

/** Suivi privé d'un artiste par un professionnel : listes de projet, notes et étiquettes */
const ProfessionalArtistTools = ({ professionalProfileId, artistProfileId, artistName }: ProfessionalArtistToolsProps) => {
  const { lists, unavailable: listsUnavailable, createList, toggleArtist } = useArtistLists(professionalProfileId);
  const { noteFor, allTags, unavailable: notesUnavailable, saveNote } = useArtistNotes(professionalProfileId);
  const existing = noteFor(artistProfileId);

  const [newListName, setNewListName] = useState('');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Recharger le formulaire seulement quand la fiche enregistrée change, pas à chaque frappe
  useEffect(() => {
    setNote(existing?.note || '');
    setTags(existing?.tags || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id, existing?.updated_at]);

  if (listsUnavailable || notesUnavailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Mon suivi de l'artiste
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les listes et notes privées seront disponibles après la mise à jour de la base de données.
          </p>
        </CardContent>
      </Card>
    );
  }

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setTagInput('');
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    createList.mutate({ name }, {
      onSuccess: (list) => {
        setNewListName('');
        toggleArtist.mutate({ listId: list.id, artistProfileId });
      },
    });
  };

  const suggestions = allTags.filter(t => !tags.includes(t) && t.toLowerCase().startsWith(tagInput.toLowerCase())).slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Mon suivi de l'artiste
        </CardTitle>
        <p className="text-sm text-muted-foreground">Visible par vous seul.</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Listes de projet */}
        <section className="space-y-3">
          <h4>Listes de projet</h4>
          {lists.length === 0 && (
            <p className="text-sm text-muted-foreground">Créez une liste par production, rôle ou concours.</p>
          )}
          <ul className="space-y-2">
            {lists.map(list => {
              const checked = list.items.some(i => i.artist_profile_id === artistProfileId);
              const inputId = `list-${list.id}`;
              return (
                <li key={list.id} className="flex items-center gap-3">
                  <Checkbox
                    id={inputId}
                    checked={checked}
                    disabled={toggleArtist.isPending}
                    onCheckedChange={() => toggleArtist.mutate({ listId: list.id, artistProfileId })}
                  />
                  <Label htmlFor={inputId} className="font-normal">
                    {list.name} <span className="text-muted-foreground">({list.items.length})</span>
                  </Label>
                </li>
              );
            })}
          </ul>
          <form onSubmit={handleCreateList} className="flex gap-2">
            <Label htmlFor="new-list-name" className="sr-only">Nom de la nouvelle liste</Label>
            <Input
              id="new-list-name"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="Nouvelle liste (ex. Carmen 2027)"
              maxLength={120}
            />
            <Button type="submit" variant="outline" disabled={!newListName.trim() || createList.isPending}>
              <Plus className="w-4 h-4 mr-1" />
              Créer
            </Button>
          </form>
        </section>

        {/* Notes et étiquettes */}
        <section className="space-y-3">
          <h4>Notes privées</h4>
          <Label htmlFor="artist-private-note" className="sr-only">Notes privées sur {artistName}</Label>
          <Textarea
            id="artist-private-note"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Audition, impressions, rôles envisagés, contacts…"
            rows={5}
          />
          <div className="space-y-2">
            <Label htmlFor="artist-tag-input">Étiquettes</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button type="button" aria-label={`Retirer l'étiquette ${tag}`} onClick={() => setTags(tags.filter(t => t !== tag))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                id="artist-tag-input"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="ex. à réentendre, dispo été"
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim()}>Ajouter</Button>
            </div>
            {tagInput && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <Button key={s} type="button" size="sm" variant="ghost" onClick={() => { setTags([...tags, s]); setTagInput(''); }}>
                    {s}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => saveNote.mutate({ artistProfileId, note, tags })}
            disabled={saveNote.isPending}
          >
            Enregistrer
          </Button>
        </section>
      </CardContent>
    </Card>
  );
};

export default ProfessionalArtistTools;
