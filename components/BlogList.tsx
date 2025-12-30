
import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import BlogCard from './BlogCard';

interface BlogListProps {
  posts: BlogPost[];
  onDelete: (id: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ posts, onDelete }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center px-4">
        <i className="fa-solid fa-feather-pointed text-5xl mb-4"></i>
        <p className="text-lg md:text-xl">No thoughts found. Start writing today.</p>
        <Link to="/new" className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:scale-105 transition-transform active:scale-95">
          Create First Post
        </Link>
      </div>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-8 md:space-y-12 animate-fade-in">
      <header className="mb-8 md:mb-12">
        <h2 className="text-3xl md:text-4xl font-serif italic mb-2">The Feed</h2>
        <div className="h-1 w-16 md:w-20 bg-blue-600"></div>
      </header>
      
      <div className="grid grid-cols-1 gap-8 md:gap-12">
        {sortedPosts.map(post => (
          <BlogCard key={post.id} post={post} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default BlogList;
