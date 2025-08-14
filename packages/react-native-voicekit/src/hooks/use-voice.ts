import { useCallback, useEffect, useState } from 'react';
import RNVoiceKit from '../voice-kit';
import { VoiceEvent, type VoiceStartListeningOptions } from '../types/main';

interface UseVoiceProps extends VoiceStartListeningOptions {
  /** Whether to update the transcript on partial results. Defaults to false. */
  enablePartialResults?: boolean;
}

export function useVoice(props?: UseVoiceProps) {
  const { enablePartialResults = false, ...listeningOptions } = props ?? {};

  const [available, setAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  const handleAvailabilityChanged = useCallback((newAvailable: boolean) => {
    setAvailable(newAvailable);
  }, []);

  const handleListeningStateChanged = useCallback((newListening: boolean) => {
    setListening(newListening);
  }, []);

  const handlePartialResult = useCallback(
    (newPartialResult: string) => {
      if (!enablePartialResults) return;
      setTranscript(newPartialResult);
    },
    [enablePartialResults]
  );

  const handleFinalResult = useCallback((newFinalResult: string) => {
    setTranscript(newFinalResult);
  }, []);

  const startListening = useCallback(() => {
    return RNVoiceKit.startListening(listeningOptions);
  }, [listeningOptions]);

  const stopListening = useCallback(() => {
    return RNVoiceKit.stopListening();
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  useEffect(() => {
    // Get initial availability status
    RNVoiceKit.isAvailable().then(handleAvailabilityChanged);

    // Set up listeners
    RNVoiceKit.addListener(VoiceEvent.AvailabilityChange, handleAvailabilityChanged);
    RNVoiceKit.addListener(VoiceEvent.ListeningStateChange, handleListeningStateChanged);
    RNVoiceKit.addListener(VoiceEvent.PartialResult, handlePartialResult);
    RNVoiceKit.addListener(VoiceEvent.Result, handleFinalResult);

    return () => {
      // Clean up listeners
      RNVoiceKit.removeListener(VoiceEvent.AvailabilityChange, handleAvailabilityChanged);
      RNVoiceKit.removeListener(VoiceEvent.ListeningStateChange, handleListeningStateChanged);
      RNVoiceKit.removeListener(VoiceEvent.PartialResult, handlePartialResult);
      RNVoiceKit.removeListener(VoiceEvent.Result, handleFinalResult);
    };
  }, [handleAvailabilityChanged, handleListeningStateChanged, handlePartialResult, handleFinalResult]);

  return {
    available,
    listening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
