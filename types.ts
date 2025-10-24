export enum AnalysisState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export enum AnalysisType {
  TASK_SUMMARY = 'TASK_SUMMARY',
  WORK_REPORT = 'WORK_REPORT',
}

export enum LLMProvider {
  GEMINI = 'Google Gemini',
  OPENROUTER = 'OpenRouter',
  OLLAMA = 'Ollama',
}

export const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
];

export const OPENROUTER_MODELS = [
    // Free Models (verified to be usable on free-tier accounts)
    'moonshotai/kimi-dev-72b (Free)',
    'arliai/qwq-32b-arliai-rpr-v1 (Free)',
    'cognitivecomputations/dolphin-mistral-24b-venice-edition (Free)',
    'tngtech/deepseek-r1t2-chimera (Free)',
    'x-ai/grok-4-fast (Free)',
    'z-ai/glm-4.5-air (Free)',
    'mistralai/mistral-7b-instruct (Free)',
    'nousresearch/nous-hermes-2-mixtral-8x7b-dpo (Free)',
    'huggingfaceh4/zephyr-7b-beta (Free)',
    'google/gemma-7b-it (Free)',
    
    // Paid Models (require credits)
    'openai/gpt-3.5-turbo',
    'google/gemini-flash-1.5',
    'openai/gpt-4o',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-haiku',
    'mistralai/mistral-large',
    'meta-llama/llama-3-70b-instruct',
    'phind/phind-code-llama-34b-v2',
];


export interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
}

export interface GithubCommitFile {
    sha: string;
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string; // The diff
}

export interface GithubCommitDetail extends GithubCommit {
    files: GithubCommitFile[];
}