import { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Maximize2, Minimize2, Trash2, Keyboard } from 'lucide-react';

export default function TerminalPane({
  lines = [],
  isCollapsed,
  onToggleCollapse,
  onClear,
  stdin = '',
  onStdinChange = () => {},
  isStdinCollapsed = true,
  onToggleStdin = () => {},
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new lines arrive
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="flex flex-col h-full bg-bg-primary border-t border-border-default">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-surface/50 border-b border-border-default/50 shrink-0">
        <div className="flex items-center gap-2 text-text-muted">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Console Output</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStdin}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded transition-colors"
            title={isStdinCollapsed ? 'Show Standard Input' : 'Hide Standard Input'}
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onClear}
            className="p-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 rounded transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded transition-colors"
            title={isCollapsed ? "Expand Terminal" : "Collapse Terminal"}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Standard Input (optional) */}
      {!isStdinCollapsed && (
        <div className="px-4 py-3 border-b border-border-default/30 bg-bg-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-text-muted">Standard Input (stdin)</div>
            <div className="text-xs text-text-muted">Send input when you click Run</div>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Type input that will be provided to the program on stdin..."
            className="w-full h-20 resize-none bg-[#06060a] text-text-primary placeholder:text-text-muted border border-border-default rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>
      )}

      {/* Terminal Content */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm custom-scrollbar bg-[#0a0a0c]">
        {lines && lines.length > 0 ? (
          <div className="whitespace-pre-wrap">
            {lines.map((entry, idx) => {
              const cls = entry.type === 'stderr'
                ? 'text-accent-red'
                : entry.type === 'system'
                ? 'text-text-muted'
                : 'text-accent-green';
              return (
                <div key={idx} className={cls}>
                  {entry.text}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-text-muted/50 italic">
            Run your code to see the output here...
          </div>
        )}
      </div>
    </div>
  );
}
