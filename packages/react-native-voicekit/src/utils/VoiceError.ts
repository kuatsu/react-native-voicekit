import type { VoiceErrorCode } from '../types/native';

class VoiceError extends Error {
  code: VoiceErrorCode;
  details?: any;

  constructor(message: string, code: VoiceErrorCode, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export default VoiceError;
