import Foundation
import Speech

@objc(VoiceKit)
class VoiceKit: NSObject, VoiceKitServiceDelegate {
  private let service = VoiceKitService()

  override init() {
    super.init()
    service.delegate = self
  }

  // MARK: - VoiceKitServiceDelegate

  func onAvailabilityChanged(_ available: Bool) {
    VoiceKitEventEmitter.shared.sendEvent(
      withName: "RNVoiceKit.availability-change",
      body: available
    )
  }

  func onListeningStateChanged(_ isListening: Bool) {
    VoiceKitEventEmitter.shared.sendEvent(
      withName: "RNVoiceKit.listening-state-change",
      body: isListening
    )
  }

  func onPartialResult(_ result: String) {
    VoiceKitEventEmitter.shared.sendEvent(
      withName: "RNVoiceKit.partial-result",
      body: result
    )
  }

  func onResult(_ result: String) {
    VoiceKitEventEmitter.shared.sendEvent(
      withName: "RNVoiceKit.result",
      body: result
    )
  }

  func onError(_ error: VoiceError) {
    VoiceKitEventEmitter.shared.sendEvent(
      withName: "RNVoiceKit.error",
      body: [
        "code": error.code,
        "message": error.message,
      ]
    )
  }

  // MARK: - React Native Methods

  @objc(startListening:withResolver:withRejecter:)
  func startListening(options: [String: Any], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
      guard let self else { return }

      OperationQueue.main.addOperation {
        switch authStatus {
        case .authorized:
          do {
            try self.service.startRecording(options: options)
            resolve(true)
          } catch {
            reject(VoiceError.recordingStartFailed.code, VoiceError.recordingStartFailed.message, nil)
          }
        case .denied:
          reject(VoiceError.permissionDenied.code, VoiceError.permissionDenied.message, nil)
        case .restricted:
          reject(VoiceError.permissionRestricted.code, VoiceError.permissionRestricted.message, nil)
        case .notDetermined:
          reject(VoiceError.permissionNotDetermined.code, VoiceError.permissionNotDetermined.message, nil)
        @unknown default:
          reject(VoiceError.unknown(message: "Unknown authorization status").code, VoiceError.unknown(message: "Unknown authorization status").message, nil)
        }
      }
    }
  }

  @objc(stopListening:withRejecter:)
  func stopListening(resolve: @escaping RCTPromiseResolveBlock, reject _: @escaping RCTPromiseRejectBlock) {
    service.stopRecording()
    resolve(true)
  }

  @objc(isSpeechRecognitionAvailable:withRejecter:)
  func isSpeechRecognitionAvailable(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    withPromise(resolve: resolve, reject: reject) {
      self.service.isAvailable()
    }
  }

  @objc(getSupportedLocales:withRejecter:)
  func getSupportedLocales(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    withPromise(resolve: resolve, reject: reject) {
      self.service.getSupportedLocales()
    }
  }
}
