
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { BlogPost, BlogSettings, ThemeType } from './types';
import { storageService } from './services/storageService';
import { THEMES } from './constants';

// Components
import Sidebar from './components/Sidebar';
import BlogList from './components/BlogList';
import Editor from './components/Editor';
import ArchiveView from './components/ArchiveView';
import SettingsView from './components/SettingsView';
import PostDetail from './components/PostDetail';
import AboutMeView from './components/AboutMeView';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: 'fa-rss', label: 'Feed' },
    { path: '/archive', icon: 'fa-box-archive', label: 'Archive' },
    { path: '/new', icon: 'fa-pen-nib', label: 'Write' },
    { path: '/about', icon: 'fa-user-astronaut', label: 'Me' },
    { path: '/settings', icon: 'fa-gear', label: 'Settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-inherit border-t border-current border-opacity-10 backdrop-blur-lg bg-opacity-80 z-50 flex justify-around items-center py-3 px-2">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 transition-all ${
            location.pathname === item.path ? 'text-blue-500 scale-110' : 'opacity-50'
          }`}
        >
          <i className={`fa-solid ${item.icon} text-lg`}></i>
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const MobileHeader: React.FC<{ githubUser: BlogSettings['githubUser']; siteName: string; userName: string }> = ({ githubUser, siteName, userName }) => {
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-inherit border-b border-current border-opacity-10 backdrop-blur-md bg-opacity-80 px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-serif italic font-bold">{siteName}</Link>
      <Link to="/about">
        {githubUser ? (
          <img src={githubUser.avatar_url} className="w-8 h-8 rounded-full border border-blue-500" alt="profile" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0)}
          </div>
        )}
      </Link>
    </header>
  );
};

const AppContent: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<BlogSettings>(storageService.getSettings());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setPosts(storageService.getPosts());
  }, []);

  const handleUpdatePosts = (newPosts: BlogPost[]) => {
    setPosts(newPosts);
    storageService.savePosts(newPosts);
  };

  const handleSyncPost = async (postId: string) => {
    if (!settings.githubToken || !settings.githubRepo) {
      alert("Please configure GitHub settings in 'About me' first.");
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const success = await storageService.syncToGithub(post, settings);
    if (success) {
      const updatedPost = { ...post, lastSyncedAt: new Date().toISOString() };
      handleUpdatePosts(posts.map(p => p.id === postId ? updatedPost : p));
    } else {
      alert("GitHub sync failed. Check your token and repository permissions.");
    }
  };

  const handleSavePost = async (post: BlogPost, shouldSync: boolean = false) => {
    const isNew = !posts.find(p => p.id === post.id);
    let finalPost = { ...post };

    if (shouldSync && settings.githubToken && settings.githubRepo) {
      const success = await storageService.syncToGithub(post, settings);
      if (success) {
        finalPost.lastSyncedAt = new Date().toISOString();
      }
    }

    const updatedPosts = isNew ? [...posts, finalPost] : posts.map(p => p.id === post.id ? finalPost : p);
    handleUpdatePosts(updatedPosts);
  };

  const handleDeletePost = async (id: string) => {
    handleUpdatePosts(posts.filter(p => p.id !== id));
    if (settings.githubToken && settings.githubRepo) {
      await storageService.deleteFromGithub(id, settings);
    }
  };

  const handleUpdateSettings = (newSettings: BlogSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const lowerQuery = searchQuery.toLowerCase();
    return posts.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) || 
      p.content.toLowerCase().includes(lowerQuery) ||
      p.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [posts, searchQuery]);

  const currentThemeData = THEMES.find(t => t.id === settings.currentTheme) || THEMES[0];

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${currentThemeData.class}`}>
      <MobileHeader githubUser={settings.githubUser} userName={settings.userName} siteName={settings.siteName} />
      
      <Sidebar 
        postsCount={posts.length} 
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        userName={settings.userName}
        siteName={settings.siteName}
        tagline={settings.tagline}
        githubUser={settings.githubUser}
      />
      
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:px-12 md:py-12 w-full pb-24 lg:pb-12">
        <Routes>
          <Route path="/" element={<BlogList posts={filteredPosts} onDelete={handleDeletePost} />} />
          <Route path="/new" element={<Editor onSave={handleSavePost} isGithubConnected={!!settings.githubToken} />} />
          <Route path="/edit/:id" element={<Editor posts={posts} onSave={handleSavePost} isGithubConnected={!!settings.githubToken} />} />
          <Route path="/archive" element={<ArchiveView posts={posts} onSync={handleSyncPost} />} />
          <Route path="/about" element={<AboutMeView settings={settings} onSave={handleUpdateSettings} />} />
          <Route path="/settings" element={<SettingsView settings={settings} onSave={handleUpdateSettings} />} />
          <Route path="/post/:id" element={<PostDetail posts={posts} />} />
        </Routes>
      </main>

      <MobileNav />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
