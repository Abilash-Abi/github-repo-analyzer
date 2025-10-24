import { GithubCommit, GithubCommitDetail } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const MAX_COMMITS_TO_FETCH = 500; // Limit to avoid excessive API calls
const PER_PAGE = 100;
const MAX_COMMITS_FOR_REPORT = 30; // Limit for detailed analysis to avoid long waits and rate limiting

/**
 * Fetches recent commits from a repository and filters them for a list of specified usernames.
 * This is more efficient than querying for each user individually.
 */
export const getCommitsForUsers = async (
  owner: string,
  repo: string,
  usernames: string[],
  token?: string,
  branch?: string
): Promise<GithubCommit[]> => {
  const allCommits: GithubCommit[] = [];
  const maxPages = Math.ceil(MAX_COMMITS_TO_FETCH / PER_PAGE);
  const usernameSet = new Set(usernames.map(u => u.toLowerCase()));

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  for (let page = 1; page <= maxPages; page++) {
    const params = new URLSearchParams({
      per_page: PER_PAGE.toString(),
      page: page.toString(),
    });
    if (branch) {
      params.set('sha', branch);
    }
    
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params.toString()}`;
    
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Repository not found at ${owner}/${repo}. Please check the URL.`);
      }
      if (response.status === 401) {
        throw new Error('Invalid GitHub token. Please check your personal access token.');
      }
       if (response.status === 422 || response.status === 409) { // 422 for invalid sha, 409 for empty repo
        throw new Error(`Branch "${branch}" not found or repository is empty. Please check the branch name.`);
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `GitHub API error: ${response.status}`);
    }

    const commits: GithubCommit[] = await response.json();
    const filteredCommits = commits.filter(commit => 
      commit.author && usernameSet.has(commit.author.login.toLowerCase())
    );
    allCommits.push(...filteredCommits);

    if (commits.length < PER_PAGE) {
      // Last page reached
      break;
    }
  }

  return allCommits.slice(0, MAX_COMMITS_TO_FETCH);
};

const getCommitDetail = async (
  owner: string,
  repo: string,
  sha: string,
  token?: string
): Promise<GithubCommitDetail> => {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`;
  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Commit with SHA ${sha} not found.`);
    }
    const errorData = await response.json();
    throw new Error(errorData.message || `GitHub API error fetching commit details: ${response.status}`);
  }

  return response.json();
};

export const getCommitsForReportForUsers = async (
  owner: string,
  repo: string,
  usernames: string[],
  token?: string,
  branch?: string
): Promise<GithubCommitDetail[]> => {
  const recentCommits = await getCommitsForUsers(owner, repo, usernames, token, branch);

  if (recentCommits.length === 0) {
    return [];
  }

  const shasToFetch = recentCommits
    .slice(0, MAX_COMMITS_FOR_REPORT)
    .map(c => c.sha);

  const detailPromises = shasToFetch.map(sha =>
    getCommitDetail(owner, repo, sha, token)
  );

  const commitDetails = await Promise.all(detailPromises);
  return commitDetails;
};