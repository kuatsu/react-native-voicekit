import RNVoiceKit from './RNVoiceKit';
import { VoiceErrorCode } from './types/native';
import VoiceError from './utils/VoiceError';

export * from './types/index';
export { useVoice } from './hooks/useVoice';
export { RNVoiceKit as VoiceKit, VoiceError, VoiceErrorCode };
