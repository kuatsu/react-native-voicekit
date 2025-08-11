import AVFoundation
import Foundation
import Speech

// MARK: - VoiceKitServiceDelegate

protocol VoiceKitServiceDelegate: AnyObject {
  func onAvailabilityChanged(_ available: Bool)
  func onPartialResult(_ result: String)
  func onResult(_ result: String)
  func onError(_ error: VoiceError)
  func onListeningStateChanged(_ isListening: Bool)
}

// MARK: - VoiceKitService

class VoiceKitService: NSObject, SFSpeechRecognizerDelegate {
  private var speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
  private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
  private var recognitionTask: SFSpeechRecognitionTask?
  private let audioEngine = AVAudioEngine()
  private var lastResultTimer: Timer?
  private var lastTranscription: String?
  private var isListening: Bool = false {
    didSet {
      delegate?.onListeningStateChanged(isListening)
    }
  }

  // Store original audio session configuration for restoration
  private var originalAudioCategory: AVAudioSession.Category?
  private var originalAudioMode: AVAudioSession.Mode?
  private var originalAudioOptions: AVAudioSession.CategoryOptions?

  weak var delegate: VoiceKitServiceDelegate?

  override init() {
    super.init()
    speechRecognizer?.delegate = self
  }

  func speechRecognizer(_: SFSpeechRecognizer, availabilityDidChange available: Bool) {
    delegate?.onAvailabilityChanged(available)
  }

  func startRecording(options: [String: Any]) throws {
    Logger.log(level: .info, message: "Starting recording")
    Logger.log(level: .debug, message: "Options: \(options)")

    if isListening {
      Logger.log(level: .warning, message: "Already listening, aborting startRecording")
      delegate?.onError(.invalidState)
      return
    }

    // Cancel any ongoing tasks
    recognitionTask?.cancel()
    recognitionTask = nil

    // Configure speech recognizer
    let locale = options["locale"] as? String
    speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: locale ?? "en-US"))
    speechRecognizer?.delegate = self

    // Configure audio session
    let audioSession = AVAudioSession.sharedInstance()

    // Save original audio session configuration for restoration
    originalAudioCategory = audioSession.category
    originalAudioMode = audioSession.mode
    originalAudioOptions = audioSession.categoryOptions

    try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
    try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

    // Create and configure recognition request
    recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
    recognitionRequest?.shouldReportPartialResults = true

    // Start recognition task
    recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest!) { [weak self] result, error in
      guard let self else { return }

      if error != nil {
        handleError(error)
      }

      if let result {
        // Store the latest transcription
        lastTranscription = result.bestTranscription.formattedString

        // if trimmed lastTranscription is empty, stop and dont do anything
        if lastTranscription?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true {
          Logger.log(level: .debug, message: "Last transcription is empty, stopping")
          return
        }

        Logger.log(level: .debug, message: "SpeechRecognizerResult received: \(lastTranscription)")

        // Emit partial results
        delegate?.onPartialResult(lastTranscription ?? "")

        // Reset the timer
        lastResultTimer?.invalidate()
        lastResultTimer = Timer.scheduledTimer(withTimeInterval: TimeInterval((options["silenceTimeoutMs"] as? Double ?? 1000.0) / 1000.0), repeats: false) { [weak self] _ in
          guard let self else { return }
          Logger.log(level: .debug, message: "Final result timer fired")
          if let finalTranscription = lastTranscription {
            // If options.mode is 'single', 'continuous-and-stop' or if mode is not provided, stop the recording
            if let mode = options["mode"] as? String, mode == "single" || mode == "continuous-and-stop" || mode == nil {
              stopRecording()
            }

            delegate?.onResult(finalTranscription)
          }
        }
      }
    }

    // Configure audio engine
    let inputNode = audioEngine.inputNode
    let recordingFormat = inputNode.outputFormat(forBus: 0)
    inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { [weak self] buffer, _ in
      self?.recognitionRequest?.append(buffer)
    }

    audioEngine.prepare()
    try audioEngine.start()

    isListening = true
  }

  private func handleError(_ error: Error?) {
    lastResultTimer?.invalidate()
    lastResultTimer = nil
    lastTranscription = nil
    audioEngine.stop()
    audioEngine.inputNode.removeTap(onBus: 0)
    recognitionRequest = nil
    recognitionTask = nil
    isListening = false

    // Restore original audio session configuration
    restoreAudioSession()

    if let error = error as NSError?, error.domain == "kAFAssistantErrorDomain" && error.code == 1110 {
      Logger.log(level: .debug, message: "No speech detected")
      return
    }

    Logger.log(level: .error, message: "Error: \(error)")
    // TODO: map error to VoiceError
    delegate?.onError(.unknown(message: error?.localizedDescription ?? "An unknown error occurred"))
  }

  func stopRecording() {
    Logger.log(level: .info, message: "Stopping recording")

    if !isListening {
      Logger.log(level: .warning, message: "Not listening, aborting stopRecording")
      delegate?.onError(.invalidState)
      return
    }

    audioEngine.stop()
    audioEngine.inputNode.removeTap(onBus: 0)
    recognitionRequest?.endAudio()
    recognitionRequest = nil
    recognitionTask?.cancel()
    recognitionTask = nil
    isListening = false

    // Restore original audio session configuration
    restoreAudioSession()
  }

  private func restoreAudioSession() {
    guard let originalCategory = originalAudioCategory,
          let originalMode = originalAudioMode,
          let originalOptions = originalAudioOptions else {
      Logger.log(level: .debug, message: "No original audio session configuration to restore")
      return
    }

    do {
      let audioSession = AVAudioSession.sharedInstance()
      try audioSession.setCategory(originalCategory, mode: originalMode, options: originalOptions)
      Logger.log(level: .debug, message: "Audio session restored to original configuration")
    } catch {
      Logger.log(level: .error, message: "Failed to restore audio session: \(error)")
    }

    // Clear the stored configuration
    originalAudioCategory = nil
    originalAudioMode = nil
    originalAudioOptions = nil
  }

  func isAvailable() -> Bool {
    speechRecognizer?.isAvailable ?? false
  }

  func getSupportedLocales() -> [String] {
    SFSpeechRecognizer.supportedLocales().map(\.identifier)
  }
}
