import UIKit

/// System keyboard extension for Keysor with letters / numbers / symbols / emoji.
final class KeyboardViewController: UIInputViewController {
  private enum Mode {
    case letters, numbers, symbols, emoji
  }

  private var mode: Mode = .letters
  private var shiftOn = false
  private let stack = UIStackView()
  private let nextKeyboardButton = UIButton(type: .system)

  private let letterRows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["shift", "z", "x", "c", "v", "b", "n", "m", "backspace"],
    ["123", "emoji", "keysor", "return"],
  ]

  private let numberRows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""],
    ["#+=", ".", ",", "?", "!", "'", "backspace"],
    ["ABC", "emoji", "keysor", "return"],
  ]

  private let symbolRows = [
    ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="],
    ["_", "\\", "|", "~", "<", ">", "€", "£", "¥", "•"],
    ["123", ".", ",", "?", "!", "'", "backspace"],
    ["ABC", "emoji", "keysor", "return"],
  ]

  private let emojiRows = [
    ["😀", "😂", "🥰", "😍", "😎", "🤔", "😭", "🔥"],
    ["👍", "👏", "🙏", "💪", "🎉", "✨", "❤️", "💯"],
    ["✅", "⭐", "🚀", "📅", "📍", "💡", "📎", "🔗"],
    ["ABC", "123", "keysor", "return"],
  ]

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor(red: 0.91, green: 0.94, blue: 0.97, alpha: 1)

    stack.axis = .vertical
    stack.spacing = 6
    stack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(stack)

    NSLayoutConstraint.activate([
      stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 5),
      stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -5),
      stack.topAnchor.constraint(equalTo: view.topAnchor, constant: 8),
      stack.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -28),
      view.heightAnchor.constraint(greaterThanOrEqualToConstant: 280),
    ])

    rebuildKeys()
    configureNextKeyboardButton()
  }

  override func viewWillLayoutSubviews() {
    nextKeyboardButton.isHidden = !needsInputModeSwitchKey
    super.viewWillLayoutSubviews()
  }

  private func configureNextKeyboardButton() {
    nextKeyboardButton.setTitle("🌐", for: .normal)
    nextKeyboardButton.translatesAutoresizingMaskIntoConstraints = false
    nextKeyboardButton.addTarget(self, action: #selector(handleInputModeList(from:with:)), for: .allTouchEvents)
    view.addSubview(nextKeyboardButton)
    NSLayoutConstraint.activate([
      nextKeyboardButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 12),
      nextKeyboardButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -4),
    ])
  }

  private var currentRows: [[String]] {
    switch mode {
    case .letters: return letterRows
    case .numbers: return numberRows
    case .symbols: return symbolRows
    case .emoji: return emojiRows
    }
  }

  private func rebuildKeys() {
    stack.arrangedSubviews.forEach { $0.removeFromSuperview() }
    let rows = currentRows

    for (index, row) in rows.enumerated() {
      let rowStack = UIStackView()
      rowStack.axis = .horizontal
      rowStack.spacing = 5
      rowStack.distribution = index == rows.count - 1 ? .fill : .fillEqually

      if mode == .letters && index == 1 {
        rowStack.layoutMargins = UIEdgeInsets(top: 0, left: 14, bottom: 0, right: 14)
        rowStack.isLayoutMarginsRelativeArrangement = true
      }

      for key in row {
        let button = makeKey(key)
        rowStack.addArrangedSubview(button)
        if index == rows.count - 1 {
          if key == "keysor" {
            button.setContentHuggingPriority(.defaultLow, for: .horizontal)
            button.widthAnchor.constraint(greaterThanOrEqualToConstant: 160).isActive = true
          } else {
            button.setContentHuggingPriority(.defaultHigh, for: .horizontal)
          }
        }
      }

      stack.addArrangedSubview(rowStack)
      rowStack.heightAnchor.constraint(equalToConstant: mode == .emoji ? 40 : 42).isActive = true
    }
  }

  private func makeKey(_ key: String) -> UIButton {
    let button = UIButton(type: .system)
    button.layer.cornerRadius = key == "keysor" ? 12 : 8
    button.clipsToBounds = true
    button.backgroundColor = UIColor(white: 1, alpha: 0.86)
    button.setTitleColor(UIColor(red: 0.1, green: 0.1, blue: 0.1, alpha: 1), for: .normal)
    button.titleLabel?.font = .systemFont(ofSize: 20, weight: .medium)

    switch key {
    case "keysor":
      button.setTitle("✦  Keysor", for: .normal)
      button.titleLabel?.font = .systemFont(ofSize: 13, weight: .semibold)
      button.setTitleColor(UIColor(red: 0.29, green: 0.55, blue: 1.0, alpha: 1), for: .normal)
      button.backgroundColor = UIColor(red: 0.91, green: 0.95, blue: 1.0, alpha: 1)
      let long = UILongPressGestureRecognizer(target: self, action: #selector(runKeysor(_:)))
      long.minimumPressDuration = 0.38
      button.addGestureRecognizer(long)
      button.addTarget(self, action: #selector(tapSpace), for: .touchUpInside)
    case "backspace":
      button.setTitle("⌫", for: .normal)
      button.backgroundColor = UIColor(red: 0.86, green: 0.89, blue: 0.92, alpha: 1)
      button.addTarget(self, action: #selector(tapBackspace), for: .touchUpInside)
    case "shift":
      button.setTitle(shiftOn ? "⬆" : "⇧", for: .normal)
      button.backgroundColor = UIColor(red: 0.86, green: 0.89, blue: 0.92, alpha: 1)
      button.addTarget(self, action: #selector(tapShift), for: .touchUpInside)
    case "return":
      button.setTitle("return", for: .normal)
      button.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
      button.backgroundColor = UIColor(red: 0.86, green: 0.89, blue: 0.92, alpha: 1)
      button.addTarget(self, action: #selector(tapReturn), for: .touchUpInside)
    case "123":
      button.setTitle("123", for: .normal)
      button.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
      button.backgroundColor = UIColor(red: 0.86, green: 0.89, blue: 0.92, alpha: 1)
      button.addTarget(self, action: #selector(toNumbers), for: .touchUpInside)
    case "#+=":
      button.setTitle("#+=", for: .normal)
      button.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
      button.backgroundColor = UIColor(red: 0.86, green: 0.89, blue: 0.92, alpha: 1)
      button.addTarget(self, action: #selector(toSymbols), for: .touchUpInside)
    case "ABC":
      button.setTitle("ABC", for: .normal)
      button.titleLabel?.font = .systemFont(ofSize: 14, weight: .semibold)
      button.backgroundColor = UIColor(red: 0.86, green: 0.89, blue: 0.92, alpha: 1)
      button.addTarget(self, action: #selector(toLetters), for: .touchUpInside)
    case "emoji":
      button.setTitle("☺", for: .normal)
      button.backgroundColor = UIColor(red: 0.86, green: 0.89, blue: 0.92, alpha: 1)
      button.addTarget(self, action: #selector(toEmoji), for: .touchUpInside)
    default:
      if mode == .letters {
        button.setTitle(shiftOn ? key.uppercased() : key, for: .normal)
      } else {
        button.setTitle(key, for: .normal)
        if mode == .emoji {
          button.titleLabel?.font = .systemFont(ofSize: 26)
          button.backgroundColor = .clear
        }
      }
      button.addTarget(self, action: #selector(tapChar(_:)), for: .touchUpInside)
    }

    return button
  }

  @objc private func tapChar(_ sender: UIButton) {
    guard let title = sender.title(for: .normal) else { return }
    textDocumentProxy.insertText(title)
    if mode == .letters && shiftOn {
      shiftOn = false
      rebuildKeys()
    }
  }

  @objc private func tapSpace() { textDocumentProxy.insertText(" ") }
  @objc private func tapBackspace() { textDocumentProxy.deleteBackward() }
  @objc private func tapReturn() { textDocumentProxy.insertText("\n") }

  @objc private func tapShift() {
    shiftOn.toggle()
    rebuildKeys()
  }

  @objc private func toNumbers() {
    mode = .numbers
    rebuildKeys()
  }

  @objc private func toSymbols() {
    mode = .symbols
    rebuildKeys()
  }

  @objc private func toLetters() {
    mode = .letters
    rebuildKeys()
  }

  @objc private func toEmoji() {
    mode = .emoji
    rebuildKeys()
  }

  @objc private func runKeysor(_ gesture: UILongPressGestureRecognizer) {
    guard gesture.state == .began else { return }
    let before = textDocumentProxy.documentContextBeforeInput ?? ""
    let after = textDocumentProxy.documentContextAfterInput ?? ""
    let full = (before + after).trimmingCharacters(in: .whitespacesAndNewlines)
    let topic = full.isEmpty ? "your note" : full

    for _ in 0..<before.count {
      textDocumentProxy.deleteBackward()
    }

    let plan = """
    Plan for: \(topic)

    1. Confirm date, time, and guests
    2. Pick venue / stream setup
    3. Send invites with a clear RSVP ask
    4. Prep snacks + reminders day-of
    """
    textDocumentProxy.insertText(plan)
  }
}
