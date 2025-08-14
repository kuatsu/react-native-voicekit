import type { VoiceModelDownloadStatus, VoiceStartListeningOptions } from '.';

export enum VoiceErrorCode {
  SPEECH_RECOGNIZER_NOT_AVAILABLE = 'ERR_SPEECH_RECOGNIZER_NOT_AVAILABLE',
  RECORDING_START_FAILED = 'ERR_RECORDING_START_FAILED',
  RECOGNITION_FAILED = 'ERR_RECOGNITION_FAILED',
  PERMISSION_DENIED = 'ERR_PERMISSION_DENIED',
  PERMISSION_RESTRICTED = 'ERR_PERMISSION_RESTRICTED',
  PERMISSION_NOT_DETERMINED = 'ERR_PERMISSION_NOT_DETERMINED',
  INVALID_STATE = 'ERR_INVALID_STATE',
  UNKNOWN = 'ERR_UNKNOWN',
}

export default interface NativeRNVoiceKit {
  startListening: (options: Required<VoiceStartListeningOptions>) => Promise<void>;
  stopListening: () => Promise<void>;
  isSpeechRecognitionAvailable: () => Promise<boolean>;
  isOnDeviceModelInstalled: (locale: string) => Promise<boolean>;
  getSupportedLocales: () => Promise<string[]>;
  downloadOnDeviceModel: (locale: string) => Promise<{ status: VoiceModelDownloadStatus; progressAvailable: boolean }>;
}
