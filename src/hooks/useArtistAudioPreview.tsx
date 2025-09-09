import { useState, useEffect, useRef } from 'react';
import { useArtistAirs } from './useArtistAirs';

interface AudioPreviewState {
  isPlaying: boolean;
  currentArtistId: string | null;
  audio: HTMLAudioElement | null;
}

// Global state to manage audio playback across all artist cards
let globalAudioState: AudioPreviewState = {
  isPlaying: false,
  currentArtistId: null,
  audio: null
};

const subscribers = new Set<() => void>();

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

const setGlobalAudioState = (newState: Partial<AudioPreviewState>) => {
  globalAudioState = { ...globalAudioState, ...newState };
  notifySubscribers();
};

export const useArtistAudioPreview = (artistId: string) => {
  const { airs, getFileUrl } = useArtistAirs(artistId);
  const [localState, setLocalState] = useState(globalAudioState);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Subscribe to global state changes
  useEffect(() => {
    const updateLocalState = () => setLocalState({ ...globalAudioState });
    subscribers.add(updateLocalState);
    return () => {
      subscribers.delete(updateLocalState);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const getRandomAudioTrack = () => {
    const audioTracks = airs.filter(air => 
      air.is_active && 
      air.type === 'audio' && 
      (air.file_path || air.external_url)
    );
    
    if (audioTracks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * audioTracks.length);
    return audioTracks[randomIndex];
  };

  const getAudioUrl = (air: any) => {
    if (air.type === 'url') {
      return air.external_url;
    } else if (air.file_path) {
      return getFileUrl(air.file_path);
    }
    return '';
  };

  const stopCurrentAudio = () => {
    if (globalAudioState.audio) {
      globalAudioState.audio.pause();
      globalAudioState.audio.currentTime = 0;
    }
    setGlobalAudioState({
      isPlaying: false,
      currentArtistId: null,
      audio: null
    });
  };

  const startAudioPreview = () => {
    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Stop any currently playing audio
    stopCurrentAudio();

    // Get a random audio track
    const randomTrack = getRandomAudioTrack();
    if (!randomTrack) return;

    // Start playing after a short delay to avoid immediate playback on quick hovers
    hoverTimeoutRef.current = setTimeout(() => {
      const audioUrl = getAudioUrl(randomTrack);
      if (!audioUrl) return;

      try {
        const audio = new Audio(audioUrl);
        audio.volume = 0.6; // Set a reasonable volume
        
        // Set up event listeners
        audio.addEventListener('ended', stopCurrentAudio);
        audio.addEventListener('error', () => {
          console.error('Error playing audio preview for artist:', artistId);
          stopCurrentAudio();
        });

        // Start playing
        const playPromise = audio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              setGlobalAudioState({
                isPlaying: true,
                currentArtistId: artistId,
                audio: audio
              });
            })
            .catch(error => {
              console.error('Error playing audio preview:', error);
              stopCurrentAudio();
            });
        }
      } catch (error) {
        console.error('Error creating audio preview:', error);
      }
    }, 300); // 300ms delay
  };

  const stopAudioPreview = () => {
    // Clear hover timeout if leaving before audio starts
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Only stop if this card is currently playing
    if (globalAudioState.currentArtistId === artistId) {
      // Add a small delay before stopping to avoid cutting off audio on quick movements
      setTimeout(() => {
        if (globalAudioState.currentArtistId === artistId) {
          stopCurrentAudio();
        }
      }, 100);
    }
  };

  const hasAudioTracks = airs.some(air => 
    air.is_active && 
    air.type === 'audio' && 
    (air.file_path || air.external_url)
  );

  return {
    startAudioPreview,
    stopAudioPreview,
    isPlaying: localState.currentArtistId === artistId && localState.isPlaying,
    hasAudioTracks,
    currentTrackTitle: localState.currentArtistId === artistId && localState.isPlaying 
      ? getRandomAudioTrack()?.title || 'Audio en cours...'
      : null
  };
};