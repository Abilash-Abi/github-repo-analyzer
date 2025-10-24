import React from 'react';
import { AnalysisType, LLMProvider, GEMINI_MODELS, OPENROUTER_MODELS } from '../types';

interface InputFormProps {
  repoUrl: string;
  setRepoUrl: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  branch: string;
  setBranch: (value: string) => void;
  githubToken: string;
  setGithubToken: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  analysisType: AnalysisType;
  setAnalysisType: (type: AnalysisType) => void;
  llmProvider: LLMProvider;
  setLlmProvider: (provider: LLMProvider) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  ollamaBaseUrl: string;
  setOllamaBaseUrl: (url: string) => void;
  llmModel: string;
  setLlmModel: (model: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({
  repoUrl,
  setRepoUrl,
  username,
  setUsername,
  branch,
  setBranch,
  githubToken,
  setGithubToken,
  onAnalyze,
  isLoading,
  analysisType,
  setAnalysisType,
  llmProvider,
  setLlmProvider,
  apiKey,
  setApiKey,
  ollamaBaseUrl,
  setOllamaBaseUrl,
  llmModel,
  setLlmModel,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as LLMProvider;
    setLlmProvider(newProvider);
    // Reset model to a default for the new provider
    switch (newProvider) {
      case LLMProvider.GEMINI:
        setLlmModel(GEMINI_MODELS[0]);
        break;
      case LLMProvider.OPENROUTER:
        setLlmModel(OPENROUTER_MODELS[0]);
        break;
      case LLMProvider.OLLAMA:
        setLlmModel('llama3');
        break;
    }
  };

  const renderModelInput = () => {
    switch(llmProvider) {
        case LLMProvider.GEMINI:
            return (
                <select id="llmModel" value={llmModel} onChange={(e) => setLlmModel(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    {GEMINI_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            );
        case LLMProvider.OPENROUTER:
             return (
                <select id="llmModel" value={llmModel} onChange={(e) => setLlmModel(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                    {OPENROUTER_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            );
        case LLMProvider.OLLAMA:
            return (
                 <input
                    id="llmModel"
                    type="text"
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    placeholder="e.g., llama3, mistral"
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
            );
        default:
            return null;
    }
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-300 mb-2">
            GitHub Repository URL
          </label>
          <input
            id="repoUrl"
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-2">
            Branch Name
          </label>
          <input
            id="branch"
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
      </div>
      <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            GitHub Usernames
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., gaearon, torvalds"
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
           <p className="text-xs text-gray-500 mt-1">
            Enter one or more usernames, separated by commas.
          </p>
        </div>
      <div>
        <label htmlFor="githubToken" className="block text-sm font-medium text-gray-300 mb-2">
          GitHub Access Token (Optional)
        </label>
        <input
          id="githubToken"
          type="password"
          value={githubToken}
          onChange={(e) => setGithubToken(e.target.value)}
          placeholder="For private repos or to increase rate limits"
          className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        <p className="text-xs text-gray-500 mt-1">
            Your token is only used to communicate with the GitHub API and is not stored.
        </p>
      </div>

       <div className="space-y-4 rounded-lg p-4 border border-gray-700 bg-gray-900/50">
          <h3 className="text-md font-semibold text-gray-200">LLM Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label htmlFor="llmProvider" className="block text-sm font-medium text-gray-300 mb-2">
                    Provider
                 </label>
                 <select
                    id="llmProvider"
                    value={llmProvider}
                    onChange={handleProviderChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                 >
                    {Object.values(LLMProvider).map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
              </div>
               <div>
                 <label htmlFor="llmModel" className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                 </label>
                 {renderModelInput()}
              </div>
          </div>


          { (llmProvider === LLMProvider.GEMINI || llmProvider === LLMProvider.OPENROUTER) && (
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${llmProvider} API Key`}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          )}
          
          { llmProvider === LLMProvider.OLLAMA && (
            <div>
              <label htmlFor="ollamaBaseUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Ollama Base URL
              </label>
              <input
                id="ollamaBaseUrl"
                type="text"
                value={ollamaBaseUrl}
                onChange={(e) => setOllamaBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                The local URL where your Ollama instance is running.
              </p>
            </div>
          )}
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Analysis Type
        </label>
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setAnalysisType(AnalysisType.TASK_SUMMARY)}
            className={`flex-1 px-4 py-2 text-sm font-medium border-gray-600 rounded-l-md transition-colors ${
              analysisType === AnalysisType.TASK_SUMMARY
                ? 'bg-blue-600 text-white border-blue-500 z-10 ring-1 ring-blue-500'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border'
            }`}
          >
            Task Summary
          </button>
          <button
            type="button"
            onClick={() => setAnalysisType(AnalysisType.WORK_REPORT)}
            className={`flex-1 px-4 py-2 text-sm font-medium border-gray-600 rounded-r-md transition-colors -ml-px ${
              analysisType === AnalysisType.WORK_REPORT
                ? 'bg-blue-600 text-white border-blue-500 z-10 ring-1 ring-blue-500'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border'
            }`}
          >
            Work Report
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {analysisType === AnalysisType.TASK_SUMMARY 
            ? "Generates a high-level task list from commit messages."
            : "Generates a detailed report from actual code changes."}
        </p>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
             analysisType === AnalysisType.TASK_SUMMARY ? 'Analyze Commits' : 'Generate Report'
          )}
        </button>
      </div>
    </form>
  );
};

export default InputForm;