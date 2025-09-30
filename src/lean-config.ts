/**
 * Lean4 Monaco Editor Configuration
 * Basic Lean4 syntax highlighting without LSP server
 */

import * as monaco from 'monaco-editor';
import { setupUnicodeInput } from './unicode-input';

export interface Lean4Config {
  theme?: 'vs' | 'vs-dark' | 'hc-black';
}

let isLean4Registered = false;

/**
 * Register Lean4 language with Monaco Editor
 * Provides syntax highlighting and basic language features
 */
export function registerLean4Language() {
  if (isLean4Registered) return;

  // Register Lean4 language
  monaco.languages.register({ id: 'lean4' });

  // Configure language settings
  monaco.languages.setLanguageConfiguration('lean4', {
    comments: {
      lineComment: '--',
      blockComment: ['/-', '-/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
      ['⟨', '⟩'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '⟨', close: '⟩' },
      { open: '/-', close: '-/' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '⟨', close: '⟩' },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}"']*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
  });

  // Define syntax highlighting
  monaco.languages.setMonarchTokensProvider('lean4', {
    keywords: [
      'abbrev', 'axiom', 'class', 'def', 'deriving', 'example', 'extends',
      'fun', 'have', 'if', 'import', 'inductive', 'instance', 'let', 'match',
      'namespace', 'opaque', 'open', 'private', 'protected', 'section', 'show',
      'structure', 'syntax', 'theorem', 'then', 'else', 'variable', 'where',
      'with', 'do', 'for', 'in', 'return', 'try', 'catch', 'finally', 'unless',
      'mutual', 'end', 'universe', 'universes', 'infix', 'infixl', 'infixr',
      'prefix', 'postfix', 'notation', 'macro', 'elab', 'builtin_initialize',
    ],

    tactics: [
      'by', 'calc', 'exact', 'rfl', 'simp', 'intro', 'intros', 'apply', 'cases',
      'induction', 'rewrite', 'rw', 'unfold', 'split', 'sorry', 'admit', 'trivial',
      'constructor', 'left', 'right', 'exists', 'use', 'have', 'show', 'suffices',
      'refine', 'assumption', 'contradiction', 'exfalso', 'clear', 'revert',
      'generalize', 'specialize', 'obtain', 'rintro', 'rcases', 'ext', 'norm_num',
      'ring', 'field_simp', 'linarith', 'omega', 'decide', 'aesop', 'tauto',
    ],

    operators: [
      '→', '←', '↔', '∀', '∃', '¬', '∧', '∨', '≤', '≥', '≠', '⟨', '⟩',
      '⊢', '⊨', '⊤', '⊥', '∈', '∉', '⊆', '⊇', '∪', '∩', '×', '≡', '≈',
      '∘', '⁻¹', 'ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ', '∑', '∏', '∫', '∂', '∇',
      ':=', '=', '<', '>', '+', '-', '*', '/', '^', '|', '&', '!',
      ':', ';', ',', '.', '@', '#', '`', '~', '?',
    ],

    symbols: /[=><!~?:&|+\-*\/^%#@`]+|[→←↔∀∃¬∧∨≤≥≠⟨⟩⊢⊨⊤⊥∈∉⊆⊇∪∩×≡≈∘⁻¹ℕℤℚℝℂ∑∏∫∂∇]+/,

    tokenizer: {
      root: [
        // Identifiers and keywords
        [/[a-zA-Z_'α-ωΑ-Ω][a-zA-Z0-9_'α-ωΑ-Ω]*/, {
          cases: {
            '@keywords': 'keyword',
            '@tactics': 'keyword.tactic',
            '@default': 'identifier'
          }
        }],

        // Whitespace
        { include: '@whitespace' },

        // Numbers
        [/\d+(\.\d+)?/, 'number'],

        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[⟨⟩]/, '@brackets'],
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }],

        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
        [/--.*$/, 'comment'],
        [/\/-/, 'comment', '@comment'],
      ],

      comment: [
        [/[^\/-]+/, 'comment'],
        [/-\//, 'comment', '@pop'],
        [/[\/-]/, 'comment']
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop']
      ],
    },
  });

  isLean4Registered = true;
}

/**
 * Create Monaco Editor instance with Lean4 support
 */
export function createLeanEditor(
  container: HTMLElement,
  initialCode: string = '',
  config?: Lean4Config
): monaco.editor.IStandaloneCodeEditor {
  // Register Lean4 language first
  registerLean4Language();

  // Create editor
  const editor = monaco.editor.create(container, {
    value: initialCode,
    language: 'lean4',
    theme: config?.theme || 'vs',
    automaticLayout: true,
    minimap: { enabled: true },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    wrappingIndent: 'indent',
    tabSize: 2,
    insertSpaces: true,
    renderWhitespace: 'selection',
    folding: true,
    glyphMargin: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
  });

  // Enable Unicode input (convert \and → ∧, etc.)
  setupUnicodeInput(editor);

  return editor;
}