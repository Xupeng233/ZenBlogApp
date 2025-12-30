
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { BlogPost } from '../types';

interface PostDetailProps {
  posts: BlogPost[];
}

interface Heading {
  text: string;
  level: number;
  id: string;
}

const PostDetail: React.FC<PostDetailProps> = ({ posts }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-2xl font-bold mb-4 font-serif italic">Post not found.</h2>
        <Link to="/" className="text-blue-500 underline font-bold uppercase tracking-widest text-xs">Back to home</Link>
      </div>
    );
  }

  // Helper to generate a slug for IDs
  const slugify = (text: string) => 
    text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  // Parse content for headings (h2 and h3) using memoization
  const headings = useMemo(() => {
    const list: Heading[] = [];
    const lines = post.content.split('\n');
    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);
      
      if (h2Match) {
        const text = h2Match[1].trim();
        list.push({ text, level: 2, id: slugify(text) });
      } else if (h3Match) {
        const text = h3Match[1].trim();
        list.push({ text, level: 3, id: slugify(text) });
      }
    });
    return list;
  }, [post.content]);

  // Use marked for high-fidelity rendering
  const renderedHtml = useMemo(() => {
    // Configure marked to handle GFM (GitHub Flavored Markdown)
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
    const rawHtml = marked.parse(post.content) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [post.content]);

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-8 md:mb-12 opacity-50 hover:opacity-100 flex items-center gap-2 text-xs uppercase tracking-widest font-bold border border-current border-opacity-10 px-3 py-1.5 rounded-lg transition-all">
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      <article>
        <header className="mb-8 md:mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-6">
            {post.tags.map(t => (
              <span key={t} className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                #{t}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6 md:mb-8 font-serif italic">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 md:gap-4 py-4 md:py-6 border-y border-current border-opacity-5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {post.title.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] md:text-sm font-bold opacity-80 uppercase tracking-widest">Published {date}</p>
              <p className="text-[9px] md:text-xs opacity-40 uppercase tracking-widest">Revision v{post.version}</p>
            </div>
          </div>
        </header>

        {/* Table of Contents */}
        {headings.length > 0 && (
          <nav className="mb-12 p-6 md:p-8 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-current border-opacity-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-5 flex items-center gap-2">
              <i className="fa-solid fa-list-ul"></i> Table of Contents
            </h4>
            <ul className="space-y-3">
              {headings.map((h, i) => (
                <li 
                  key={i} 
                  style={{ paddingLeft: h.level === 3 ? '1.5rem' : '0' }}
                  className="transition-all"
                >
                  <a 
                    href={`#${h.id}`} 
                    className="text-sm md:text-base opacity-60 hover:opacity-100 hover:text-blue-500 flex items-baseline gap-3 group"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <span className="text-[8px] font-mono opacity-20 group-hover:opacity-100 group-hover:text-blue-500 transition-all">{h.level === 2 ? '●' : '○'}</span>
                    <span className="group-hover:translate-x-1 transition-transform">{h.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {/* Render Content using standard prose styles */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none leading-relaxed font-serif text-lg md:text-xl opacity-90"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />

        <footer className="mt-16 md:mt-24 pt-12 border-t border-current border-opacity-10 flex flex-col items-center">
           <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20 mb-8 md:mb-12"></div>
           <h4 className="text-[10px] font-bold opacity-30 mb-8 md:mb-10 uppercase tracking-[0.4em]">Finis</h4>
           <div className="flex gap-4 w-full md:w-auto">
              <Link to={`/edit/${post.id}`} className="flex-1 md:flex-none text-center px-10 py-4 bg-black/5 dark:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 hover:text-white active:scale-95 transition-all shadow-sm">
                Edit Reflection
              </Link>
           </div>
        </footer>
      </article>
    </div>
  );
};

export default PostDetail;
