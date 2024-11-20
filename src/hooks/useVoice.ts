import { useCallback, useEffect, useState } from 'react';
import RNVoiceKit from '../RNVoiceKit';
import { VoiceEvent, VoiceMode } from '../types';

interface UseVoiceProps {
  /** Whether to update the transcript on partial results. Defaults to false. */
  enablePartialResults?: boolean;
  /** The locale to use for speech recognition. Defaults to 'en-US'. */
  locale?: string;
  /**
   * The mode to use for speech recognition. When 'continuous', the speech recognition will continue until it is stopped
   * or an error occurs. When 'single', the speech recognition will stop after the first final speech result is
   * returned. Defaults to 'single'.
   */
  mode?: VoiceMode;
}

export function useVoice(props?: UseVoiceProps) {
  const { enablePartialResults = false, locale = 'en-US', mode = VoiceMode.Continuous } = props ?? {};

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
    return RNVoiceKit.startListening({ locale, mode });
  }, [locale, mode]);

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
