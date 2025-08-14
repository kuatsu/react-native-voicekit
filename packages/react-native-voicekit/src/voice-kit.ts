import type { NativeVoiceKit } from './types/native';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import RNVoiceError from './utils/voice-error';
import { NativeVoiceErrorCode } from './types/native';
import { VoiceEvent, VoiceMode } from './types/main';
import { VoiceModelDownloadStatus, type VoiceEventMap, type VoiceStartListeningOptions } from './types/main';
import type VoiceError from './utils/voice-error';
import { LINKING_ERROR } from './utils/constants';
import { createProxiedNativeModule } from './utils/native';

// proxy NativeModules.VoiceKit to catch any errors thrown by the native module and wrap them in a VoiceError
const nativeInstance: NativeVoiceKit = NativeModules.VoiceKit
  ? createProxiedNativeModule(NativeModules.VoiceKit)
  : (new Proxy(
    {},
    {
      get() {
        throw new Error(LINKING_ERROR);
      },
    }
  ));

const nativeEmitter = new NativeEventEmitter(NativeModules.VoiceKitEventEmitter);

class RNVoiceKit {
  private listeners: Partial<{
    [K in VoiceEvent]: ((...arguments_: VoiceEventMap[K]) => void)[]
  }> = {};

  constructor() {
    for (const event of Object.values(VoiceEvent)) {
      nativeEmitter.addListener(`RNVoiceKit.${event}`, (...arguments_) => {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
          if (event === VoiceEvent.Error) {
            // Convert the error map back to a VoiceError object
            const errorData = arguments_[0] as { code: NativeVoiceErrorCode; message: string };
            const voiceError = new RNVoiceError(errorData.message, errorData.code);
            for (const listener of eventListeners) {
              (listener as (error: VoiceError) => void)(voiceError);
            }
          } else {
            for (const listener of eventListeners) {
              (listener as (...arguments__: unknown[]) => void)(...arguments_);
            }
          }
        }
      });
    }
  }

  /**
   * Starts listening for speech.
   *
   * @param options - The options to start listening with.
   */
  async startListening(options?: VoiceStartListeningOptions): Promise<void> {
    const defaultOptions: Required<VoiceStartListeningOptions> = {
      locale: 'en-US',
      mode: VoiceMode.Continuous,
      silenceTimeoutMs: 1000,
      muteAndroidBeep: false,
      useOnDeviceRecognizer: false,
    };

    await nativeInstance.startListening({
      ...defaultOptions,
      ...options,
    });
  }

  /**
   * Stops listening for speech.
   */
  async stopListening(): Promise<void> {
    await nativeInstance.stopListening();
  }

  /**
   * Checks if a speech recognizer is available on the device.
   *
   * @returns Whether a speech recognizer is available.
   */
  async isAvailable(): Promise<boolean> {
    return await nativeInstance.isSpeechRecognitionAvailable();
  }

  /**
   * Gets the list of supported locales for speech recognition. On Android, this gets the list of supported locales for
   * the on-device speech recognizer. Note that this does not check if the model is installed already. Use
   * `isOnDeviceModelInstalled()` to check if the model for a given locale is installed before using it.
   * Does not work on Android versions below 13 and will return an empty array for those versions.
   *
   * @returns The list of supported locales.
   */
  async getSupportedLocales(): Promise<string[]> {
    return await nativeInstance.getSupportedLocales();
  }

  /**
   * Checks if the on-device speech recognizer model for the given locale is installed. If it is not, use
   * `downloadOnDeviceModel()` to download it. Only works on Android 13+.
   * Does not have any effect on iOS and will simply check if the locale is supported.
   *
   * @param locale - The locale to check.
   * @returns Whether the model is installed.
   */
  async isOnDeviceModelInstalled(locale: string): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const supportedLocales = await this.getSupportedLocales();
      return supportedLocales.includes(locale);
    }

    return await nativeInstance.isOnDeviceModelInstalled(locale);
  }

  /**
   * Downloads the on-device speech recognizer model for the given locale. Only works on Android 13+.
   * When the download was successfully started, the promise will resolve with a `started` status.
   * On Android 14+,you can listen to the `VoiceEvent.ModelDownloadProgress` event to track the download progress.
   * Does not have any effect on iOS and will simply return a `started` status if the locale is supported, or throw
   * an error if it is not.
   *
   * @returns The status of the model download and whether download progress is available via the
   * `VoiceEvent.ModelDownloadProgress` event.
   */
  async downloadOnDeviceModel(
    locale: string
  ): Promise<{ status: VoiceModelDownloadStatus; progressAvailable: boolean }> {
    if (Platform.OS === 'ios') {
      const supportedLocales = await this.getSupportedLocales();
      if (supportedLocales.includes(locale)) {
        return { status: VoiceModelDownloadStatus.Started, progressAvailable: false };
      } else {
        throw new RNVoiceError('Locale is not supported', NativeVoiceErrorCode.INVALID_STATE); // TODO: better code
      }
    }

    return await nativeInstance.downloadOnDeviceModel(locale);
  }

  addListener<T extends VoiceEvent>(event: T, listener: (...arguments_: VoiceEventMap[T]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  removeListener<T extends VoiceEvent>(event: T, listener: (...arguments_: VoiceEventMap[T]) => void) {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      this.listeners[event] = eventListeners.filter((l) => l !== listener) as typeof eventListeners;
    }
  }
}

export default new RNVoiceKit();
