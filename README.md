# Lean Editor Iframe

A Monaco Editor-based iframe component for writing and solving Lean4 programming problems with full syntax highlighting and official VSCode Lean4 Unicode input support.

## 🎯 Features

- **Full Lean4 Syntax Highlighting**: Professional code editor with proper tokenization
- **Official Unicode Input**: 1800+ symbols from vscode-lean4 (`\a` → α, `\r` → →, etc.)
- **Monaco Editor**: Industry-standard editor with IntelliSense and autocomplete
- **PostMessage API**: Seamless parent-iframe communication
- **Flexible Submission**: Submit to parent window or backend API
- **Problem Loading**: Dynamic problem loading with custom initial code
- **Auto-save**: Keyboard shortcuts (Cmd/Ctrl+S) for quick saving

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The iframe will be available at `http://localhost:3000`

### 3. Test with Example Page

Open `test.html` in your browser to see the full integration example with 5 sample problems.

## 📦 GitHub Pages Deployment

### Automatic Deployment

This repo includes GitHub Actions workflow for automatic deployment to GitHub Pages:

1. **Push to main/master branch** - automatically triggers build and deploy
2. **Access your iframe** at `https://YOUR_USERNAME.github.io/lean-ui/`

### Manual Setup

1. Go to your repo **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to main branch - deployment will start automatically

### Local Build

```bash
npm run build
```

Output will be in `dist/` directory.

## 🔌 Integration Guide

### Basic Iframe Setup

```html
<iframe
    id="lean-editor"
    src="https://YOUR_USERNAME.github.io/lean-ui/"
    style="width: 100%; height: 600px; border: none;">
</iframe>
```

### Load a Problem

```javascript
const iframe = document.getElementById('lean-editor');

iframe.contentWindow.postMessage({
    type: 'LOAD_PROBLEM',
    data: {
        id: 'problem-001',
        title: 'Sum of Natural Numbers',
        description: 'Prove that sum of first n numbers is n*(n+1)/2',
        initialCode: 'theorem sum_n (n : Nat) : ... := by\n  sorry'
    }
}, '*');
```

### Receive Solutions

```javascript
window.addEventListener('message', (event) => {
    if (event.data.type === 'SOLUTION_SUBMITTED') {
        const solution = event.data.data;
        console.log('Solution:', solution);

        // Send to your backend
        fetch('/api/solutions', {
            method: 'POST',
            body: JSON.stringify(solution)
        });
    }
});
```

## 📡 PostMessage API

### Parent → Iframe Messages

| Type | Data | Description |
|------|------|-------------|
| `LOAD_PROBLEM` | `{ id, title, description, initialCode }` | Load a problem into editor |
| `REQUEST_SOLUTION` | `{}` | Get current solution |
| `CLEAR_EDITOR` | `{}` | Clear editor content |
| `CONFIGURE` | `{ submitToBackend, userId, backendConfig }` | Configure backend submission |

### Iframe → Parent Messages

| Type | Data | Description |
|------|------|-------------|
| `IFRAME_READY` | `{ timestamp }` | Iframe initialized |
| `PROBLEM_LOADED` | `{ problemId }` | Problem loaded successfully |
| `SOLUTION_SUBMITTED` | `{ problemId, code, timestamp, userId }` | User saved solution |
| `SOLUTION_DATA` | `{ problemId, code, timestamp }` | Current solution (response to REQUEST_SOLUTION) |

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save solution | `Cmd/Ctrl + S` |
| Autocomplete | `Ctrl + Space` |
| Comment line | `Cmd/Ctrl + /` |
| Find | `Cmd/Ctrl + F` |
| Replace | `Cmd/Ctrl + H` |
| Multi-cursor | `Alt + Click` |

## 🔣 Unicode Symbols

### Official Lean 4 Abbreviations

This editor uses **official VSCode Lean4 abbreviations** (1800+ symbols):

**Short forms (1-2 chars):**
- `\a` → α, `\b` → β, `\g` → γ, `\l` → λ
- `\r` → →, `\l` → ←, `\v` → ∨, `\n` → ¬
- `\N` → ℕ, `\Z` → ℤ, `\Q` → ℚ, `\R` → ℝ

**Long forms:**
- `\alpha` → α, `\beta` → β, `\gamma` → γ
- `\forall` → ∀, `\exists` → ∃
- `\and` → ∧, `\or` → ∨, `\not` → ¬

Press `Ctrl+Space` after `\` to see all available symbols!

## 📁 Project Structure

```
lean-ui/
├── src/
│   ├── main.ts                    # Main application logic
│   ├── api.ts                     # Backend API client
│   ├── lean-config.ts             # Lean4 Monaco configuration
│   ├── unicode-input.ts           # Unicode input handler
│   └── official-abbreviations.ts  # Official Lean4 symbols (1800+)
├── index.html                     # Iframe entry point
├── test.html                      # Parent page example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .github/
    └── workflows/
        └── deploy.yml             # GitHub Pages auto-deploy
```

## 🛠️ Development

### Type Checking

```bash
npm run typecheck
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🔐 Security Notes

### Production Deployment

1. **Validate Origins**: Uncomment origin validation in `main.ts`:
   ```typescript
   if (event.origin !== 'https://your-domain.com') return;
   ```

2. **Specify Target Origins**: Replace `'*'` with specific origins:
   ```typescript
   window.parent.postMessage({ type, data }, 'https://your-domain.com');
   ```

3. **API Keys**: Never expose API keys in frontend. Use backend proxy.

4. **CORS**: Configure proper CORS headers on your backend.

## 📝 Example Usage

See [test.html](test.html) for a complete working example with:
- 5 sample Lean problems
- Full message logging
- Solution display
- All API interactions

## 🌐 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (14+)

## 📚 Documentation

- [TESTING.md](TESTING.md) - Complete testing guide
- [test.html](test.html) - Live integration example

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## 📄 License

MIT

## 🙏 Credits

- **Monaco Editor** by Microsoft
- **Official Lean4 abbreviations** from [vscode-lean4](https://github.com/leanprover/vscode-lean4)

---

**Live Demo:** https://YOUR_USERNAME.github.io/lean-ui/ (after deployment)