
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { BlogPost, EditorDraft } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';

interface EditorProps {
  posts?: BlogPost[];
  onSave: (post: BlogPost, shouldSync?: boolean) => void;
  isGithubConnected?: boolean;
}

const Editor: React.FC<EditorProps> = ({ posts = [], onSave, isGithubConnected }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [aiInstruction, setAiInstruction] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const settings = useMemo(() => storageService.getSettings(), []);

  useEffect(() => {
    const existingDraft = storageService.getDraft();
    if (id) {
      const post = posts.find(p => p.id === id);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags.join(', '));
      }
    }
    if (existingDraft && (existingDraft.id === (id || null))) {
      setShowDraftRestore(true);
    }
  }, [id, posts]);

  useEffect(() => {
    if (!settings.autoSaveEnabled) return;
    const timer = setInterval(() => {
      if (title.trim() || content.trim()) {
        const draft: EditorDraft = {
          id: id || null,
          title,
          content,
          tags,
          timestamp: new Date().toISOString()
        };
        storageService.saveDraft(draft);
        setLastSaved(new Date());
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [title, content, tags, id, settings.autoSaveEnabled]);

  const restoreDraft = () => {
    const draft = storageService.getDraft();
    if (draft) {
      setTitle(draft.title);
      setContent(draft.content);
      setTags(draft.tags);
    }
    setShowDraftRestore(false);
  };

  const discardDraft = () => {
    storageService.clearDraft();
    setShowDraftRestore(false);
  };

  const wordCount = useMemo(() => {
    const cleanContent = content.trim();
    return cleanContent ? cleanContent.split(/\s+/).length : 0;
  }, [content]);

  const renderedHtml = useMemo(() => {
    marked.setOptions({ gfm: true, breaks: true });
    const rawHtml = marked.parse(content || '*Start writing to see preview...*') as string;
    return DOMPurify.sanitize(rawHtml);
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = textareaRef.current;
    if (!el) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const val = el.value;
      el.value = val.substring(0, start) + '    ' + val.substring(end);
      el.selectionStart = el.selectionEnd = start + 4;
      setContent(el.value);
    }

    if (e.key === 'Enter') {
      const start = el.selectionStart;
      const val = el.value;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLine = val.substring(lineStart, start);
      const listMatch = currentLine.match(/^(\s*[\-\*\+]\s+)/) || currentLine.match(/^(\s*\d+\.\s+)/);
      
      if (listMatch) {
        e.preventDefault();
        let nextBullet = listMatch[1];
        const numMatch = nextBullet.match(/^(\s*)(\d+)(\.\s+)/);
        if (numMatch) {
          nextBullet = `${numMatch[1]}${parseInt(numMatch[2]) + 1}${numMatch[3]}`;
        }
        if (currentLine.trim() === '-' || currentLine.trim() === '*' || currentLine.trim().match(/^\d+\.$/)) {
          el.value = val.substring(0, lineStart) + '\n' + val.substring(start);
          el.selectionStart = el.selectionEnd = lineStart + 1;
        } else {
          el.value = val.substring(0, start) + '\n' + nextBullet + val.substring(start);
          el.selectionStart = el.selectionEnd = start + 1 + nextBullet.length;
        }
        setContent(el.value);
      }
    }
  };

  const buildPost = (): BlogPost => {
    const existing = id ? posts.find(p => p.id === id) : null;
    return {
      id: id || Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDraft: false,
      version: (existing?.version || 0) + 1,
      lastSyncedAt: existing?.lastSyncedAt
    };
  };

  const handleLocalSave = () => {
    if (!title || !content) return alert("Title and content are required.");
    onSave(buildPost(), false);
    storageService.clearDraft();
    navigate('/');
  };

  const handleGitHubSave = async () => {
    if (!title || !content) return alert("Title and content are required.");
    setIsSavingCloud(true);
    try {
      await onSave(buildPost(), true);
      storageService.clearDraft();
      navigate('/');
    } catch (e) {
      alert("Failed to sync to GitHub. Check settings in 'About me'.");
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleAiSuggestTitle = async () => {
    if (!content) return;
    setIsAiLoading(true);
    setTitle(await geminiService.suggestTitle(content));
    setIsAiLoading(false);
  };

  const handleAiExpand = async () => {
    if (!content || !aiInstruction) return;
    setIsAiLoading(true);
    try {
      const expandedText = await geminiService.expandPost(content, aiInstruction);
      setContent(prev => prev + "\n\n" + expandedText);
    } catch (error) {
      console.error("Failed to expand post:", error);
    } finally {
      setAiInstruction('');
      setIsAiLoading(false);
    }
  };

  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="animate-fade-in max-w-full mx-auto flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] relative overflow-hidden">
      
      {showDraftRestore && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in flex-shrink-0">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
            <div>
              <p className="text-sm font-bold">Unsaved Draft Detected</p>
              <p className="text-[10px] opacity-60">Restore your last session?</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={discardDraft} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all">Discard</button>
            <button onClick={restoreDraft} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase shadow-lg shadow-blue-500/20 transition-all">Restore</button>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <h2 className="text-xl md:text-2xl font-serif italic">
            {viewMode === 'preview' ? 'Reflecting' : (id ? 'Editing' : 'Drafting')}
          </h2>
          <div className="flex items-center gap-3">
            {lastSaved && settings.autoSaveEnabled && (
              <span className="text-[9px] uppercase tracking-widest opacity-20 font-black flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                Auto-saved
              </span>
            )}
            <span className="text-[9px] uppercase tracking-widest opacity-40 font-black px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full">
              {wordCount} {wordCount === 1 ? 'Word' : 'Words'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            <button onClick={() => setViewMode('edit')} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'opacity-40'}`}>Write</button>
            <button onClick={() => setViewMode('split')} className={`hidden lg:block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'split' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'opacity-40'}`}>Split</button>
            <button onClick={() => setViewMode('preview')} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-gray-800 shadow-sm' : 'opacity-40'}`}>Preview</button>
          </div>
          
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl opacity-40 hover:opacity-100 transition-all font-bold text-xs uppercase tracking-widest">Cancel</button>
          
          <div className="flex gap-2 flex-1 md:flex-none">
            <button onClick={handleLocalSave} className="flex-1 md:flex-none px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl font-bold opacity-60 hover:opacity-100 transition-all text-xs uppercase tracking-widest border border-current border-opacity-10">Local Save</button>
            {isGithubConnected && (
              <button 
                onClick={handleGitHubSave} 
                disabled={isSavingCloud}
                className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isSavingCloud ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-brands fa-github"></i>}
                {isSavingCloud ? 'Syncing...' : 'GitHub Sync'}
              </button>
            )}
            {!isGithubConnected && (
               <button onClick={handleLocalSave} className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest">Publish</button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-8 min-h-0 relative">
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex flex-col gap-6 overflow-y-auto no-scrollbar pb-10 transition-all duration-500 ${
            viewMode === 'split' ? 'w-1/2' : 'w-full max-w-4xl mx-auto'
          }`}>
            <div className="relative group">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry Title..." className="w-full text-3xl md:text-5xl font-black bg-transparent border-none outline-none focus:ring-0 placeholder:opacity-10 transition-all pr-12 font-serif italic" />
              <button onClick={handleAiSuggestTitle} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-all shadow-md text-xs">
                <i className={`fa-solid fa-wand-magic-sparkles ${isAiLoading ? 'animate-spin' : ''}`}></i>
              </button>
            </div>

            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#hashtags" className="w-full text-xs font-bold uppercase tracking-[0.2em] bg-transparent border-none outline-none focus:ring-0 placeholder:opacity-20 opacity-40" />
            <div className="h-px w-full bg-current opacity-5"></div>

            <textarea 
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start your story..."
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-base md:text-lg leading-relaxed resize-none placeholder:opacity-10 font-mono"
            ></textarea>

            <div className="mt-auto p-4 md:p-6 bg-black/5 dark:bg-white/5 rounded-3xl border border-current border-opacity-5">
              <h4 className="flex items-center gap-2 font-black mb-4 text-[10px] uppercase tracking-[0.2em] opacity-30">
                <i className="fa-solid fa-sparkles text-indigo-500"></i> AI Co-Author
              </h4>
              <div className="flex gap-2">
                <input type="text" value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)} placeholder="How can I help you polish this?" className="flex-1 bg-white/50 dark:bg-black/50 rounded-xl px-4 py-2.5 text-sm border-none outline-none focus:ring-1 focus:ring-indigo-500" />
                <button onClick={handleAiExpand} disabled={isAiLoading || !aiInstruction} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10">
                  {isAiLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'split' && <div className="w-px bg-current opacity-5 h-full hidden lg:block"></div>}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`overflow-y-auto no-scrollbar pb-10 transition-all duration-500 ${viewMode === 'split' ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}>
            <div className="bg-black/[0.02] dark:bg-white/[0.02] p-8 md:p-12 rounded-[2.5rem] border border-current border-opacity-5">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {tagList.map(t => <span key={t} className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">#{t}</span>)}
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-tight mb-10 font-serif italic border-b border-current border-opacity-5 pb-8">{title || 'Untethered'}</h1>
              <div className="prose prose-lg dark:prose-invert max-w-none font-serif text-lg md:text-xl opacity-90" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
