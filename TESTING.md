# 🧪 Testing Guide

## Quick Start

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open test page:**
   ```
   Open test.html in your browser
   ```

## How to Test

### 1. Load a Problem

Click on any problem in the left sidebar:
- **Basic Addition** - Simple proof
- **Symmetry of Equality** - Type theory basics
- **List Concatenation** - List operations
- **Natural Number Addition** - More complex proof
- **Custom Example** - Free coding

### 2. Write Lean Code

The editor supports:
- ✅ Full Lean4 syntax highlighting
- ✅ Auto-closing brackets/parens
- ✅ Comment toggling
- ✅ Unicode math symbols

### 3. Save Solution

**Two ways:**
1. Click "Save Solution" button
2. Press `Cmd/Ctrl + S`

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save solution | `Cmd/Ctrl + S` |
| Autocomplete | `Ctrl + Space` |
| Comment line | `Cmd/Ctrl + /` |
| Find | `Cmd/Ctrl + F` |
| Replace | `Cmd/Ctrl + H` |
| Format document | `Shift + Alt + F` |
| Multi-cursor | `Alt + Click` |
| Select next occurrence | `Cmd/Ctrl + D` |

## Lean Symbols

Type these shortcuts in the editor:

| Symbol | Shortcut | Description |
|--------|----------|-------------|
| → | `\to` or `\r` | Right arrow (implication) |
| ← | `\l` | Left arrow |
| ↔ | `\lr` | Left-right arrow (iff) |
| ∀ | `\all` or `\forall` | For all (universal quantifier) |
| ∃ | `\ex` or `\exists` | Exists (existential quantifier) |
| ¬ | `\not` or `\neg` | Logical NOT |
| ∧ | `\and` | Logical AND |
| ∨ | `\or` | Logical OR |
| ≤ | `\le` | Less than or equal |
| ≥ | `\ge` | Greater than or equal |
| ≠ | `\ne` | Not equal |
| ℕ | `\nat` | Natural numbers |
| ℤ | `\int` | Integers |
| ℚ | `\rat` | Rationals |
| ℝ | `\real` | Real numbers |
| ⟨ | `\<` | Angle brackets |
| ⟩ | `\>` | Angle brackets |

## Common Lean Keywords

### Declarations
- `def` - Define a function
- `theorem` - State and prove a theorem
- `lemma` - Same as theorem
- `example` - Anonymous theorem
- `axiom` - Assume without proof

### Proof Tactics
- `by` - Start tactic mode
- `sorry` - Placeholder (incomplete proof)
- `rfl` - Reflexivity (proof by computation)
- `simp` - Simplification
- `intro` / `intros` - Introduce variables
- `apply` - Apply a theorem
- `exact` - Provide exact proof term
- `cases` - Case analysis
- `induction` - Mathematical induction
- `rw` / `rewrite` - Rewrite using equality

## PostMessage API

### Messages from Parent → Iframe

```javascript
// Load a problem
iframe.contentWindow.postMessage({
    type: 'LOAD_PROBLEM',
    data: {
        id: 'problem-1',
        title: 'My Problem',
        description: 'Prove something',
        initialCode: 'theorem example : True := by trivial'
    }
}, '*');

// Request current solution
iframe.contentWindow.postMessage({
    type: 'REQUEST_SOLUTION',
    data: {}
}, '*');

// Clear editor
iframe.contentWindow.postMessage({
    type: 'CLEAR_EDITOR',
    data: {}
}, '*');

// Configure backend
iframe.contentWindow.postMessage({
    type: 'CONFIGURE',
    data: {
        submitToBackend: true,
        userId: 'user-123',
        backendConfig: {
            endpoint: 'https://api.example.com/submit',
            apiKey: 'your-key'
        }
    }
}, '*');
```

### Messages from Iframe → Parent

```javascript
// Listen for messages
window.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'IFRAME_READY':
            // Iframe initialized and ready
            console.log('Ready at:', data.timestamp);
            break;

        case 'PROBLEM_LOADED':
            // Problem successfully loaded
            console.log('Loaded:', data.problemId);
            break;

        case 'SOLUTION_SUBMITTED':
            // User saved solution
            saveSolution(data); // { problemId, code, timestamp, userId }
            break;

        case 'SOLUTION_DATA':
            // Response to REQUEST_SOLUTION
            console.log('Current code:', data.code);
            break;
    }
});
```

## Saving Solutions

### Option 1: Parent Handles Saving (Recommended)

```javascript
window.addEventListener('message', (event) => {
    if (event.data.type === 'SOLUTION_SUBMITTED') {
        const solution = event.data.data;

        // Save to your backend
        fetch('https://your-api.com/solutions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solution)
        });

        // Or save to localStorage
        localStorage.setItem(
            `solution_${solution.problemId}`,
            JSON.stringify(solution)
        );
    }
});
```

### Option 2: Direct Backend Submission

Configure the iframe to submit directly:

```javascript
iframe.contentWindow.postMessage({
    type: 'CONFIGURE',
    data: {
        submitToBackend: true,
        userId: 'user-123',
        backendConfig: {
            endpoint: 'https://api.example.com/submit',
            apiKey: 'your-api-key'
        }
    }
}, '*');
```

Your backend should accept:
```json
POST /submit
{
    "problemId": "prob-001",
    "code": "theorem example : ...",
    "timestamp": 1234567890,
    "userId": "user-123"
}
```

And return:
```json
{
    "success": true,
    "submissionId": "sub-456",
    "message": "Solution saved"
}
```

## Example: Full Integration

```html
<!DOCTYPE html>
<html>
<body>
    <iframe id="lean-editor" src="http://localhost:3000"></iframe>

    <script>
        const iframe = document.getElementById('lean-editor');

        // Wait for iframe to be ready
        window.addEventListener('message', (event) => {
            if (event.data.type === 'IFRAME_READY') {
                // Load a problem
                iframe.contentWindow.postMessage({
                    type: 'LOAD_PROBLEM',
                    data: {
                        id: 'my-problem',
                        title: 'Prove 1+1=2',
                        initialCode: 'theorem one_plus_one : 1 + 1 = 2 := by sorry'
                    }
                }, '*');
            }

            // Handle solution submission
            if (event.data.type === 'SOLUTION_SUBMITTED') {
                const solution = event.data.data;
                console.log('Solution saved:', solution);

                // Send to backend
                fetch('/api/save', {
                    method: 'POST',
                    body: JSON.stringify(solution)
                });
            }
        });
    </script>
</body>
</html>
```

## Troubleshooting

### Iframe not loading
- Check that dev server is running on port 3000
- Check browser console for errors

### Symbols not working
- Monaco Editor uses escape sequences like `\to` for →
- Type the backslash sequence and it auto-converts

### Save button not working
- Make sure a problem is loaded first
- Check that you've made changes to the code

### PostMessage not working
- Check origins match (use '*' for testing)
- Open browser console to see message logs

## Next Steps

1. ✅ Test all 5 sample problems
2. ✅ Try keyboard shortcuts
3. ✅ Test save functionality
4. ✅ Check message logs
5. 🔄 Integrate into your site
6. 🔄 Connect to your backend
7. 🔄 Add production origin validation