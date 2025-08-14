package com.voicekit

sealed class VoiceError(
  val code: String,
  message: String
) : Exception(message) {
  object SpeechRecognizerNotAvailable : VoiceError(
    "ERR_SPEECH_RECOGNIZER_NOT_AVAILABLE",
    "Speech recognition is not available on this device"
  )
  object RecordingStartFailed : VoiceError(
    "ERR_RECORDING_START_FAILED",
    "Failed to start audio recording"
  )
  object RecognitionFailed : VoiceError(
    "ERR_RECOGNITION_FAILED",
    "Failed to recognize speech"
  )
  object PermissionDenied : VoiceError(
    "ERR_PERMISSION_DENIED",
    "Speech recognition permission was denied"
  )
  object PermissionRestricted : VoiceError(
    "ERR_PERMISSION_RESTRICTED",
    "Speech recognition is restricted on this device"
  )
  object PermissionNotDetermined : VoiceError(
    "ERR_PERMISSION_NOT_DETERMINED",
    "Speech recognition permission was not yet determined"
  )
  object InvalidState : VoiceError(
    "ERR_INVALID_STATE",
    "Invalid state, cannot perform action"
  )
  class Unknown(message: String = "An unknown error occurred") : VoiceError(
    "ERR_UNKNOWN",
    message
  )
}
