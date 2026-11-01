import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useArtists } from '@/hooks/useArtists';
import { supabase } from '@/integrations/supabase/client';

const AUDIO_EXT = /\.(mp3|m4a|aac|wav|ogg|oga|flac|webm)(\?|$)/i;

/** Premier enregistrement audio de chaque artiste, en une seule requête */
const useFirstAudioByArtist = (artistIds: string[]) => {
  const { data } = useQuery({
    queryKey: ['hero-voices', artistIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_airs')
        .select('artist_profile_id, title, type, file_path, external_url, display_order')
        .in('artist_profile_id', artistIds)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      const byArtist = new Map<string, { title: string; url: string }>();
      for (const air of data || []) {
        if (byArtist.has(air.artist_profile_id)) continue;
        const url = air.file_path
          ? supabase.storage.from('artist-airs').getPublicUrl(air.file_path).data.publicUrl
          : air.external_url && AUDIO_EXT.test(air.external_url) ? air.external_url : null;
        if (air.type === 'audio' && url) byArtist.set(air.artist_profile_id, { title: air.title.trim(), url });
      }
      return byArtist;
    },
    enabled: artistIds.length > 0,
  });
  return data || new Map<string, { title: string; url: string }>();
};

const HeroModern = () => {
  const { t } = useTranslation('home');
  // Vrais artistes de la plateforme plutôt qu'une image d'illustration
  const { artists } = useArtists({});
  const portraits = artists.filter(artist => artist.profile_image_url).slice(0, 4);
  const voices = useFirstAudioByArtist(portraits.map(a => a.id));

  // La voix au premier plan : un seul extrait joue à la fois
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => () => audioRef.current?.pause(), []);

  const toggle = (artistId: string) => {
    const voice = voices.get(artistId);
    if (!voice) return;
    if (playing === artistId) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(voice.url);
    audio.onended = () => setPlaying(null);
    audioRef.current = audio;
    // État affiché tout de suite : le chargement de l'extrait peut prendre quelques secondes
    setPlaying(artistId);
    audio.play().catch(() => setPlaying(current => (current === artistId ? null : current)));
  };

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-16 py-12 lg:py-20 border-b border-foreground">
          <div className="lg:w-1/2 text-center lg:text-left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-gold-600">
              Chanteurs lyriques · professionnels de l'opéra
            </p>
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-serif font-semibold leading-[1.05] mb-6 text-foreground">
              {t('hero.title')}
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" className="px-7 py-6 text-base" asChild>
                <Link to="/auth">
                  {t('hero.createProfile')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-7 py-6 text-base border-foreground" asChild>
                <Link to="/artistes">{t('hero.discoverArtists')}</Link>
              </Button>
            </div>
          </div>

          {portraits.length > 0 && (
            <div className="lg:w-1/2 w-full">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Écoutez la distribution
              </p>
              <ul className="grid grid-cols-2 gap-3 lg:gap-4">
                {portraits.map(artist => {
                  const voice = voices.get(artist.id);
                  const isPlaying = playing === artist.id;
                  return (
                    <li key={artist.id} className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                      <img
                        src={artist.profile_image_url as string}
                        alt={artist.stage_name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-white">
                        <Link to={`/artistes/${artist.id}`} className="block font-serif text-lg leading-tight hover:underline">
                          {artist.stage_name}
                        </Link>
                        {artist.voice_type && <p className="text-sm opacity-90">{artist.voice_type}</p>}
                        {voice && (
                          <button
                            type="button"
                            onClick={() => toggle(artist.id)}
                            aria-pressed={isPlaying}
                            aria-label={`${isPlaying ? 'Arrêter' : 'Écouter'} ${artist.stage_name} : ${voice.title}`}
                            className="mt-2 flex w-full items-center gap-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                          >
                            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/80 bg-black/30">
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
                            </span>
                            <span className="line-clamp-2 italic opacity-95">{voice.title}</span>
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroModern;
