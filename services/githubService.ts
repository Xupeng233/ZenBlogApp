
import { GitHubUser, BlogPost } from '../types';

export const githubService = {
  async fetchUserProfile(token: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with GitHub. Check your token.');
    }

    return response.json();
  },

  async syncPostToRepo(token: string, repo: string, post: BlogPost): Promise<boolean> {
    const path = `posts/${post.id}.json`;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(post, null, 2))));

    // Try to get existing file to get its SHA
    let sha: string | undefined;
    try {
      const getFile = await fetch(url, {
        headers: { Authorization: `token ${token}` },
      });
      if (getFile.ok) {
        const fileData = await getFile.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File doesn't exist, which is fine for new posts
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Sync post: ${post.title} (v${post.version})`,
        content,
        sha,
      }),
    });

    return response.ok;
  },

  async deletePostFromRepo(token: string, repo: string, postId: string): Promise<boolean> {
    const path = `posts/${postId}.json`;
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    try {
      const getFile = await fetch(url, {
        headers: { Authorization: `token ${token}` },
      });
      if (!getFile.ok) return true; // Already gone

      const fileData = await getFile.json();
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete post: ${postId}`,
          sha: fileData.sha,
        }),
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }
};
