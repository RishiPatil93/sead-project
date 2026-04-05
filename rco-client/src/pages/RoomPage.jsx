import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { motion as Motion } from 'framer-motion';
import { Terminal as TerminalIcon } from 'lucide-react';
import { useSocket } from '../context/SocketContext';


import WorkspaceHeader from '../components/workspace/WorkspaceHeader';
import SidebarTabs from '../components/workspace/SidebarTabs';
import CollaboratorsList from '../components/workspace/CollaboratorsList';
import TimelineUI from '../components/workspace/TimelineUI';
import CodeEditor from '../components/workspace/CodeEditor';
import TerminalPane from '../components/workspace/TerminalPane';
import SnippetLibrary from '../components/workspace/SnippetLibrary';

const DEFAULT_SNIPPETS = {
  javascript: '// Welcome to your real-time coding workspace!\n// Start typing to collaborate...\n\nfunction main() {\n  console.log("Hello RCO-IDE!");\n}\n\nmain();',
  python: '# Welcome to your real-time coding workspace!\n# Start typing to collaborate...\n\ndef main():\n    print("Hello RCO-IDE!")\n\nif __name__ == "__main__":\n    main()',
  java: '// Welcome to your real-time coding workspace!\n// Start typing to collaborate...\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello RCO-IDE!");\n    }\n}',
  c: '// Welcome to your real-time coding workspace!\n// Start typing to collaborate...\n\n#include <stdio.h>\n\nint main() {\n    printf("Hello RCO-IDE!\\n");\n    return 0;\n}',
  cpp: '// Welcome to your real-time coding workspace!\n// Start typing to collaborate...\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello RCO-IDE!" << std::endl;\n    return 0;\n}',
  typescript: '// Welcome to your real-time coding workspace!\n// Start typing to collaborate...\n\nfunction main(): void {\n  console.log("Hello RCO-IDE!");\n}\n\nmain();',
  go: '// Welcome to your real-time coding workspace!\n// Start typing to collaborate...\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello RCO-IDE!")\n}',
  rust: '// Welcome to your real-time coding workspace!\n// Start typing to collaborate...\n\nfn main() {\n    println!("Hello RCO-IDE!");\n}',
};

/* ── Drag handle ─────────────────────────────────────────── */
function ResizeHandle({ direction = 'horizontal' }) {
  const isH = direction === 'horizontal';
  return (
    <PanelResizeHandle
      className={[
        'group relative z-10 flex items-center justify-center',
        'transition-colors duration-150 outline-none',
        isH
          ? 'w-[3px] cursor-col-resize hover:bg-accent-blue/50 bg-border-default'
          : 'h-[3px] cursor-row-resize hover:bg-accent-blue/50 bg-border-default',
      ].join(' ')}
    >
      {/* Grip dots shown on hover */}
      <div
        className={[
          'opacity-0 group-hover:opacity-80 transition-opacity flex gap-[3px]',
          isH ? 'flex-col' : 'flex-row',
        ].join(' ')}
      >
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1 h-1 rounded-full bg-accent-blue" />
        ))}
      </div>
    </PanelResizeHandle>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('collaborators');
  const [collaborators, setCollaborators] = useState([]);
  const [editorLanguage, setEditorLanguage] = useState('javascript');
  const [roomData, setRoomData] = useState(null);
  const [code, setCode] = useState('');
  const [terminalLines, setTerminalLines] = useState([]);
  const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
  const [stdin, setStdin] = useState('');
  const [isStdinCollapsed, setIsStdinCollapsed] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [executionEnabled, setExecutionEnabled] = useState(true);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const fetchSnapshots = useCallback(async () => {
    try {
      const { data } = await api.get(`/rooms/${roomId}/snapshots`);
      if (data?.snapshots) setSnapshots(data.snapshots);
    } catch (err) {
      console.warn('Could not fetch snapshots', err);
    }
  }, [roomId]);

  // Socket setup
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('join-room', { roomId, user });

    const handleRoomUsers = (users) => {
      setCollaborators(users);
    };

    const handleSnapshotSaved = () => {
      fetchSnapshots();
    };

    socket.on('room-users', handleRoomUsers);
    socket.on('snapshot-saved', handleSnapshotSaved);

    return () => {
      socket.off('room-users', handleRoomUsers);
      socket.off('snapshot-saved', handleSnapshotSaved);
    };
  }, [socket, roomId, user, fetchSnapshots]);

  // Fetch Room Language
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const { data } = await api.get(`/rooms/${roomId}`);
        if (data?.room) {
          setRoomData(data.room);
          setEditorLanguage(data.room.language);
          
          const dbCode = data.room.currentCode || '';
          const isLegacyBlank = dbCode.includes('Welcome to RCO-IDE!') && dbCode.includes('Start typing');
          
          if (dbCode.trim().length > 0 && !isLegacyBlank) {
            setCode(dbCode);
          } else {
            setCode(DEFAULT_SNIPPETS[data.room.language] || DEFAULT_SNIPPETS.javascript);
          }
        }
      } catch (err) {
        console.warn('Could not fetch room context', err);
      }
    };
    fetchRoomDetails();
    fetchSnapshots();
  }, [roomId, fetchSnapshots]);

  // Check server capabilities (execution enabled)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/health');
        if (mounted && typeof data?.executionEnabled !== 'undefined') {
          setExecutionEnabled(Boolean(data.executionEnabled));
        }
      } catch {
        // ignore network errors here
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleBack          = () => navigate('/dashboard');
  const handleRunCode = async () => {
    if (isRunning) return;

    // Re-check server health at time of run to avoid stale executionEnabled state
    try {
      const { data: health } = await api.get('/health');
      if (typeof health?.executionEnabled !== 'undefined') {
        setExecutionEnabled(Boolean(health.executionEnabled));
      }
      if (!health?.executionEnabled) {
        toast.error('Code execution is disabled on the server.');
        setTerminalLines(prev => (prev || []).concat({ type: 'stderr', text: '[System] Code execution is disabled on the server (JDoodle credentials not configured).' }));
        return;
      }
    } catch {
      // If health check fails, fall back to last-known executionEnabled
      if (!executionEnabled) {
        toast.error('Code execution appears unavailable (network error).');
        setTerminalLines(prev => (prev || []).concat({ type: 'stderr', text: '[System] Unable to verify execution availability. Try again.' }));
        return;
      }
    }
    setIsRunning(true);

    // Append system message
    setTerminalLines(prev => (prev || []).concat({ type: 'system', text: '[System] Running code...' }));

    try {
      const payload = { language: editorLanguage, code };
      if (roomData?.languageVersion) payload.version = roomData.languageVersion;
      // Include standard input (stdin) when provided
      payload.stdin = typeof stdin === 'string' ? stdin : '';

      const { data } = await api.post('/execute', payload);

      // Prefer server-side extracted strings (`output` / `stderr`).
      // Fallback to older piston shape if needed.
      let stdout = '';
      let stderr = '';

      if (typeof data?.output === 'string') {
        stdout = data.output;
        stderr = typeof data.stderr === 'string' ? data.stderr : '';
      } else {
        const piston = data?.result || data;
        const run = piston?.run || piston;
        stdout = typeof run?.output === 'string' ? run.output : (typeof run?.stdout === 'string' ? run.stdout : '');
        stderr = typeof run?.stderr === 'string' ? run.stderr : '';
      }

      const newEntries = [];
      if (stdout && stdout.length) {
        newEntries.push(...String(stdout).split(/\r?\n/).map((l) => ({ type: 'stdout', text: l })));
      }
      if (stderr && stderr.length) {
        newEntries.push(...String(stderr).split(/\r?\n/).map((l) => ({ type: 'stderr', text: l })));
      }

      if (newEntries.length > 0) {
        setTerminalLines(prev => (prev || []).concat(newEntries));
      } else {
        setTerminalLines(prev => (prev || []).concat({ type: 'system', text: '[System] Execution completed (no output).' }));
      }
    } catch (err) {
      console.error('Execution failed', err);

      const resp = err?.response?.data;
      if (resp) {
        if (typeof resp.output === 'string' && resp.output.length) {
          const outLines = String(resp.output).split(/\r?\n/).map(l => ({ type: 'stdout', text: l }));
          setTerminalLines(prev => (prev || []).concat(outLines));
        }
        if (typeof resp.stderr === 'string' && resp.stderr.length) {
          const errLines = String(resp.stderr).split(/\r?\n/).map(l => ({ type: 'stderr', text: l }));
          setTerminalLines(prev => (prev || []).concat(errLines));
        }

        const errorMsg = resp.message || resp.error || resp.errorFromJDoodle?.error || null;
        if (errorMsg && typeof errorMsg === 'string') {
          setTerminalLines(prev => (prev || []).concat({ type: 'stderr', text: errorMsg }));
        } else if (!resp.output && !resp.stderr) {
          setTerminalLines(prev => (prev || []).concat({ type: 'stderr', text: 'Execution failed. Check server logs for details.' }));
        }

        return;
      }

      const errText = err.message || String(err);
      setTerminalLines(prev => (prev || []).concat({ type: 'stderr', text: errText }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearTerminal = () => setTerminalLines([]);
  const handleToggleTerminal = () => setIsTerminalCollapsed(p => !p);

  const handleSaveSnapshot = async () => {
    try {
      const { data } = await api.post(`/rooms/${roomId}/snapshots`, {
        code,
        title: 'Manual Snapshot',
      });
      if (data?.snapshot) {
        setSnapshots((prev) => [data.snapshot, ...prev]);
        socket.emit('snapshot-saved', { roomId });
      }
    } catch (err) {
      console.error('Failed to save snapshot', err);
    }
  };

  const handleRestore = (snap) => {
    if (!snap.code && snap.code !== '') return;
    setCode(snap.code);
    socket.emit('code-change', { roomId, code: snap.code });
  };

  const handleDeleteSnapshot = async (snap) => {
    try {
      await api.delete(`/rooms/${roomId}/snapshots/${snap._id}`);
      setSnapshots(prev => prev.filter(s => s._id !== snap._id));
      toast.success('Snapshot deleted');
    } catch (err) {
      console.error('Failed to delete snapshot', err);
      toast.error('Failed to delete snapshot');
    }
  };

  const handleSaveToLibrary = async () => {
    if (!code.trim()) {
      toast.error('Nothing to save - code is empty');
      return;
    }
    try {
      const { data } = await api.post('/snippets', {
        title: roomData?.name || 'Untitled Snippet',
        language: editorLanguage,
        code,
      });
      if (data.success) {
        toast.success('Saved to your library!');
      }
    } catch (err) {
      console.error('Failed to save to library', err);
      toast.error('Failed to save snippet');
    }
  };

  const handleLoadFromLibrary = (snippetCode, snippetLanguage) => {
    setCode(snippetCode);
    if (snippetLanguage) setEditorLanguage(snippetLanguage);
    socket.emit('code-change', { roomId, code: snippetCode });
  };

  const canRestore = user?.role === 'instructor' || 
                     user?._id === roomData?.createdBy?._id || 
                     user?._id === roomData?.createdBy;

  const canDelete = canRestore;

  return (
    /* Full‑viewport wrapper: column flex so header + workspace stack */
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-bg-primary">

      {/* ── Header (fixed 56px) ─────────────────────────── */}
      <div className="h-14 shrink-0">
        <WorkspaceHeader
          roomId={roomId}
          roomName={roomData?.name || 'Collaborative Workspace'}
          language={editorLanguage}
          onBack={handleBack}
          onRun={handleRunCode}
          onSaveSnapshot={handleSaveToLibrary}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          isRunning={isRunning}
          executionEnabled={executionEnabled}
        />
      </div>

      {/* ── Workspace (fills remainder) ─────────────────── */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full w-full">

          {/* ── Sidebar 20% ─────────────────────────────── */}
          <Panel defaultSize={20} minSize={15} maxSize={30}
                 className="flex flex-col bg-bg-surface border-r border-border-default overflow-hidden">

            {/* Tab bar */}
            <div className="h-12 shrink-0 border-b border-border-default/50">
              <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Scrollable tab content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
              <Motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0"
              >
                {activeTab === 'collaborators' && <CollaboratorsList collaborators={collaborators} />}
                {activeTab === 'snapshots'     && <TimelineUI snapshots={snapshots} onSaveSnapshot={handleSaveSnapshot} onRestore={handleRestore} onDelete={handleDeleteSnapshot} canRestore={canRestore} canDelete={canDelete} />}
              </Motion.div>
            </div>
          </Panel>

          {/* ── Drag handle (horizontal) ─────────────────── */}
          <ResizeHandle direction="horizontal" />

          {/* ── Main area 80% ───────────────────────────── */}
          <Panel defaultSize={80} className="flex flex-col overflow-hidden">
            <PanelGroup direction="vertical" className="h-full w-full">

              {/* ── Code editor 75% ───────────────────────── */}
              <Panel defaultSize={75} minSize={30}
                     className="overflow-hidden bg-[#0f1115]">
                <CodeEditor 
                   language={editorLanguage} 
                   value={code} 
                   onChange={setCode} 
                   socket={socket}
                   roomId={roomId}
                   user={user}
                />
              </Panel>

              {/* ── Drag handle (vertical), hidden when terminal collapsed */}
              {!isTerminalCollapsed && <ResizeHandle direction="vertical" />}

              {/* ── Terminal 25% ──────────────────────────── */}
              {!isTerminalCollapsed ? (
                <Panel defaultSize={25} minSize={10} maxSize={50}
                       collapsible
                       onCollapse={() => setIsTerminalCollapsed(true)}
                       className="flex flex-col overflow-hidden">
                  <TerminalPane
                    lines={terminalLines}
                    isCollapsed={false}
                    onToggleCollapse={handleToggleTerminal}
                    onClear={handleClearTerminal}
                    stdin={stdin}
                    onStdinChange={setStdin}
                    isStdinCollapsed={isStdinCollapsed}
                    onToggleStdin={() => setIsStdinCollapsed(s => !s)}
                  />
                </Panel>
              ) : (
                /* ── Collapsed bar ─────────────────────────── */
                <button
                  onClick={handleToggleTerminal}
                  className="h-9 shrink-0 flex items-center gap-2 px-4
                             bg-bg-surface border-t border-border-default
                             text-text-muted text-xs font-semibold uppercase tracking-wider
                             hover:bg-bg-elevated hover:text-text-primary transition-colors w-full text-left"
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  Terminal — click to expand
                </button>
              )}

            </PanelGroup>
          </Panel>

        </PanelGroup>
      </div>

      <SnippetLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onLoadSnippet={handleLoadFromLibrary}
        currentCode={code}
      />
    </div>
  );
}
