interface AudioPeak {
  startTime: number;
  duration: number;
  amplitude: number;
}

export class AudioAnalyzer {
  private audioContext: AudioContext;
  private cache: Map<string, AudioPeak> = new Map();

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async analyzeAudioFile(audioUrl: string, extractDuration: number = 15): Promise<AudioPeak | null> {
    // Check cache first
    const cacheKey = `${audioUrl}_${extractDuration}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Fetch audio file
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Analyze the audio to find the most intense section
      const peak = this.findMostIntenseSection(audioBuffer, extractDuration);
      
      // Cache the result
      this.cache.set(cacheKey, peak);
      
      return peak;
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return null;
    }
  }

  private findMostIntenseSection(audioBuffer: AudioBuffer, extractDuration: number): AudioPeak {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const windowSize = Math.floor(sampleRate * extractDuration);
    const stepSize = Math.floor(sampleRate * 0.5); // Analyze every 0.5 seconds
    
    let maxAmplitude = 0;
    let bestStartSample = 0;
    
    // Slide window through the audio to find the section with highest RMS amplitude
    for (let start = 0; start <= channelData.length - windowSize; start += stepSize) {
      const rms = this.calculateRMS(channelData, start, start + windowSize);
      
      if (rms > maxAmplitude) {
        maxAmplitude = rms;
        bestStartSample = start;
      }
    }
    
    const startTime = bestStartSample / sampleRate;
    
    // Ensure we don't exceed audio duration
    const maxStartTime = Math.max(0, audioBuffer.duration - extractDuration);
    const adjustedStartTime = Math.min(startTime, maxStartTime);
    
    return {
      startTime: adjustedStartTime,
      duration: Math.min(extractDuration, audioBuffer.duration - adjustedStartTime),
      amplitude: maxAmplitude
    };
  }

  private calculateRMS(channelData: Float32Array, startSample: number, endSample: number): number {
    let sum = 0;
    const length = endSample - startSample;
    
    for (let i = startSample; i < endSample; i++) {
      sum += channelData[i] * channelData[i];
    }
    
    return Math.sqrt(sum / length);
  }

  // Create an optimized audio element that starts at the peak time
  createOptimizedAudio(audioUrl: string, peak: AudioPeak): HTMLAudioElement {
    const audio = new Audio(audioUrl);
    
    // Set up the audio to start at the peak time and play for the specified duration
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = peak.startTime;
    });
    
    // Stop playback after the extract duration
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= peak.startTime + peak.duration) {
        audio.pause();
        audio.dispatchEvent(new Event('ended'));
      }
    });
    
    return audio;
  }

  dispose() {
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    this.cache.clear();
  }
}

// Singleton instance
let audioAnalyzerInstance: AudioAnalyzer | null = null;

export const getAudioAnalyzer = (): AudioAnalyzer => {
  if (!audioAnalyzerInstance) {
    audioAnalyzerInstance = new AudioAnalyzer();
  }
  return audioAnalyzerInstance;
};