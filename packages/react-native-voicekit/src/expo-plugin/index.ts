import { AndroidConfig, type ConfigPlugin, withInfoPlist } from '@expo/config-plugins';
import type { RNVoiceKitConfigPluginOptions } from './types';

const DEFAULT_MICROPHONE_PERMISSION = 'Allow $(PRODUCT_NAME) to access the microphone to recognize your voice.';
const DEFAULT_SPEECH_RECOGNITION_PERMISSION = 'Allow $(PRODUCT_NAME) to securely recognize your voice.';

const withIosPermissions: ConfigPlugin<RNVoiceKitConfigPluginOptions> = (
  config,
  { microphonePermission, speechRecognitionPermission } = {}
) => {
  return withInfoPlist(config, (newConfig) => {
    if (microphonePermission !== false) {
      newConfig.modResults.NSMicrophoneUsageDescription =
        microphonePermission || newConfig.modResults.NSMicrophoneUsageDescription || DEFAULT_MICROPHONE_PERMISSION;
    }
    if (speechRecognitionPermission !== false) {
      newConfig.modResults.NSSpeechRecognitionUsageDescription =
        speechRecognitionPermission ||
        newConfig.modResults.NSSpeechRecognitionUsageDescription ||
        DEFAULT_SPEECH_RECOGNITION_PERMISSION;
    }

    return newConfig;
  });
};

const withAndroidPermissions: ConfigPlugin = (config) => {
  return AndroidConfig.Permissions.withPermissions(config, [
    'android.permission.RECORD_AUDIO',
    'android.permission.MODIFY_AUDIO_SETTINGS',
  ]);
};

const withVoiceKit: ConfigPlugin<RNVoiceKitConfigPluginOptions> = (config, props = {}) => {
  config = withIosPermissions(config, props ?? {});
  config = withAndroidPermissions(config);
  return config;
};

export default withVoiceKit;
