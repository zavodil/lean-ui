# Development Notes - Claude AI Assistant

This document describes the development process and architecture decisions for the Lean Editor Iframe project.

## 🎯 Project Overview

**Goal:** Create an embeddable iframe with Monaco Editor for writing Lean4 code, with full Unicode symbol support and parent-iframe communication.

**Use Case:** Educational platforms and coding challenge sites that want to embed a Lean4 editor for theorem proving exercises.

## 🏗️ Architecture

### Component Structure

```
┌─────────────────────────────────────────┐
│         Parent Website                  │
│  ┌───────────────────────────────────┐  │
│  │    Lean Editor Iframe             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Monaco Editor             │  │  │
│  │  │   + Lean4 Syntax            │  │  │
│  │  │   + Unicode Input (1800+)   │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│            ↕ postMessage API            │
└─────────────────────────────────────────┘
```

### Technology Stack

- **Editor**: Monaco Editor (same as VS Code)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Symbols**: Official Lean4 abbreviations from vscode-lean4
- **Communication**: Window.postMessage API

## 📝 Key Design Decisions

### 1. Monaco Editor Without LSP

**Decision:** Use Monaco with custom Lean4 syntax highlighting, without Lean Language Server.

**Reasoning:**
- `lean4monaco` package requires complex Node.js polyfills (fs, buffer, memfs) that are difficult to configure in browser
- LSP requires WebSocket connection to Lean server (additional infrastructure)
- For MVP, syntax highlighting + Unicode input is sufficient
- Users get familiar Lean editing experience without backend complexity

**Trade-offs:**
- ✅ Simple setup, works immediately
- ✅ No server infrastructure needed
- ✅ Fast loading, lightweight
- ❌ No real-time type checking
- ❌ No IntelliSense from Lean compiler
- ❌ No error messages from Lean

### 2. Official Lean4 Abbreviations

**Decision:** Use exact abbreviation mappings from vscode-lean4 repository.

**Reasoning:**
- Users already familiar with VSCode Lean4 expect same shortcuts
- Official list is maintained and comprehensive (1800+ symbols)
- Includes both short forms (`\a` → α) and long forms (`\alpha` → α)
- Ensures consistency with standard Lean development environment

**Implementation:**
- Downloaded `abbreviations.json` from vscode-lean4 GitHub
- Converted to TypeScript format with backslash prefix
- Implemented real-time replacement on each keystroke
- Added autocomplete dropdown (Ctrl+Space) for discovery

### 3. PostMessage Communication Protocol

**Decision:** Use structured message protocol with typed events.

**Message Types:**

**Parent → Iframe:**
- `LOAD_PROBLEM`: Initialize editor with problem code
- `REQUEST_SOLUTION`: Get current editor contents
- `CLEAR_EDITOR`: Reset editor to empty state
- `CONFIGURE`: Set backend API configuration

**Iframe → Parent:**
- `IFRAME_READY`: Initialization complete
- `PROBLEM_LOADED`: Problem successfully loaded
- `SOLUTION_SUBMITTED`: User saved their solution
- `SOLUTION_DATA`: Current solution (response to REQUEST_SOLUTION)

**Reasoning:**
- Clear separation of concerns
- Type-safe interfaces
- Easy to extend with new message types
- Standard browser API, no dependencies

### 4. Dual Submission Mode

**Decision:** Support both parent-handled and direct backend submission.

**Modes:**

**Mode 1: Parent Handles Saving (Default)**
```javascript
// Parent receives solution
window.addEventListener('message', (event) => {
    if (event.data.type === 'SOLUTION_SUBMITTED') {
        saveToBackend(event.data.data);
    }
});
```

**Mode 2: Direct Backend Submission**
```javascript
// Configure iframe to submit directly
iframe.contentWindow.postMessage({
    type: 'CONFIGURE',
    data: {
        submitToBackend: true,
        backendConfig: { endpoint: '...' }
    }
}, '*');
```

**Reasoning:**
- Flexibility for different integration scenarios
- Some sites prefer to handle all API calls
- Others want iframe to be independent
- Easy to switch between modes

## 🔧 Technical Implementation

### Unicode Input System

The Unicode input system automatically replaces `\abbreviation` with Unicode symbols:

```typescript
// On each keystroke:
1. Get text before cursor
2. Check if it ends with any abbreviation
3. If match found, replace with Unicode symbol
4. Move cursor to correct position
```

**Key challenges solved:**
- Monaco treats `\not` as non-word characters
- Solution: Check entire line before cursor, not just "words"
- Sort abbreviations by length (longest first) to avoid partial matches
- Prevent infinite loops with `isReplacing` flag

### Build Configuration

**Development:**
- Vite dev server on port 3000
- Hot module replacement
- TypeScript type checking

**Production:**
- Builds to `dist/` directory
- All assets bundled
- Monaco Editor workers properly configured
- Ready for static hosting (GitHub Pages, Netlify, etc.)

## 📦 Deployment

### GitHub Pages Setup

The project includes GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. Triggers on push to main/master
2. Installs dependencies
3. Builds production bundle
4. Deploys to GitHub Pages

**Steps for user:**
1. Push code to GitHub
2. Enable GitHub Pages in repo settings
3. Select "GitHub Actions" as source
4. Access at `https://username.github.io/lean-ui/`

## 🎨 UI/UX Considerations

### test.html - Interactive Demo

Created comprehensive test page with:
- **Sidebar**: Problem list, controls, shortcuts, symbols
- **Main area**: Iframe with visual border and label
- **Log panel**: Real-time postMessage debugging
- **Solution display**: Shows last saved solution

**Design choices:**
- Blue border around iframe to clearly show what's embeddable
- Label: "📦 Your Lean Editor iframe - This is what you embed on your site"
- 5 diverse sample problems (basic to advanced)
- Full message logging for debugging
- Clean, professional UI using system fonts

### Editor Configuration

Monaco Editor settings optimized for Lean:
- Font size: 14px (readable)
- Line numbers: On
- Minimap: Enabled (useful for long proofs)
- Word wrap: On (better for theorems)
- Tab size: 2 (Lean convention)
- Auto-closing brackets including `⟨⟩`

## 🚀 Future Enhancements

### Possible Additions:

1. **Lean Language Server Integration**
   - Add optional LSP support via WebSocket
   - Real-time error checking
   - Hover information for theorems
   - Go-to-definition

2. **WASM-based Lean**
   - Compile Lean to WebAssembly
   - Run type checker in browser
   - No server required
   - Instant feedback

3. **Themes**
   - Dark mode
   - High contrast
   - Custom color schemes

4. **Export/Import**
   - Download solutions as `.lean` files
   - Import existing Lean files
   - Share via URL

5. **Collaborative Editing**
   - Multiple cursors
   - WebRTC for peer-to-peer
   - See others' solutions

6. **Tactic Suggestions**
   - AI-powered tactic recommendations
   - Common pattern detection
   - Interactive proof assistant

## 🐛 Known Limitations

1. **No Type Checking**: Monaco shows syntax only, not semantic errors
2. **No IntelliSense**: No completion for Lean theorems/definitions
3. **Unicode Only**: Symbol replacement happens visually, but uses Unicode in code
4. **No Import Resolution**: Can't import Lean libraries or modules
5. **Single File**: Each problem is isolated, no multi-file projects

## 📚 File-by-File Guide

### `/src/main.ts`
Main application entry point. Initializes Monaco, sets up event listeners, handles postMessage communication.

### `/src/lean-config.ts`
Monaco Editor configuration for Lean4. Registers language, defines syntax highlighting rules (keywords, operators, comments).

### `/src/unicode-input.ts`
Implements automatic Unicode symbol replacement. Monitors editor changes, finds abbreviations, replaces with symbols.

### `/src/official-abbreviations.ts`
Generated file with 1800+ Unicode abbreviations from vscode-lean4. Direct mapping of `\abbreviation` → symbol.

### `/src/api.ts`
Backend API client for optional direct submission mode. Handles HTTP requests, error handling, authentication.

### `/index.html`
Iframe entry point. Minimal HTML with editor container and status bar.

### `/test.html`
Full-featured demo page showing complete integration. Includes problem list, controls, logging, and UI for testing all features.

### `/vite.config.ts`
Vite build configuration. Simple setup, no special polyfills needed since we removed lean4monaco dependency.

### `/.github/workflows/deploy.yml`
GitHub Actions workflow for automatic deployment to GitHub Pages.

## 💡 Development Tips

### Adding New Message Types

1. Add interface in `main.ts`:
   ```typescript
   interface NewMessageData { ... }
   ```

2. Add case in `setupPostMessageListener()`:
   ```typescript
   case 'NEW_MESSAGE_TYPE':
       this.handleNewMessage(data as NewMessageData);
       break;
   ```

3. Add handler method:
   ```typescript
   private handleNewMessage(data: NewMessageData) { ... }
   ```

4. Document in README.md and TESTING.md

### Adding New Abbreviations

Official abbreviations are in `src/official-abbreviations.ts` (auto-generated). To add custom ones:

1. Edit `src/unicode-input.ts`
2. Add to `abbreviations` object
3. Rebuild and test

### Debugging PostMessage

Open `test.html` in browser - all messages are logged in real-time with timestamps and full data.

## 🎓 Lessons Learned

1. **Keep It Simple**: Started with lean4monaco (complex), ended with Monaco + custom Lean highlighting (simple, works great)

2. **Use Official Standards**: Using exact vscode-lean4 abbreviations ensures users get familiar experience

3. **Separation of Concerns**: PostMessage API cleanly separates iframe from parent, allowing flexible integration

4. **Progressive Enhancement**: Basic version (syntax + Unicode) works now, can add LSP later if needed

5. **Documentation Matters**: Comprehensive README, test.html, and TESTING.md make it easy for others to use and contribute

## 🔗 References

- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Lean 4](https://lean-lang.org/)
- [vscode-lean4 Abbreviations](https://github.com/leanprover/vscode-lean4/blob/master/lean4-unicode-input/src/abbreviations.json)
- [Window.postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

---

**Built with Claude Code AI Assistant**
Generated: September 30, 2025