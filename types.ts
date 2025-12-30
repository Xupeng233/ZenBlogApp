
export type ThemeType = 'light' | 'dark' | 'sepia' | 'ocean' | 'minimal';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isDraft: boolean;
  version: number;
  lastSyncedAt?: string;
}

export interface BlogSettings {
  userName: string;
  githubToken: string;
  githubRepo: string;
  githubUser: GitHubUser | null;
  currentTheme: ThemeType;
  siteName: string;
  tagline: string;
  bio?: string;
  autoSaveEnabled: boolean;
}

export interface ArchiveGroup {
  year: number;
  months: {
    month: string;
    posts: BlogPost[];
  }[];
}

export interface EditorDraft {
  id: string | null;
  title: string;
  content: string;
  tags: string;
  timestamp: string;
}
