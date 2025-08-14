//
//  Logger.swift
//  VoiceKit
//
//  Created by Maximilian Krause on 20.11.24.
//  Copyright © 2024 Kuatsu App Agency. All rights reserved.
//

import Foundation

// MARK: - LogLevel

enum LogLevel: String {
  case debug
  case info
  case warning
  case error
}

// MARK: - Logger

enum Logger {
  static var staticFormatter: DateFormatter?
  static var formatter: DateFormatter {
    guard let staticFormatter else {
      let formatter = DateFormatter()
      formatter.dateFormat = "HH:mm:ss.SSS"
      self.staticFormatter = formatter
      return formatter
    }
    return staticFormatter
  }

  /**
   * Logs a message to the console using the format `VoiceKit.[caller-class].[caller-function]: [message]`
   */
  @inlinable
  static func log(level: LogLevel,
                  message: String,
                  _ function: String = #function,
                  _ fileID: String = #fileID) {
    let now = Date()
    let time = formatter.string(from: now)

    // Extract class name from fileID
    let components = fileID.split(separator: "/")
    let className = components.last?.split(separator: ".").first ?? "Unknown"

    print("\(time): [\(level.rawValue)] VoiceKit.\(className).\(function): \(message)")
  }
}
