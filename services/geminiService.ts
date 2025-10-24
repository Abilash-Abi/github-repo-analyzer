import { GoogleGenAI } from "@google/genai";
import { GithubCommit, GithubCommitDetail, LLMProvider } from '../types';

const MAX_COMMITS_FOR_PROMPT = 200;
const MAX_DIFF_LENGTH = 4000; // Truncate long diffs to manage prompt size

interface LLMConfig {
    provider: LLMProvider;
    apiKey: string;
    ollamaBaseUrl: string;
    model: string;
}

const groupCommitsByUser = <T extends { author: { login: string } | null }>(commits: T[]): Record<string, T[]> => {
    return commits.reduce((acc, commit) => {
        const login = commit.author?.login;
        if (login) {
            if (!acc[login]) {
                acc[login] = [];
            }
            acc[login].push(commit);
        }
        return acc;
    }, {} as Record<string, T[]>);
};

async function generateWithLLM(prompt: string, llmConfig: LLMConfig): Promise<string> {
    try {
        switch (llmConfig.provider) {
            case LLMProvider.GEMINI:
                if (!llmConfig.apiKey) throw new Error("Google Gemini API key is required.");
                const ai = new GoogleGenAI({ apiKey: llmConfig.apiKey });
                const response = await ai.models.generateContent({
                    model: llmConfig.model,
                    contents: prompt,
                });
                return response.text;

            case LLMProvider.OPENROUTER:
                if (!llmConfig.apiKey) throw new Error("OpenRouter API key is required.");
                // Remove the "(Free)" tag before sending to the API
                const modelName = llmConfig.model.replace(/\s*\(Free\)\s*$/, '');
                const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${llmConfig.apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": location.origin,
                        "X-Title": "GitHub Repo Analyzer"
                    },
                    body: JSON.stringify({
                        "model": modelName,
                        "messages": [{ "role": "user", "content": prompt }]
                    })
                });
                if (!orResponse.ok) {
                    const errorData = await orResponse.json();
                    throw new Error(`OpenRouter API error: ${errorData.error?.message || orResponse.statusText}`);
                }
                const orData = await orResponse.json();
                return orData.choices[0].message.content;

            case LLMProvider.OLLAMA:
                const ollamaResponse = await fetch(`${llmConfig.ollamaBaseUrl}/api/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        "model": llmConfig.model,
                        "prompt": prompt,
                        "stream": false
                    })
                });
                 if (!ollamaResponse.ok) {
                    const errorText = await ollamaResponse.text();
                    throw new Error(`Ollama API error (${ollamaResponse.status}): ${errorText || ollamaResponse.statusText}`);
                }
                const ollamaData = await ollamaResponse.json();
                if(ollamaData.error) {
                    throw new Error(`Ollama API error: ${ollamaData.error}`);
                }
                return ollamaData.response;

            default:
                throw new Error(`Unsupported LLM provider: ${llmConfig.provider}`);
        }
    } catch (error) {
        console.error(`Error calling ${llmConfig.provider} API:`, error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to generate response from ${llmConfig.provider}. ${message}`);
    }
}


export const generateTaskList = async (commits: GithubCommit[], llmConfig: LLMConfig): Promise<string> => {
  const latestCommits = commits.slice(0, MAX_COMMITS_FOR_PROMPT);
  const groupedCommits = groupCommitsByUser(latestCommits);

  let commitData = '';
  for (const user in groupedCommits) {
    commitData += `User: ${user}\n---\n`;
    commitData += groupedCommits[user].map(c => `- ${c.commit.message}`).join('\n');
    commitData += '\n\n';
  }

  const prompt = `
    You are an expert project manager analyzing contributions for a software project.
    Based on the following list of Git commit messages, grouped by user, create a consolidated task summary.
    The output should be in well-structured Markdown format.
    For each user, create a main heading (e.g., "## Contributions from <username>").
    Under each user's heading, group related tasks together under subheadings (e.g., "### Feature Development", "### Bug Fixes").
    Summarize what each user accomplished based on their commits. Ignore merge commits and trivial changes.

    Here is the commit data:
    ---
    ${commitData}
    ---
  `;

  return generateWithLLM(prompt, llmConfig);
};

export const generateWorkReport = async (commits: GithubCommitDetail[], llmConfig: LLMConfig): Promise<string> => {
  const groupedCommits = groupCommitsByUser(commits);
  
  let commitData = '';
  for (const user in groupedCommits) {
      commitData += `Developer: ${user}\n===\n`;
      commitData += groupedCommits[user].map(commit => {
          const diff = (commit.files || [])
            .map(file => `File: ${file.filename}\n${file.patch || ''}`)
            .join('\n')
            .slice(0, MAX_DIFF_LENGTH);
          
          return `Commit: ${commit.commit.message}\nDiff:\n\`\`\`diff\n${diff}\n\`\`\``;
      }).join('\n---\n');
      commitData += '\n\n';
  }

  const prompt = `
    You are a senior engineering manager writing a performance summary for multiple developers.
    Analyze the following Git commits and their associated code diffs, which are grouped by developer, to create a professional and consolidated work report.

    The report should:
    1. Be structured in clear, professional Markdown.
    2. Have a main section for each developer (e.g., "## Work Report for <username>").
    3. For each developer, start with a high-level summary of their main contributions.
    4. Include subsections like '### Key Projects & Features' or '### Technical Enhancements & Fixes'.
    5. Go beyond the commit messages. Use the code diffs to infer the complexity, scope, and quality of the work. For example, mention refactoring efforts, new component creation, or complex logic changes.
    6. Maintain a constructive and objective tone throughout.

    Here is the data:
    ---
    ${commitData}
    ---
  `;
  
  return generateWithLLM(prompt, llmConfig);
};