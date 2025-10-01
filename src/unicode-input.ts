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

    // Only trigger replacement when user types non-letter character
    // This allows typing full abbreviations like \langle without premature replacement
    const shouldReplace =
      lastTypedChar === ' ' ||
      lastTypedChar === '\n' ||
      lastTypedChar === '\t' ||
      (lastTypedChar && lastTypedChar.length === 1 && !lastTypedChar.match(/[a-zA-Z\\]/));

    if (!shouldReplace) return;

    const lineContent = model.getLineContent(position.lineNumber);
    const textBeforeCursor = lineContent.substring(0, position.column - 1);

    // Remove trailing trigger character for matching
    const textToMatch = textBeforeCursor.slice(0, -1);

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
