
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitHubUser } from '../types';

interface SidebarProps {
  postsCount: number;
  onSearch: (query: string) => void;
  searchQuery: string;
  userName: string;
  siteName: string;
  tagline: string;
  githubUser: GitHubUser | null;
}

const Sidebar: React.FC<SidebarProps> = ({ postsCount, onSearch, searchQuery, userName, siteName, tagline, githubUser }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Feed', icon: 'fa-rss' },
    { path: '/archive', label: 'Archives', icon: 'fa-box-archive' },
    { path: '/new', label: 'Write', icon: 'fa-pen-nib' },
    { path: '/about', label: 'About me', icon: 'fa-user-astronaut' },
    { path: '/settings', label: 'Settings', icon: 'fa-gear' },
  ];

  return (
    <aside className="w-64 border-r border-gray-200/20 sticky top-0 h-screen flex flex-col p-6 hidden lg:flex">
      <div className="mb-10">
        <Link to="/" className="block">
          <h1 className="text-2xl font-serif italic mb-1">{siteName}</h1>
          <p className="text-sm opacity-60 leading-tight">{tagline}</p>
        </Link>
      </div>

      <div className="relative mb-8">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-sm"></i>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search thoughts..." 
          className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
        />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-200/10">
        <Link to="/about" className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
          {githubUser ? (
            <img src={githubUser.avatar_url} className="w-10 h-10 rounded-full border-2 border-blue-500" alt="GitHub Profile" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {userName.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{githubUser?.name || userName}</p>
            <p className="text-[10px] opacity-50 uppercase tracking-widest font-black">{postsCount} Stories</p>
          </div>
        </Link>
        
        {githubUser && (
          <div className="bg-blue-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <i className="fa-brands fa-github text-blue-500 text-xs"></i>
            <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Cloud Sync Active</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
