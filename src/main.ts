import * as monaco from 'monaco-editor';
import { BackendAPI, BackendConfig } from './api';
import { createLeanEditor } from './lean-config';

interface ProblemData {
  id: string;
  title: string;
  description: string;
  initialCode?: string;
}

interface SolutionData {
  problemId: string;
  code: string;
  timestamp: number;
  userId?: string;
}

interface EditorConfig {
  backendConfig?: BackendConfig;
  submitToBackend?: boolean;
  userId?: string;
}

interface JumpToPositionData {
  line: number;
  column: number;
  highlight?: boolean;
}

interface DiagnosticItem {
  line: number;
  column: number;
  type: 'error' | 'warning';
  message: string;
}

interface SetDiagnosticsData {
  diagnostics: DiagnosticItem[];
}

class LeanEditorApp {
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private currentProblem: ProblemData | null = null;
  private saveButton: HTMLButtonElement;
  private statusElement: HTMLElement;
  private backendAPI: BackendAPI | null = null;
  private config: EditorConfig = {
    submitToBackend: false,
  };

  constructor() {
    this.saveButton = document.getElementById('save-button') as HTMLButtonElement;
    this.statusElement = document.getElementById('status') as HTMLElement;

    this.init();
  }

  private async init() {
    try {
      this.updateStatus('Initializing...', '');

      const container = document.getElementById('monaco-editor');
      if (!container) {
        throw new Error('Editor container not found');
      }

      this.editor = createLeanEditor(container, '-- Write your Lean proof here\n\n');
      this.setupEventListeners();
      this.setupPostMessageListener();
      this.updateStatus('Ready', 'success');
    } catch (error) {
      console.error('Initialization error:', error);
      this.updateStatus(`Init failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  private setupEventListeners() {
    this.saveButton.addEventListener('click', () => this.handleSave());

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        this.handleSave();
      }
    });

    if (this.editor) {
      this.editor.onDidChangeModelContent(() => {
        this.saveButton.disabled = false;
      });
    }
  }

  private setupPostMessageListener() {
    window.addEventListener('message', (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'LOAD_PROBLEM':
          this.handleLoadProblem(data as ProblemData);
          break;
        case 'REQUEST_SOLUTION':
          this.handleRequestSolution();
          break;
        case 'CLEAR_EDITOR':
          this.handleClearEditor();
          break;
        case 'CONFIGURE':
          this.handleConfigure(data as EditorConfig);
          break;
        case 'JUMP_TO_POSITION':
          this.handleJumpToPosition(data as JumpToPositionData);
          break;
        case 'SET_DIAGNOSTICS':
          this.handleSetDiagnostics(data as SetDiagnosticsData);
          break;
      }
    });

    this.notifyParent('IFRAME_READY', { timestamp: Date.now() });
  }

  private handleLoadProblem(problem: ProblemData) {
    this.currentProblem = problem;
    if (!this.editor) return;

    const initialCode = problem.initialCode ||
      `-- Problem: ${problem.title}\n-- ${problem.description}\n\n`;

    this.editor.setValue(initialCode);

    const titleElement = document.querySelector('.title');
    if (titleElement) {
      titleElement.textContent = problem.title;
    }

    this.saveButton.disabled = false;
    this.updateStatus('Problem loaded', 'success');
    this.notifyParent('PROBLEM_LOADED', { problemId: problem.id });
  }

  private async handleSave() {
    if (!this.editor || !this.currentProblem) {
      this.updateStatus('No problem loaded', 'error');
      return;
    }

    const code = this.editor.getValue();
    const solution: SolutionData = {
      problemId: this.currentProblem.id,
      code,
      timestamp: Date.now(),
      userId: this.config.userId,
    };

    if (this.config.submitToBackend && this.backendAPI) {
      this.updateStatus('Submitting...', '');
      this.saveButton.disabled = true;

      const response = await this.backendAPI.submitSolution(solution);

      if (response.success) {
        this.updateStatus('Submitted!', 'success');
        this.notifyParent('SOLUTION_SUBMITTED', { ...solution, submissionId: response.submissionId });
      } else {
        this.updateStatus(`Error: ${response.message}`, 'error');
        this.saveButton.disabled = false;
        return;
      }
    } else {
      this.notifyParent('SOLUTION_SUBMITTED', solution);
      this.updateStatus('Solution saved!', 'success');
      this.saveButton.disabled = true;
    }

    setTimeout(() => this.updateStatus('', ''), 3000);
  }

  private handleRequestSolution() {
    if (!this.editor || !this.currentProblem) return;

    const solution: SolutionData = {
      problemId: this.currentProblem.id,
      code: this.editor.getValue(),
      timestamp: Date.now(),
    };

    this.notifyParent('SOLUTION_DATA', solution);
  }

  private handleClearEditor() {
    if (!this.editor) return;

    this.editor.setValue('-- Write your Lean proof here\n\n');
    this.currentProblem = null;
    this.saveButton.disabled = true;

    const titleElement = document.querySelector('.title');
    if (titleElement) titleElement.textContent = 'Lean Problem Solver';

    this.updateStatus('Editor cleared', 'success');
  }

  private handleConfigure(config: EditorConfig) {
    this.config = { ...this.config, ...config };

    if (config.backendConfig && config.submitToBackend) {
      this.backendAPI = new BackendAPI(config.backendConfig);
      this.updateStatus('Backend configured', 'success');
    }
  }

  private handleJumpToPosition(data: JumpToPositionData) {
    if (!this.editor) return;

    const { line, column, highlight } = data;

    // Set cursor position
    this.editor.setPosition({ lineNumber: line, column });

    // Scroll to position
    this.editor.revealPositionInCenter({ lineNumber: line, column });

    // Optionally highlight the line
    if (highlight) {
      const decorations = this.editor.createDecorationsCollection([{
        range: new monaco.Range(line, 1, line, Number.MAX_SAFE_INTEGER),
        options: {
          isWholeLine: true,
          className: 'highlighted-line',
          glyphMarginClassName: 'highlighted-line-glyph'
        }
      }]);

      // Remove highlight after 2 seconds
      setTimeout(() => {
        decorations.clear();
      }, 2000);
    }

    // Focus editor
    this.editor.focus();
  }

  private handleSetDiagnostics(data: SetDiagnosticsData) {
    if (!this.editor) return;

    const model = this.editor.getModel();
    if (!model) return;

    const markers: monaco.editor.IMarkerData[] = data.diagnostics.map(diag => ({
      startLineNumber: diag.line,
      startColumn: diag.column,
      endLineNumber: diag.line,
      endColumn: diag.column + 1,
      message: diag.message,
      severity: diag.type === 'error'
        ? monaco.MarkerSeverity.Error
        : monaco.MarkerSeverity.Warning,
    }));

    monaco.editor.setModelMarkers(model, 'lean-diagnostics', markers);
  }

  private notifyParent(type: string, data: any) {
    window.parent.postMessage({ type, data }, '*');
  }

  private updateStatus(message: string, type: 'success' | 'error' | '') {
    this.statusElement.textContent = message;
    this.statusElement.className = 'status';
    if (type) this.statusElement.classList.add(type);
  }
}

new LeanEditorApp();