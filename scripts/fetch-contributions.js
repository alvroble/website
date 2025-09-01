const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const USERNAME = 'alvroble';
const DATA_FILE = path.join(__dirname, '..', 'data', 'github_contributions.json');

async function fetchUserData() {
  try {
    const { data: user } = await octokit.rest.users.getByUsername({
      username: USERNAME,
    });
    
    return {
      username: user.login,
      profile_url: user.html_url,
      avatar_url: user.avatar_url,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

async function fetchUserStats() {
  try {
    // Get user repositories
    const { data: repos } = await octokit.rest.repos.listForUser({
      username: USERNAME,
      per_page: 100,
      sort: 'updated'
    });

    // Get user events (for contributions)
    const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
      username: USERNAME,
      per_page: 100
    });

    // Calculate statistics
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Count different types of events
    const pushEvents = events.filter(event => event.type === 'PushEvent');
    const pullRequestEvents = events.filter(event => event.type === 'PullRequestEvent');
    const issuesEvents = events.filter(event => event.type === 'IssuesEvent');
    
    return {
      total_contributions: events.length,
      total_repositories: repos.length,
      total_stars: totalStars,
      total_forks: totalForks,
      total_issues: issuesEvents.length,
      total_pull_requests: pullRequestEvents.length,
      total_commits: pushEvents.reduce((sum, event) => sum + (event.payload.commits?.length || 0), 0)
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      total_contributions: 0,
      total_repositories: 0,
      total_stars: 0,
      total_forks: 0,
      total_issues: 0,
      total_pull_requests: 0,
      total_commits: 0
    };
  }
}

async function fetchRecentActivity() {
  try {
    const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
      username: USERNAME,
      per_page: 20
    });

    return events.map(event => ({
      id: event.id,
      type: event.type,
      created_at: event.created_at,
      repo: event.repo.name,
      repo_url: `https://github.com/${event.repo.name}`,
      action: event.payload.action || null,
      title: event.payload.pull_request?.title || 
             event.payload.issue?.title || 
             event.payload.commits?.[0]?.message || 
             'Activity',
      url: event.payload.pull_request?.html_url || 
           event.payload.issue?.html_url || 
           `https://github.com/${event.repo.name}/commit/${event.payload.head || event.payload.sha}`
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

async function fetchRepositories() {
  try {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username: USERNAME,
      per_page: 20,
      sort: 'updated'
    });

    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updated_at: repo.updated_at,
      is_fork: repo.fork
    }));
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return [];
  }
}

async function fetchPullRequests() {
  try {
    // Search for pull requests by the user
    const { data: searchResults } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${USERNAME} type:pr`,
      sort: 'updated',
      order: 'desc',
      per_page: 30
    });

    const pullRequests = {
      open: [],
      merged: [],
      closed: []
    };

    for (const pr of searchResults.items) {
      const prData = {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        repo: pr.repository_url.split('/').slice(-2).join('/'),
        repo_url: `https://github.com/${pr.repository_url.split('/').slice(-2).join('/')}`,
        state: pr.state,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        closed_at: pr.closed_at,
        merged_at: pr.pull_request?.merged_at
      };

      if (prData.merged_at) {
        pullRequests.merged.push(prData);
      } else if (prData.state === 'open') {
        pullRequests.open.push(prData);
      } else {
        pullRequests.closed.push(prData);
      }
    }

    return pullRequests;
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return { open: [], merged: [], closed: [] };
  }
}

async function fetchIssues() {
  try {
    // Search for issues by the user
    const { data: searchResults } = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${USERNAME} type:issue`,
      sort: 'updated',
      order: 'desc',
      per_page: 20
    });

    const issues = {
      open: [],
      closed: []
    };

    for (const issue of searchResults.items) {
      const issueData = {
        id: issue.id,
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        repo: issue.repository_url.split('/').slice(-2).join('/'),
        repo_url: `https://github.com/${issue.repository_url.split('/').slice(-2).join('/')}`,
        state: issue.state,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at
      };

      if (issueData.state === 'open') {
        issues.open.push(issueData);
      } else {
        issues.closed.push(issueData);
      }
    }

    return issues;
  } catch (error) {
    console.error('Error fetching issues:', error);
    return { open: [], closed: [] };
  }
}

async function main() {
  console.log('Fetching GitHub contributions data...');
  
  const [user, statistics, recentActivity, repositories, pullRequests, issues] = await Promise.all([
    fetchUserData(),
    fetchUserStats(),
    fetchRecentActivity(),
    fetchRepositories(),
    fetchPullRequests(),
    fetchIssues()
  ]);

  const contributionsData = {
    user,
    statistics,
    recent_activity: recentActivity,
    repositories,
    pull_requests: pullRequests,
    issues
  };

  // Write to data file
  fs.writeFileSync(DATA_FILE, JSON.stringify(contributionsData, null, 2));
  console.log('GitHub contributions data updated successfully!');
}

main().catch(console.error);
