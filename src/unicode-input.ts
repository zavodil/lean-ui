/**
 * Unicode input support for Lean symbols in Monaco Editor
 * Uses official Lean 4 abbreviations from vscode-lean4
 */

import * as monaco from 'monaco-editor';
import { officialAbbreviations } from './official-abbreviations';

const abbreviations = officialAbbreviations;
const sortedAbbreviations = Object.keys(abbreviations).sort((a, b) => b.length - a.length);

export function setupUnicodeInput(editor: monaco.editor.IStandaloneCodeEditor) {
  let isReplacing = false;
  let lastTypedChar = '';

  editor.onDidChangeModelContent((e) => {
    if (isReplacing) return;

    const model = editor.getModel();
    if (!model) return;

    const position = editor.getPosition();
    if (!position) return;

    // Track last typed character
    if (e.changes.length > 0) {
      const change = e.changes[0];
      lastTypedChar = change.text;
    }

    const lineContent = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineContent.substring(0, position.column - 1);

    // Check if we should trigger replacement
    // Only replace if:
    // 1. User typed a space, newline, or non-letter character (except backslash)
    // 2. There's text after the cursor that's not a letter (end of abbreviation reached)
    const charAfterCursor = lineContent[position.column - 1] || ' ';
    const shouldReplace =
      lastTypedChar === ' ' ||
      lastTypedChar === '\n' ||
      (lastTypedChar && !lastTypedChar.match(/[a-zA-Z\\]/)) ||
      !charAfterCursor.match(/[a-zA-Z]/);

    if (!shouldReplace) return;

    // Remove trailing space/non-letter for matching
    const textToMatch = textBeforeCursor.replace(/[^a-zA-Z\\]+$/, '');

    for (const abbr of sortedAbbreviations) {
      if (textToMatch.endsWith(abbr)) {
        const unicode = abbreviations[abbr];
        const startColumn = position.column - abbr.length - (textBeforeCursor.length - textToMatch.length);
        const endColumn = position.column;

        const range = new monaco.Range(
          position.lineNumber,
          startColumn,
          position.lineNumber,
          endColumn
        );

        isReplacing = true;

        // Replace abbreviation + trigger character with unicode + trigger character
        const triggerChar = textBeforeCursor.slice(textToMatch.length);
        editor.executeEdits('unicode-input', [{
          range,
          text: unicode + triggerChar,
          forceMoveMarkers: true,
        }]);

        editor.setPosition({
          lineNumber: position.lineNumber,
          column: startColumn + unicode.length + triggerChar.length,
        });

        isReplacing = false;
        break;
      }
    }
  });

  monaco.languages.registerCompletionItemProvider('lean4', {
    triggerCharacters: ['\\'],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn - 1,
        endColumn: word.endColumn,
      };

      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      if (!textBeforeCursor.match(/\\\w*$/)) {
        return { suggestions: [] };
      }

      const suggestions = sortedAbbreviations.map(abbr => ({
        label: abbr,
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: abbreviations[abbr],
        detail: abbreviations[abbr],
        range: range,
        sortText: abbr,
      }));

      return { suggestions };
    },
  });
}

export function getAbbreviations(): Record<string, string> {
  return { ...abbreviations };
}
