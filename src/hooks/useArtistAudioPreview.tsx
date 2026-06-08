import { useState, useEffect, useRef } from 'react';
import { useArtistAirs } from './useArtistAirs';
import { getAudioAnalyzer } from '../utils/audioAnalysis';

interface AudioPreviewState {
  isPlaying: boolean;
  currentArtistId: string | null;
  audio: HTMLAudioElement | null;
  isAnalyzing: boolean;
  currentTrackTitle: string | null;
}

// Global state to manage audio playback across all artist cards
let globalAudioState: AudioPreviewState = {
  isPlaying: false,
  currentArtistId: null,
  audio: null,
  isAnalyzing: false,
  currentTrackTitle: null
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
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
      audio: null,
      isAnalyzing: false,
      currentTrackTitle: null
    });
  };

  const startAudioPreview = async () => {
    // Clear any existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Stop any currently playing audio
    stopCurrentAudio();

    // Get a random audio track
    const randomTrack = getRandomAudioTrack();
    if (!randomTrack) return;

    // Start analyzing after a short delay to avoid immediate analysis on quick hovers
    hoverTimeoutRef.current = setTimeout(async () => {
      const audioUrl = getAudioUrl(randomTrack);
      if (!audioUrl) return;

      try {
        // Set analyzing state
        setGlobalAudioState({
          isAnalyzing: true,
          currentArtistId: artistId,
          currentTrackTitle: randomTrack.title
        });

        // Analyze the audio to find the best excerpt
        const audioAnalyzer = getAudioAnalyzer();
        const peak = await audioAnalyzer.analyzeAudioFile(audioUrl, 15); // 15 second excerpt
        
        // Check if we're still supposed to be playing (user hasn't moved away)
        if (globalAudioState.currentArtistId !== artistId || !globalAudioState.isAnalyzing) {
          return;
        }

        if (peak) {
          // Create optimized audio with the peak section
          const audio = audioAnalyzer.createOptimizedAudio(audioUrl, peak);
          audio.volume = 0.6; // Set a reasonable volume
          
          // Set up event listeners
          audio.addEventListener('ended', stopCurrentAudio);
          audio.addEventListener('error', () => {
            console.error('Error playing audio preview for artist:', artistId);
            stopCurrentAudio();
          });

          // Start playing the optimized excerpt
          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                setGlobalAudioState({
                  isPlaying: true,
                  currentArtistId: artistId,
                  audio: audio,
                  isAnalyzing: false,
                  currentTrackTitle: randomTrack.title
                });
              })
              .catch(error => {
                console.error('Error playing audio preview:', error);
                stopCurrentAudio();
              });
          }
        } else {
          // Fallback to regular audio if analysis fails
          const audio = new Audio(audioUrl);
          audio.volume = 0.6;
          audio.currentTime = Math.max(0, (audio.duration || 60) * 0.3); // Start at 30% through the track
          
          audio.addEventListener('ended', stopCurrentAudio);
          audio.addEventListener('error', () => {
            console.error('Error playing audio preview for artist:', artistId);
            stopCurrentAudio();
          });

          const playPromise = audio.play();
          if (playPromise) {
            playPromise
              .then(() => {
                setGlobalAudioState({
                  isPlaying: true,
                  currentArtistId: artistId,
                  audio: audio,
                  isAnalyzing: false,
                  currentTrackTitle: randomTrack.title
                });
              })
              .catch(error => {
                console.error('Error playing audio preview:', error);
                stopCurrentAudio();
              });
          }
        }
      } catch (error) {
        console.error('Error creating audio preview:', error);
        stopCurrentAudio();
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
    isAnalyzing: localState.currentArtistId === artistId && localState.isAnalyzing,
    hasAudioTracks,
    currentTrackTitle: localState.currentArtistId === artistId 
      ? localState.currentTrackTitle || (localState.isAnalyzing ? 'Analyse en cours...' : null)
      : null
  };
};