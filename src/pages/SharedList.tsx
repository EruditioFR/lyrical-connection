import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Loader2, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SharedListData {
  name: string;
  description: string | null;
  owner: string | null;
  items: {
    artist_profile_id: string;
    stage_name: string;
    voice_type: string | null;
    location: string | null;
    role_name: string | null;
    photo_path: string | null;
  }[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Liste de projet partagée par un professionnel, en lecture seule et sans compte */
const SharedList = () => {
  const { token } = useParams<{ token: string }>();
  const valid = !!token && UUID.test(token);

  const { data, isLoading } = useQuery({
    queryKey: ['shared-list', token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_shared_artist_list', { p_token: token as string });
      if (error) throw error;
      return data as unknown as SharedListData | null;
    },
    enabled: valid,
    retry: false,
  });

  const photoUrl = (path: string | null) =>
    path ? supabase.storage.from('artist-photos').getPublicUrl(path).data.publicUrl : null;

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : !valid || !data ? (
          <div className="py-16 text-center space-y-3">
            <h1 className="text-3xl">Liste introuvable</h1>
            <p className="text-muted-foreground">Ce lien de partage n'existe pas ou a été désactivé.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Liste partagée{data.owner ? ` par ${data.owner}` : ''}</p>
            <h1 className="mt-2 text-4xl">{data.name}</h1>
            {data.description && <p className="mt-3 text-muted-foreground">{data.description}</p>}

            {data.items.length === 0 ? (
              <p className="mt-10 text-muted-foreground">Cette liste est vide.</p>
            ) : (
              <ol className="mt-10 divide-y border-y">
                {data.items.map((item, i) => {
                  const url = photoUrl(item.photo_path);
                  return (
                    <li key={item.artist_profile_id} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
                      <span className="w-6 tabular-nums text-muted-foreground">{i + 1}</span>
                      {url ? (
                        <img src={url} alt={`Portrait de ${item.stage_name}`} className="h-24 w-20 rounded object-cover" />
                      ) : (
                        <div className="flex h-24 w-20 items-center justify-center rounded bg-muted">
                          <Music className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex-1 min-w-[12rem]">
                        <h2 className="text-2xl">{item.stage_name}</h2>
                        <p className="text-muted-foreground">
                          {[item.voice_type, item.location].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      {item.role_name && (
                        <p className="w-full sm:w-auto">
                          <span className="text-sm text-muted-foreground">Rôle envisagé : </span>
                          <span className="italic">{item.role_name}</span>
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="mt-8 text-sm text-muted-foreground">
              Les profils complets (enregistrements, répertoire) sont accessibles aux membres de Lyrisphere.{' '}
              <Link to="/auth" className="underline">Se connecter</Link>
            </p>
          </>
        )}
      </div>
    </Layout>
  );
};

export default SharedList;
