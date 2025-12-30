
import React, { useState } from 'react';
import { BlogSettings, ThemeType } from '../types';
import { THEMES } from '../constants';

interface SettingsViewProps {
  settings: BlogSettings;
  onSave: (settings: BlogSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [form, setForm] = useState<BlogSettings>(settings);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const updateTheme = (themeId: ThemeType) => {
    const updated = { ...form, currentTheme: themeId };
    setForm(updated);
    onSave(updated);
  };

  const handleSaveAll = () => {
    onSave(form);
    setSaveMessage("Settings saved successfully.");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto pb-10">
      <header className="mb-12">
        <h2 className="text-4xl font-serif italic mb-2">Settings</h2>
        <div className="h-1 w-20 bg-blue-600 mb-4"></div>
        <p className="text-sm opacity-50">Customize your site's look and feel.</p>
      </header>

      <div className="space-y-12">
        {/* Site Identity */}
        <section className="space-y-8">
          <h3 className="text-lg font-bold flex items-center gap-3">
            <i className="fa-solid fa-id-card opacity-50"></i> Site Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-2 font-black">Blog Site Name</span>
              <input 
                type="text" 
                value={form.siteName}
                onChange={(e) => setForm({...form, siteName: e.target.value})}
                className="w-full bg-black/5 dark:bg-white/5 border border-current border-opacity-5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-2 font-black">Display Author Name</span>
              <input 
                type="text" 
                value={form.userName}
                onChange={(e) => setForm({...form, userName: e.target.value})}
                className="w-full bg-black/5 dark:bg-white/5 border border-current border-opacity-5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] uppercase tracking-widest opacity-50 block mb-2 font-black">Global Tagline</span>
            <input 
              type="text" 
              value={form.tagline}
              onChange={(e) => setForm({...form, tagline: e.target.value})}
              className="w-full bg-black/5 dark:bg-white/5 border border-current border-opacity-5 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </label>
        </section>

        {/* Visual Skin */}
        <section>
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
            <i className="fa-solid fa-palette opacity-50"></i> Visual Skin
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => updateTheme(theme.id)}
                className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-3 ${
                  form.currentTheme === theme.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-transparent bg-black/5 dark:bg-white/5 hover:border-current hover:border-opacity-10'
                }`}
              >
                <div className={`w-full h-10 rounded-xl mb-1 border border-current border-opacity-10 ${theme.class.split(' ')[0]}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{theme.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Auto-save toggle */}
        <section className="p-6 bg-black/5 dark:bg-white/5 rounded-[2rem] flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm">Real-time Auto-save</h4>
            <p className="text-[10px] opacity-50 uppercase tracking-widest">Saves draft every 5 seconds</p>
          </div>
          <button 
            onClick={() => setForm({...form, autoSaveEnabled: !form.autoSaveEnabled})}
            className={`w-12 h-6 rounded-full transition-all relative ${form.autoSaveEnabled ? 'bg-blue-600' : 'bg-gray-400'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.autoSaveEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </section>

        {saveMessage && (
          <div className="p-4 bg-green-500/10 text-green-500 rounded-2xl text-center text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            {saveMessage}
          </div>
        )}

        <div className="pt-6 border-t border-current border-opacity-10">
          <button 
            onClick={handleSaveAll}
            className="w-full bg-current text-current-contrast invert dark:invert-0 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all"
          >
            Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
