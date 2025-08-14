import Foundation

@objc(VoiceKitEventEmitter)
class VoiceKitEventEmitter: RCTEventEmitter {
  static var shared: VoiceKitEventEmitter!

  override init() {
    super.init()
    VoiceKitEventEmitter.shared = self
  }

  override func supportedEvents() -> [String]! {
    ["RNVoiceKit.result", "RNVoiceKit.partial-result", "RNVoiceKit.availability-change", "RNVoiceKit.listening-state-change", "RNVoiceKit.error", "RNVoiceKit.model-download-progress"]
  }
}
