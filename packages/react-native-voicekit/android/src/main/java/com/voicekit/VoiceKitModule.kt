package com.voicekit

import android.speech.SpeechRecognizer
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.bridge.UiThreadUtil

class VoiceKitModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val voiceKitService = VoiceKitService(reactContext)

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun startListening(options: ReadableMap, promise: Promise) {
    try {
      UiThreadUtil.runOnUiThread {
        try {
          voiceKitService.startListening(options)
          promise.resolve(true)
        } catch (e: VoiceError) {
          promise.reject(e.code, e.message)
        } catch (e: Exception) {
          Log.e(TAG, "Error starting recording", e)
          promise.reject(VoiceError.RecognitionFailed.code, VoiceError.RecognitionFailed.message)
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error starting recording", e)
      promise.reject(VoiceError.RecognitionFailed.code, VoiceError.RecognitionFailed.message)
    }
  }

  @ReactMethod
  fun stopListening(promise: Promise) {
    try {
      UiThreadUtil.runOnUiThread {
        try {
          voiceKitService.stopListening()
          promise.resolve(true)
        } catch (e: Exception) {
          Log.e(TAG, "Error stopping recording", e)
          promise.reject(VoiceError.RecognitionFailed.code, VoiceError.RecognitionFailed.message)
        }
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error stopping recording", e)
      promise.reject(VoiceError.RecognitionFailed.code, VoiceError.RecognitionFailed.message)
    }
  }

  @ReactMethod
  fun isSpeechRecognitionAvailable(promise: Promise) {
    try {
      val available = SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)
      promise.resolve(available)
    } catch (e: Exception) {
      Log.w(TAG, "Error checking speech recognition availability, returning false", e)
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun getSupportedLocales(promise: Promise) {
    try {
      voiceKitService.getSupportedLocales(reactApplicationContext) { locales ->
        val writableArray = Arguments.createArray()
        locales["installed"]?.forEach { writableArray.pushString(it) }
        locales["supported"]?.forEach { writableArray.pushString(it) }
        promise.resolve(writableArray)
      }
    } catch (e: Exception) {
      Log.e(TAG, "Error getting supported locales", e)
      promise.reject(VoiceError.RecognitionFailed.code, "Failed to get supported locales")
    }
  }

  @ReactMethod
  fun isOnDeviceModelInstalled(locale: String, promise: Promise) {
    voiceKitService.getSupportedLocales(reactApplicationContext) { locales ->
      promise.resolve(locales["installed"]?.contains(locale) ?: false)
    }
  }

  @ReactMethod
  fun downloadOnDeviceModel(locale: String, promise: Promise) {
    voiceKitService.downloadOnDeviceModel(locale, { result ->
      val response = Arguments.createMap().apply {
        putString("status", result["status"] as String)
        putBoolean("progressAvailable", result["progressAvailable"] as Boolean)
      }
      promise.resolve(response)
    })
  }

  companion object {
    const val NAME = "VoiceKit"
    private const val TAG = "VoiceKitModule"
  }
}
