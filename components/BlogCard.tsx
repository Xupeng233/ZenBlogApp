
import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
  onDelete: (id: string) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onDelete }) => {
  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this memory?')) {
      onDelete(post.id);
    }
  };

  return (
    <article className="group relative">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest opacity-60 mb-2 md:mb-3">
            <span className="font-bold">{date}</span>
            <span className="hidden md:inline">•</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map(t => (
                <span key={t} className="text-blue-500 font-bold">#{t}</span>
              ))}
              {post.tags.length > 3 && <span>...</span>}
            </div>
          </div>
          
          <Link to={`/post/${post.id}`} className="block">
            <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors leading-tight">
              {post.title}
            </h3>
            <p className="text-sm md:text-base opacity-70 line-clamp-2 md:line-clamp-3 mb-4 md:mb-6 leading-relaxed">
              {post.content.replace(/[#*`]/g, '')}
            </p>
          </Link>

          <div className="flex items-center space-x-4 md:space-x-6">
            <Link to={`/edit/${post.id}`} className="text-xs md:text-sm font-bold opacity-60 hover:opacity-100 hover:text-blue-500 transition-all flex items-center gap-2 py-1 px-2 md:p-0 border border-current border-opacity-10 md:border-none rounded">
              <i className="fa-solid fa-pen-to-square"></i> Edit
            </Link>
            <button 
              onClick={handleDelete}
              className="text-xs md:text-sm font-bold opacity-60 hover:opacity-100 hover:text-red-500 transition-all flex items-center gap-2 py-1 px-2 md:p-0 border border-current border-opacity-10 md:border-none rounded"
            >
              <i className="fa-solid fa-trash-can"></i> Delete
            </button>
          </div>
        </div>
        
        <div className="hidden sm:flex w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-black/5 dark:bg-white/5 flex-shrink-0 items-center justify-center group-hover:scale-105 transition-transform order-first md:order-last">
           <i className="fa-solid fa-newspaper text-2xl md:text-3xl opacity-20"></i>
        </div>
      </div>
      <div className="mt-8 md:mt-12 h-px w-full bg-current opacity-5"></div>
    </article>
  );
};

export default BlogCard;
