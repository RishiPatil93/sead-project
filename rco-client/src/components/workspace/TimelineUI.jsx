import { Camera, Clock, RotateCcw, GitCommit, Trash2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function TimelineUI({ snapshots = [], onSaveSnapshot, onRestore, onDelete, canRestore = false, canDelete = false }) {
  return (
    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          History — {snapshots.length} Saves
        </h3>
        <button 
          onClick={onSaveSnapshot}
          className="text-xs text-accent-purple hover:text-accent-purple/80 font-medium transition-colors"
        >
          Save Now
        </button>
      </div>

      <div className="relative isolate">
        {/* The Vertical Line */}
        <div className="absolute left-[15px] top-2 bottom-6 w-px bg-border-muted -z-10" />

        <div className="space-y-6">
          {snapshots.map((snap, i) => (
            <Motion.div
                key={snap._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-4 group"
              >
              {/* Timeline Node */}
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-bg-primary border border-border-default shadow-sm shrink-0 group-hover:border-accent-purple/50 transition-colors z-10 mt-0.5">
                <Camera className="w-3.5 h-3.5 text-accent-purple" />
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-accent-purple/0 group-hover:bg-accent-purple/10 scale-150 transition-all duration-300 opacity-0 group-hover:opacity-100 blur-md -z-10" />
              </div>

              {/* Node Content */}
              <div className="flex-1 min-w-0 bg-bg-surface/40 hover:bg-bg-elevated border border-transparent hover:border-border-default rounded-xl p-3 transition-all duration-200">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-text-primary truncate">
                    {snap.title || 'Manual Snapshot'}
                  </h4>
                  
                  {/* Restore Button (Revealed on Hover) */}
                  {canRestore && (
                    <Motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRestore(snap)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-accent-purple/10 text-accent-purple px-2 py-1 rounded transition-all duration-200 hover:bg-accent-purple hover:text-white shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </Motion.button>
                  )}
                  {/* Delete Button (Revealed on Hover) */}
                  {canDelete && (
                    <Motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this snapshot?')) {
                          onDelete(snap);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-accent-red/30 text-accent-red px-2 py-1 rounded transition-all duration-200 hover:bg-accent-red hover:text-white hover:border-accent-red shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Motion.button>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{snap.createdAt ? formatDistanceToNow(new Date(snap.createdAt), { addSuffix: true }) : 'Just now'}</span>
                  </div>
                  <span className="opacity-50">•</span>
                  <span className="truncate">{snap.savedBy?.username || 'Unknown'}</span>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex justify-center pb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-border-muted" />
      </div>
    </div>
  );
}
