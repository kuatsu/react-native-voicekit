//
//  VoiceError.swift
//  VoiceKit
//
//  Created by Maximilian Krause on 20.11.24.
//  Copyright © 2024 Kuatsu App Agency. All rights reserved.
//

import Foundation

enum VoiceError: Error {
  case speechRecognizerNotAvailable
  case recordingStartFailed
  case recognitionFailed
  case permissionDenied
  case permissionRestricted
  case permissionNotDetermined
  case invalidState
  case unknown(message: String = "An unknown error occurred")

  var code: String {
    switch self {
    case .speechRecognizerNotAvailable: "ERR_SPEECH_RECOGNIZER_NOT_AVAILABLE"
    case .recordingStartFailed: "ERR_RECORDING_START_FAILED"
    case .recognitionFailed: "ERR_RECOGNITION_FAILED"
    case .permissionDenied: "ERR_PERMISSION_DENIED"
    case .permissionRestricted: "ERR_PERMISSION_RESTRICTED"
    case .permissionNotDetermined: "ERR_PERMISSION_NOT_DETERMINED"
    case .invalidState: "ERR_INVALID_STATE"
    case .unknown: "ERR_UNKNOWN"
    }
  }

  var message: String {
    switch self {
    case .speechRecognizerNotAvailable:
      "Speech recognition is not available on this device"
    case .recordingStartFailed:
      "Failed to start audio recording"
    case .recognitionFailed:
      "Failed to recognize speech"
    case .permissionDenied:
      "Speech recognition permission was denied"
    case .permissionRestricted:
      "Speech recognition is restricted on this device"
    case .permissionNotDetermined:
      "Speech recognition permission was not yet determined"
    case .invalidState:
      "Invalid state, cannot perform action"
    case let .unknown(message):
      message
    }
  }
}
