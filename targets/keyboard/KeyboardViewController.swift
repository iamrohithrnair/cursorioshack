import UIKit

/// System keyboard extension for Keysor.
/// Long-press the Keysor bar to run the default Plan automation in-place.
final class KeyboardViewController: UIInputViewController {
  private let rows: [[String]] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
    ["ABC", "☺", "keysor", "⏎"],
  ]

  private var shiftOn = false
  private let stack = UIStackView()
  private let nextKeyboardButton = UIButton(type: .system)

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor(red: 0.91, green: 0.94, blue: 0.97, alpha: 1)

    stack.axis = .vertical
    stack.spacing = 7
    stack.translatesAutoresizingMaskIntoConstraints = false
    view.addSubview(stack)

    NSLayoutConstraint.activate([
      stack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 6),
      stack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -6),
      stack.topAnchor.constraint(equalTo: view.topAnchor, constant: 10),
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

  private func rebuildKeys() {
    stack.arrangedSubviews.forEach { $0.removeFromSuperview() }

    for (index, row) in rows.enumerated() {
      let rowStack = UIStackView()
      rowStack.axis = .horizontal
      rowStack.spacing = 6
      rowStack.distribution = index == 3 ? .fill : .fillEqually
      if index == 1 {
        rowStack.layoutMargins = UIEdgeInsets(top: 0, left: 14, bottom: 0, right: 14)
        rowStack.isLayoutMarginsRelativeArrangement = true
      }

      for key in row {
        let button = makeKey(key)
        rowStack.addArrangedSubview(button)
        if index == 3 {
          let priority: Float = key == "keysor" ? 1 : 250
          button.setContentHuggingPriority(UILayoutPriority(priority), for: .horizontal)
          if key == "keysor" {
            button.widthAnchor.constraint(greaterThanOrEqualToConstant: 180).isActive = true
          }
        }
      }

      stack.addArrangedSubview(rowStack)
      rowStack.heightAnchor.constraint(equalToConstant: 44).isActive = true
    }
  }

  private func makeKey(_ key: String) -> UIButton {
    let button = UIButton(type: .system)
    button.layer.cornerRadius = key == "keysor" ? 14 : 10
    button.clipsToBounds = true
    button.titleLabel?.font = .systemFont(ofSize: key == "keysor" ? 13 : 20, weight: .medium)
    button.setTitleColor(UIColor(red: 0.1, green: 0.1, blue: 0.1, alpha: 1), for: .normal)
    button.backgroundColor = key == "keysor"
      ? UIColor(red: 0.91, green: 0.95, blue: 1.0, alpha: 1)
      : UIColor(white: 1, alpha: 0.86)

    switch key {
    case "keysor":
      button.setTitle("✦  Keysor", for: .normal)
      button.setTitleColor(UIColor(red: 0.29, green: 0.55, blue: 1.0, alpha: 1), for: .normal)
      let long = UILongPressGestureRecognizer(target: self, action: #selector(runKeysor(_:)))
      long.minimumPressDuration = 0.38
      button.addGestureRecognizer(long)
      button.addTarget(self, action: #selector(tapSpace), for: .touchUpInside)
    case "⌫":
      button.setTitle("⌫", for: .normal)
      button.addTarget(self, action: #selector(tapBackspace), for: .touchUpInside)
    case "⇧":
      button.setTitle(shiftOn ? "⬆" : "⇧", for: .normal)
      button.addTarget(self, action: #selector(tapShift), for: .touchUpInside)
    case "⏎":
      button.setTitle("⏎", for: .normal)
      button.addTarget(self, action: #selector(tapReturn), for: .touchUpInside)
    case "ABC", "☺":
      button.setTitle(key, for: .normal)
      button.titleLabel?.font = .systemFont(ofSize: 15, weight: .medium)
    default:
      button.setTitle(shiftOn ? key.uppercased() : key, for: .normal)
      button.addTarget(self, action: #selector(tapLetter(_:)), for: .touchUpInside)
    }

    return button
  }

  @objc private func tapLetter(_ sender: UIButton) {
    guard let title = sender.title(for: .normal) else { return }
    textDocumentProxy.insertText(title)
    if shiftOn {
      shiftOn = false
      rebuildKeys()
    }
  }

  @objc private func tapSpace() {
    textDocumentProxy.insertText(" ")
  }

  @objc private func tapBackspace() {
    textDocumentProxy.deleteBackward()
  }

  @objc private func tapReturn() {
    textDocumentProxy.insertText("\n")
  }

  @objc private func tapShift() {
    shiftOn.toggle()
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
