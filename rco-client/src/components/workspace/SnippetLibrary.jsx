import { useState, useEffect } from 'react';
import { X, BookOpen, Trash2, Clock, Code, Copy, Check } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
};

export default function SnippetLibrary({ isOpen, onClose, onLoadSnippet, currentCode }) {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSnippets();
    }
  }, [isOpen]);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/snippets');
      if (data.success) {
        setSnippets(data.snippets);
      }
    } catch (err) {
      console.error('Failed to fetch snippets', err);
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (snippetId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this snippet?')) return;

    try {
      await api.delete(`/snippets/${snippetId}`);
      setSnippets(prev => prev.filter(s => s._id !== snippetId));
      toast.success('Snippet deleted');
    } catch (err) {
      console.error('Failed to delete snippet', err);
      toast.error('Failed to delete snippet');
    }
  };

  const handleCopy = async (code, snippetId, e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopiedId(snippetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLoad = (snippet) => {
    onLoadSnippet(snippet.code, snippet.language);
    toast.success(`Loaded: ${snippet.title}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <Motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[80vh] bg-bg-surface border border-border-default rounded-xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-bg-elevated/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-blue/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Snippet Library</h2>
              <p className="text-xs text-text-muted">{snippets.length} saved snippets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full" />
            </div>
          ) : snippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <BookOpen className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No saved snippets yet</p>
              <p className="text-xs mt-1">Save code from the workspace to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {snippets.map((snippet) => (
                <Motion.div
                  key={snippet._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-bg-primary border border-border-default hover:border-accent-blue/50 rounded-lg p-4 cursor-pointer transition-all"
                  onClick={() => handleLoad(snippet)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {snippet.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                        <span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded font-medium">
                          {LANGUAGE_LABELS[snippet.language] || snippet.language}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-text-muted font-mono bg-bg-elevated rounded px-2 py-1.5 line-clamp-2">
                        {snippet.code.slice(0, 150)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleCopy(snippet.code, snippet._id, e)}
                        className="p-1.5 text-text-muted hover:text-accent-blue hover:bg-bg-elevated rounded transition-colors"
                        title="Copy code"
                      >
                        {copiedId === snippet._id ? (
                          <Check className="w-4 h-4 text-accent-green" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(snippet._id, e)}
                        className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded transition-colors"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Motion.div>
              ))}
            </div>
          )}
        </div>
      </Motion.div>
    </div>
  );
}
