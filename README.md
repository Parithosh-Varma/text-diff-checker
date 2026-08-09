<p align="center">
  <img src="https://avatars.githubusercontent.com/u/277201506?v=4&size=64" width="80" style="border-radius: 50%;" alt="Logo" />
</p>

<h1 align="center">Text Diff Checker</h1>

<p align="center">
  Compare any two texts with a fast word-level diff. Paste, review, copy — all in your browser.
</p>

<p align="center">
  <a href="https://github.com/parithosh-varma/text-diff-checker">
    <img src="https://img.shields.io/badge/📂_Source-GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub Repo" />
  </a>
  <a href="https://text-diff-checker-352.netlify.app">
    <img src="https://img.shields.io/badge/🌐_Demo-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white" alt="Netlify Deploy" />
  </a>
  <img src="https://img.shields.io/badge/⚡_Stack-React/TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/🎨_Design-Modern_Minimal-6366F1?style=flat-square" alt="Design System" />
</p>

---

**This is the live demo of the tool:** https://text-diff-checker-352.netlify.app

---

## Core Features

- **Word-Level Diffing** — Longest-common-subsequence algorithm for precise inline changes
- **Side-by-Side & Combined Views** — Removed words struck through in red, added words highlighted in green
- **Live Stats** — Added, removed, and unchanged word counts update as you type
- **Copy Diff** — Export the change set as a `+`/`-` patch compatible with git-style reviews
- **Load Sample** — Instantly test with realistic before/after content
- **Dark Mode** — Toggle between light and dark themes
- **100% Private** — Diffing never leaves your device; no servers, no tracking

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Design System | Modern Minimal (Indigo/Zinc) |
| Fonts | Inter |

---

## Quickstart

### Prerequisites

- Node.js 18+
- npm or yarn

### Clone & Run

```bash
# Clone the repository
git clone https://github.com/parithosh-varma/text-diff-checker.git

# Navigate to the project
cd text-diff-checker

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
text-diff-checker/
├── public/
│   └── logo.png            # Favicon & header logo
├── src/
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind + design tokens
├── index.html              # HTML template
├── vite.config.ts          # Vite + Tailwind config
├── package.json            # Dependencies & scripts
├── README.md               # This file
└── LICENSE                 # MIT License
```

---

## Design System

This tool follows the **Modern Minimal** design system:

- **Primary:** Indigo 500 (`#6366f1`)
- **Background:** Pure White / Zinc 950 (dark mode)
- **Typography:** Inter with tight tracking on headings
- **Components:** Flat buttons, clean borders, subtle shadows
- **Focus States:** Visible ring contrast for accessibility

---

## Contributing

Contributions are welcome! If you find a bug or want to add a feature:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with care by <a href="https://github.com/parithosh-varma">Parithosh Varma</a>
</p>