export interface RNVoiceKitConfigPluginOptions {
  /**
   * Custom `NSSpeechRecognitionUsageDescription` message.
   */
  speechRecognitionPermission?: string | false;
  /**
   * Custom `NSMicrophoneUsageDescription` message.
   */
  microphonePermission?: string | false;
}
