import { ArrowLeft, Play, Camera, Code2, Copy, Check, BookOpen } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

export default function WorkspaceHeader({ roomId, roomName, language, onBack, onRun, onSaveSnapshot, onOpenLibrary, isRunning, executionEnabled = true }) {
  const [copiedId, setCopiedId] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <header className="h-14 bg-bg-surface/80 backdrop-blur-md border-b border-border-default flex items-center justify-between px-4 flex-shrink-0 z-10 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="btn-ghost px-2.5 py-1.5 text-text-muted hover:text-text-primary"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-semibold">Back</span>
        </button>

        <div className="h-6 w-px bg-border-muted hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent-blue/10 rounded flex items-center justify-center">
            <Code2 className="w-4 h-4 text-accent-blue" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary leading-tight">
              {roomName || 'Collaboration Room'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>{language || 'javascript'}</span>
              <span className="opacity-50">•</span>
              <button 
                onClick={handleCopyId}
                className="hover:text-accent-blue transition-colors flex items-center gap-1 group"
                title="Copy Room ID"
              >
                <span className="font-mono uppercase">{roomId}</span>
                {copiedId ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => { dispatch(logout()); navigate('/login'); }}
          className="btn-ghost text-xs text-text-muted hover:text-accent-orange"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenLibrary}
          className="btn-secondary py-1.5 px-3 border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 hover:border-accent-blue/50 bg-bg-elevated text-xs font-semibold"
          title="Open Snippet Library"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Library</span>
        </Motion.button>
        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSaveSnapshot}
          className="btn-secondary py-1.5 px-3 border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10 hover:border-accent-purple/50 bg-bg-elevated text-xs font-semibold"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Snapshot</span>
        </Motion.button>
        
        <Motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRun}
          disabled={isRunning || !executionEnabled}
          title={!executionEnabled ? 'Code execution is disabled on the server' : undefined}
          className={"btn-primary py-1.5 px-4 bg-accent-green text-bg-surface border-none text-xs font-semibold " + (isRunning || !executionEnabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent-green/90')}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? 'Running...' : (!executionEnabled ? 'Execution Disabled' : 'Run')}</span>
        </Motion.button>
      </div>
    </header>
  );
}
