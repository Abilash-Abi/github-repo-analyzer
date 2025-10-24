import React, { useState, useCallback } from 'react';
import { AnalysisState, AnalysisType, LLMProvider } from './types';
import { getCommitsForUsers, getCommitsForReportForUsers } from './services/githubService';
import { generateTaskList, generateWorkReport } from './services/geminiService';
import InputForm from './components/InputForm';
import RepoAnalysis from './components/RepoAnalysis';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import { GithubIcon } from './components/icons/GithubIcon';

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [username, setUsername] = useState<string>(' ');
  const [branch, setBranch] = useState<string>('');
  const [githubToken, setGithubToken] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>(AnalysisType.TASK_SUMMARY);

  const [llmProvider, setLlmProvider] = useState<LLMProvider>(LLMProvider.GEMINI);
  const [apiKey, setApiKey] = useState<string>('');
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>('http://localhost:11434');
  const [llmModel, setLlmModel] = useState<string>('gemini-2.5-flash');


  const handleAnalyze = useCallback(async () => {
    setAnalysisState(AnalysisState.LOADING);
    setAnalysisResult(null);
    setErrorMessage(null);

    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/.]+)/);
    if (!match) {
      setErrorMessage('Invalid GitHub repository URL. Please use the format: https://github.com/owner/repo');
      setAnalysisState(AnalysisState.ERROR);
      return;
    }

    const usernames = username.split(',').map(u => u.trim()).filter(Boolean);
    if (usernames.length === 0) {
        setErrorMessage('At least one GitHub username is required.');
        setAnalysisState(AnalysisState.ERROR);
        return;
    }

    const [, owner, repo] = match;
    const branchToAnalyze = branch.trim();

    const llmConfig = { provider: llmProvider, apiKey, ollamaBaseUrl, model: llmModel };

    try {
      let resultText: string;

      if (analysisType === AnalysisType.TASK_SUMMARY) {
        const commits = await getCommitsForUsers(owner, repo, usernames, githubToken, branchToAnalyze);
        if (commits.length === 0) {
          setErrorMessage(`No commits found for the specified user(s) in this repository on branch "${branchToAnalyze}".`);
          setAnalysisState(AnalysisState.ERROR);
          return;
        }
        resultText = await generateTaskList(commits, llmConfig);
      } else { // WORK_REPORT
        const commitsWithDetails = await getCommitsForReportForUsers(owner, repo, usernames, githubToken, branchToAnalyze);
        if (commitsWithDetails.length === 0) {
            setErrorMessage(`No recent commits found for the specified user(s) on branch "${branchToAnalyze}" to generate a report.`);
            setAnalysisState(AnalysisState.ERROR);
            return;
        }
        resultText = await generateWorkReport(commitsWithDetails, llmConfig);
      }
      
      setAnalysisResult(resultText);
      setAnalysisState(AnalysisState.SUCCESS);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(message);
      setAnalysisState(AnalysisState.ERROR);
    }
  }, [repoUrl, username, githubToken, analysisType, branch, llmProvider, apiKey, ollamaBaseUrl, llmModel]);

  const renderContent = () => {
    switch (analysisState) {
        case AnalysisState.LOADING:
            if (analysisType === AnalysisType.WORK_REPORT) {
                return <Loader title="Generating Work Report..." message="Fetching commit details and analyzing code changes. This may take longer." />;
            }
            return <Loader />;
        case AnalysisState.ERROR:
            return errorMessage && <ErrorMessage message={errorMessage} />;
        case AnalysisState.SUCCESS:
            const title = analysisType === AnalysisType.TASK_SUMMARY ? "Task Summary" : "Work Report";
            return analysisResult && <RepoAnalysis result={analysisResult} title={title} />;
        case AnalysisState.IDLE:
        default:
            return (
              <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <p className="text-lg">Select an analysis type and enter repository details.</p>
                <p className="text-sm mt-2">Results from the AI will be displayed here.</p>
              </div>
            );
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <GithubIcon className="h-10 w-10 text-white" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              GitHub Repo Analyzer
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Generate summaries and reports from user commit histories.
          </p>
        </header>

        <main className="bg-gray-800/50 rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-700">
          <InputForm
            repoUrl={repoUrl}
            setRepoUrl={setRepoUrl}
            username={username}
            setUsername={setUsername}
            branch={branch}
            setBranch={setBranch}
            githubToken={githubToken}
            setGithubToken={setGithubToken}
            onAnalyze={handleAnalyze}
            isLoading={analysisState === AnalysisState.LOADING}
            analysisType={analysisType}
            setAnalysisType={setAnalysisType}
            llmProvider={llmProvider}
            setLlmProvider={setLlmProvider}
            apiKey={apiKey}
            setApiKey={setApiKey}
            ollamaBaseUrl={ollamaBaseUrl}
            setOllamaBaseUrl={setOllamaBaseUrl}
            llmModel={llmModel}
            setLlmModel={setLlmModel}
          />

          <div className="mt-8 min-h-[200px]">
            {renderContent()}
          </div>
        </main>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GitHub Repo Analyzer. Powered by AI.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;