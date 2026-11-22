# Password Generator

A modern password generator with customizable options and real-time strength evaluation.

## Features

- Adjustable password length (4-40 characters)
- Include/exclude uppercase letters, lowercase letters, numbers, and symbols
- Real-time password strength meter (Weak / Medium / Strong / Very Strong)
- One-click copy to clipboard with visual feedback
- Cryptographically secure random generation using `crypto.getRandomValues`
- Responsive, glassmorphism UI

## Technologies Used

- HTML5
- CSS3 (Flexbox, Custom Properties, Glassmorphism)
- Vanilla JavaScript (ES6+, Web Crypto API)

## Folder Structure

```
Project2-Password-Generator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run

Open `index.html` in any modern browser. No dependencies required.

## Future Improvements

- Add password exclusion rules (avoid similar characters)
- Add password history
- Add "copy to clipboard" tooltip
- Add dark/light theme toggle
- Allow generating multiple passwords at once
