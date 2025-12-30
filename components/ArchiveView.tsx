
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { BlogPost } from '../types';
import { MONTH_NAMES } from '../constants';

interface ArchiveViewProps {
  posts: BlogPost[];
  onSync: (id: string) => Promise<void>;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ posts, onSync }) => {
  const archives = useMemo(() => {
    const groups: { [key: string]: BlogPost[] } = {};
    
    posts.forEach(post => {
      const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    });

    const yearsMap: { [year: number]: { month: number, posts: BlogPost[] }[] } = {};
    
    Object.keys(groups).forEach(key => {
      const [year, month] = key.split('-').map(Number);
      if (!yearsMap[year]) yearsMap[year] = [];
      yearsMap[year].push({ month, posts: groups[key] });
    });

    return Object.keys(yearsMap)
      .map(Number)
      .sort((a, b) => b - a)
      .map(year => ({
        year,
        months: yearsMap[year]
          .sort((a, b) => b.month - a.month)
          .map(m => ({
            month: MONTH_NAMES[m.month],
            posts: m.posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          }))
      }));
  }, [posts]);

  const getSyncStatus = (post: BlogPost) => {
    if (!post.lastSyncedAt) return 'unsynced';
    const lastUpdate = new Date(post.updatedAt).getTime();
    const lastSync = new Date(post.lastSyncedAt).getTime();
    return lastSync >= lastUpdate ? 'synced' : 'stale';
  };

  const getWordCount = (content: string) => {
    const cleanContent = content.trim();
    return cleanContent ? cleanContent.split(/\s+/).length : 0;
  };

  return (
    <div className="animate-fade-in max-w-4xl px-2">
      <header className="mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl font-serif italic mb-2 md:mb-4">Archives</h2>
        <div className="h-1 w-16 md:w-20 bg-blue-600 mb-2"></div>
        <p className="text-sm opacity-50">Timeline of your creative journey.</p>
      </header>

      <div className="space-y-12 md:space-y-16">
        {archives.map(yearGroup => (
          <section key={yearGroup.year} className="relative pl-6 md:pl-8 border-l-2 border-current border-opacity-10">
            <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-blue-600 border-4 border-gray-50 dark:border-gray-900"></div>
            <h3 className="text-4xl md:text-6xl font-black opacity-5 mb-6 md:mb-8 -ml-10 md:-ml-12 pointer-events-none select-none">{yearGroup.year}</h3>
            
            <div className="space-y-8 md:space-y-12">
              {yearGroup.months.map(monthGroup => (
                <div key={`${yearGroup.year}-${monthGroup.month}`}>
                  <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center flex-wrap gap-2">
                    {monthGroup.month} 
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 font-normal opacity-50 uppercase">
                      {monthGroup.posts.length} Posts
                    </span>
                  </h4>
                  <ul className="space-y-4">
                    {monthGroup.posts.map(post => {
                      const status = getSyncStatus(post);
                      const words = getWordCount(post.content);
                      return (
                        <li key={post.id} className="group flex items-center justify-between gap-4">
                          <div className="flex items-baseline space-x-3 md:space-x-4 flex-1">
                            <span className="text-[10px] md:text-xs font-mono opacity-30 tabular-nums">
                              {new Date(post.createdAt).getDate().toString().padStart(2, '0')}
                            </span>
                            <Link to={`/post/${post.id}`} className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-4 group">
                              <span className="text-sm md:text-base font-medium group-hover:text-blue-500 transition-colors line-clamp-1 leading-snug">
                                {post.title}
                              </span>
                              <span className="text-[9px] uppercase tracking-widest opacity-20 font-black whitespace-nowrap hidden sm:block">
                                {words} words
                              </span>
                            </Link>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="sm:hidden text-[8px] uppercase tracking-widest opacity-20 font-black whitespace-nowrap">
                              {words} w
                            </span>
                            {status === 'synced' ? (
                              <span className="flex items-center gap-1.5 text-[9px] uppercase font-black text-green-500 bg-green-500/10 px-2 py-1 rounded">
                                <i className="fa-brands fa-github"></i> Synced
                              </span>
                            ) : (
                              <button 
                                onClick={() => onSync(post.id)}
                                className="flex items-center gap-1.5 text-[9px] uppercase font-black text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500 px-2 py-1 rounded transition-all"
                                title={status === 'stale' ? 'Update on GitHub' : 'Save to GitHub'}
                              >
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                {status === 'stale' ? 'Update' : 'Sync'}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 opacity-30 italic text-sm">No memories recorded yet.</div>
        )}
      </div>
    </div>
  );
};

export default ArchiveView;
