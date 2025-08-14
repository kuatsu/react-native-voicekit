/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NativeVoiceErrorCode } from '../types/native';

class VoiceError extends Error {
  code: NativeVoiceErrorCode;
  details?: any;

  constructor(message: string, code: NativeVoiceErrorCode, details?: any) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export default VoiceError;
