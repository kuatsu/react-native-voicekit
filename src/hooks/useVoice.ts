import { useCallback, useEffect, useState } from 'react';
import RNVoiceKit from '../RNVoiceKit';
import { VoiceEvent } from '../types';

interface UseVoiceProps {
  // Whether to update the transcript on partial results. Defaults to false.
  enablePartialResults?: boolean;
}

export function useVoice(props?: UseVoiceProps) {
  const { enablePartialResults = false } = props ?? {};

  const [available, setAvailable] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  const handleAvailabilityChanged = useCallback((newAvailable: boolean) => {
    setAvailable(newAvailable);
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

  const startListening = useCallback((...args: Parameters<typeof RNVoiceKit.startListening>) => {
    return RNVoiceKit.startListening(...args);
  }, []);

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
    RNVoiceKit.addListener(VoiceEvent.PartialResult, handlePartialResult);
    RNVoiceKit.addListener(VoiceEvent.Result, handleFinalResult);

    return () => {
      // Clean up listeners
      RNVoiceKit.removeListener(VoiceEvent.AvailabilityChange, handleAvailabilityChanged);
      RNVoiceKit.removeListener(VoiceEvent.PartialResult, handlePartialResult);
      RNVoiceKit.removeListener(VoiceEvent.Result, handleFinalResult);
    };
  }, [handleAvailabilityChanged, handlePartialResult, handleFinalResult]);

  return {
    available,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
