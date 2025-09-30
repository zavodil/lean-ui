/**
 * API client for submitting solutions to backend
 */

export interface BackendConfig {
  endpoint: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface SubmitSolutionRequest {
  problemId: string;
  code: string;
  userId?: string;
  timestamp: number;
}

export interface SubmitSolutionResponse {
  success: boolean;
  message?: string;
  submissionId?: string;
  errors?: string[];
}

export class BackendAPI {
  private config: BackendConfig;

  constructor(config: BackendConfig) {
    this.config = config;
  }

  async submitSolution(data: SubmitSolutionRequest): Promise<SubmitSolutionResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...this.config.headers,
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to submit solution:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async validateSolution(data: SubmitSolutionRequest): Promise<SubmitSolutionResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...this.config.headers,
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const validateEndpoint = this.config.endpoint.replace('/submit', '/validate');

      const response = await fetch(validateEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to validate solution:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}