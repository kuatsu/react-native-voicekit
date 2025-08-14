export enum VoiceEvent {
  Result = 'result',
  PartialResult = 'partial-result',
  AvailabilityChange = 'availability-change',
  ListeningStateChange = 'listening-state-change',
  ModelDownloadProgress = 'model-download-progress',
  Error = 'error',
}

import VoiceError from '../utils/VoiceError';

export interface VoiceEventMap extends Record<VoiceEvent, any[]> {
  [VoiceEvent.Result]: [string];
  [VoiceEvent.PartialResult]: [string];
  [VoiceEvent.AvailabilityChange]: [boolean];
  [VoiceEvent.ListeningStateChange]: [boolean];
  [VoiceEvent.ModelDownloadProgress]: [number];
  [VoiceEvent.Error]: [VoiceError];
}

export enum VoiceMode {
  Single = 'single',
  Continuous = 'continuous',
  ContinuousAndStop = 'continuous-and-stop',
}

export enum VoiceModelDownloadStatus {
  Started = 'started',
  Scheduled = 'scheduled',
}

export interface VoiceStartListeningOptions {
  /**
   * The locale to use for speech recognition. Defaults to `en-US`.
   */
  locale?: string;
  /**
   * The mode to use for speech recognition. Can either be `continuous` or `single`.
   *
   * - `single`: The speech recognizer will automatically stop after the first utterance or after a period of silence.
   * This period is device-specific and is generally much shorter on Android than on iOS. To continue listening until
   * the user has spoken, use `continuous-and-stop` instead.
   * - `continuous`: The speech recognizer will continue to listen until stopped manually or an error occurs and will
   * emit regular `partial-result` events. When the user stops speaking, it will emit a `result` event and continue
   * listening for more speech.
   * - `continuous-and-stop`: The speech recognizer will continue to listen until stopped manually, an error occurs or
   * after the first utterance. When the user stops speaking, it will emit a `result` event and stop listening.
   *
   * Defaults to `single`.
   */
  mode?: VoiceMode;
  /**
   * The period of silence after the user stops speaking before the speech recognizer emits a `result` event.
   * Provided in milliseconds.
   *
   * Defaults to 1000.
   */
  silenceTimeoutMs?: number;
  /**
   * Whether to try and mute the beep sound Android makes when starting and stopping the speech recognizer. This will
   * mute the device's music and notification audio streams when starting to listen and unmute them when stopping. This
   * does not work on all devices. Defaults to `false`.
   */
  muteAndroidBeep?: boolean;
  /**
   * Whether to force usage of the on-device speech recognizer. Does not have any effect on iOS. Only works on Android
   * 13 and above. Defaults to `false`.
   * Note: When using the on-device recognizer, some locales returned by `getSupportedLocales()` may not be installed
   * on the device yet and need to be installed using `downloadOnDeviceModel()` first.
   */
  useOnDeviceRecognizer?: boolean;
}
