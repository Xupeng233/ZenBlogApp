
import React, { useState, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { BlogSettings } from '../types';
import { githubService } from '../services/githubService';

interface AboutMeViewProps {
  settings: BlogSettings;
  onSave: (settings: BlogSettings) => void;
}

const AboutMeView: React.FC<AboutMeViewProps> = ({ settings, onSave }) => {
  const [form, setForm] = useState<BlogSettings>(settings);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{msg: string, type: 'info' | 'success' | 'error'} | null>(null);
  const [bioMode, setBioMode] = useState<'edit' | 'preview'>('edit');

  const handleGitHubLogin = async () => {
    if (!form.githubToken) {
      setSyncStatus({ msg: "Please enter a token first.", type: 'error' });
      return;
    }

    setIsSyncing(true);
    setSyncStatus({ msg: "Authenticating with GitHub...", type: 'info' });

    try {
      const user = await githubService.fetchUserProfile(form.githubToken);
      const updatedForm = { ...form, githubUser: user, userName: user.name || user.login };
      setForm(updatedForm);
      onSave(updatedForm);
      setSyncStatus({ msg: `Welcome, ${user.login}! Connected successfully.`, type: 'success' });
    } catch (e: any) {
      setSyncStatus({ msg: `Authentication failed: ${e.message}`, type: 'error' });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const handleLogout = () => {
    const updated = { ...form, githubUser: null, githubToken: '', githubRepo: '' };
    setForm(updated);
    onSave(updated);
  };

  const handleSaveAll = () => {
    onSave(form);
    setSyncStatus({ msg: "Profile and sync settings updated.", type: 'success' });
    setTimeout(() => setSyncStatus(null), 2000);
  };

  const renderedBio = useMemo(() => {
    if (!form.bio) return '<p class="opacity-30 italic">No biography provided yet...</p>';
    marked.setOptions({ gfm: true, breaks: true });
    const rawHtml = marked.parse(form.bio) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [form.bio]);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pb-10">
      <header className="mb-12">
        <h2 className="text-4xl font-serif italic mb-2">About Me</h2>
        <div className="h-1 w-20 bg-blue-600 mb-4"></div>
        <p className="text-sm opacity-50">Manage your identity and cloud persistence.</p>
      </header>

      <div className="space-y-10">
        {/* Personal Profile Section */}
        <section className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-current border-opacity-5">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <i className="fa-solid fa-user-pen opacity-50"></i>
                Personal Profile
              </h3>
              <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                <button 
                  onClick={() => setBioMode('edit')} 
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bioMode === 'edit' ? 'bg-white dark:bg-gray-800 shadow-sm opacity-100' : 'opacity-40'}`}
                >
                  Edit
                </button>
                <button 
                  onClick={() => setBioMode('preview')} 
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${bioMode === 'preview' ? 'bg-white dark:bg-gray-800 shadow-sm opacity-100' : 'opacity-40'}`}
                >
                  Preview
                </button>
              </div>
           </div>

           <div className="space-y-6">
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-2 font-black">
                  Biography (Supports Markdown)
                </span>
                
                {bioMode === 'edit' ? (
                  <textarea 
                    value={form.bio || ''}
                    onChange={(e) => setForm({...form, bio: e.target.value})}
                    placeholder="Share a bit about yourself, your passions, or your creative journey... You can use # for headers, - for lists, etc."
                    className="w-full bg-white dark:bg-black border border-current border-opacity-10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[220px] text-sm leading-relaxed resize-none font-mono"
                  />
                ) : (
                  <div className="w-full bg-white dark:bg-black border border-current border-opacity-10 rounded-2xl px-8 py-8 min-h-[220px]">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none opacity-90"
                      dangerouslySetInnerHTML={{ __html: renderedBio }}
                    />
                  </div>
                )}
              </label>
              
              <button 
                onClick={handleSaveAll}
                className="w-full bg-current text-current-contrast invert dark:invert-0 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-all"
              >
                Update Profile
              </button>
           </div>
        </section>

        {/* GitHub Integration Section */}
        <section className={`p-8 rounded-[2.5rem] border-2 transition-all ${form.githubUser ? 'border-blue-500 bg-blue-500/5' : 'border-current border-opacity-5 bg-black/5 dark:bg-white/5'}`}>
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-lg font-bold flex items-center gap-3">
              <i className="fa-brands fa-github text-2xl"></i> 
              Cloud Architecture
            </h3>
            {form.githubUser && (
              <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">
                Disconnect
              </button>
            )}
          </div>

          {!form.githubUser ? (
            <div className="space-y-6">
              <p className="text-sm opacity-60 leading-relaxed">
                Empower your blog with GitHub-backed persistence. By connecting your account, every reflection you publish will be automatically committed to a repository of your choice.
              </p>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-2 font-black">Personal Access Token</span>
                  <input 
                    type="password" 
                    value={form.githubToken}
                    onChange={(e) => setForm({...form, githubToken: e.target.value})}
                    placeholder="ghp_..."
                    className="w-full bg-white dark:bg-black border border-current border-opacity-10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <p className="mt-2 text-[10px] opacity-40">Require <code>repo</code> permissions to write files.</p>
                </label>
                <button 
                  onClick={handleGitHubLogin}
                  disabled={isSyncing || !form.githubToken}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-xl hover:shadow-blue-500/20 transition-all uppercase tracking-widest text-xs"
                >
                  {isSyncing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
                  Authorize GitHub
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-5 bg-white dark:bg-black p-5 rounded-[2rem] border border-blue-500/20">
                <img src={form.githubUser.avatar_url} className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-lg" alt="avatar" />
                <div>
                  <h4 className="text-xl font-bold">{form.githubUser.name || form.githubUser.login}</h4>
                  <p className="text-xs opacity-50">GitHub Identity: {form.githubUser.login}</p>
                </div>
              </div>

              <div className="space-y-6">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-2 font-black">Sync Repository (e.g., user/blog-data)</span>
                  <input 
                    type="text" 
                    value={form.githubRepo}
                    onChange={(e) => setForm({...form, githubRepo: e.target.value})}
                    placeholder="username/my-zen-blog"
                    className="w-full bg-white dark:bg-black border border-current border-opacity-10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </label>
                <button 
                  onClick={handleSaveAll}
                  className="w-full bg-current text-current-contrast invert dark:invert-0 py-4 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Save Sync Settings
                </button>
              </div>
            </div>
          )}
        </section>

        {syncStatus && (
          <div className={`p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all animate-fade-in ${
            syncStatus.type === 'error' ? 'bg-red-500/10 text-red-500' : 
            syncStatus.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
          }`}>
            {syncStatus.msg}
          </div>
        )}

        <section className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-current border-opacity-5">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
              <i className="fa-solid fa-info-circle opacity-50"></i>
              System Note
           </h3>
           <p className="text-sm opacity-60 leading-relaxed">
             This blog uses a hybrid storage model. Your data lives locally in your browser and optionally in your private GitHub repository. If you switch devices, simply reconnect your token and repository to recover your synced stories.
           </p>
        </section>
      </div>
    </div>
  );
};

export default AboutMeView;
