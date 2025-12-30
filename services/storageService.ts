
import { BlogPost, BlogSettings, EditorDraft } from '../types';
import { githubService } from './githubService';

const STORAGE_KEY = 'zenblog_posts';
const SETTINGS_KEY = 'zenblog_settings';
const DRAFT_KEY = 'zenblog_editor_draft';

export const storageService = {
  getPosts: (): BlogPost[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  savePosts: (posts: BlogPost[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },

  getSettings: (): BlogSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      userName: 'Author Name',
      githubToken: '',
      githubRepo: '',
      githubUser: null,
      currentTheme: 'light',
      siteName: 'ZenBlog',
      tagline: 'Personal AI Writing Space',
      bio: '',
      autoSaveEnabled: true
    };
  },

  saveSettings: (settings: BlogSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getDraft: (): EditorDraft | null => {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveDraft: (draft: EditorDraft) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  },

  clearDraft: () => {
    localStorage.removeItem(DRAFT_KEY);
  },

  // Enhanced GitHub sync
  syncToGithub: async (post: BlogPost, settings: BlogSettings) => {
    if (!settings.githubToken || !settings.githubRepo) return false;
    return await githubService.syncPostToRepo(settings.githubToken, settings.githubRepo, post);
  },

  deleteFromGithub: async (postId: string, settings: BlogSettings) => {
    if (!settings.githubToken || !settings.githubRepo) return false;
    return await githubService.deletePostFromRepo(settings.githubToken, settings.githubRepo, postId);
  }
};
