import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useRef, useCallback } from 'react';

// Sanitize user input to prevent XSS when rendering remote cursor labels
const sanitizeForHTML = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export default function CodeEditor({ language = 'javascript', value, onChange, socket, roomId, user }) {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  const isExternalChange = useRef(false);
  const codeValueRef = useRef(value);

  const remoteCursors = useRef({});
  const decorationCollectionRef = useRef(null);

  // Keep ref up to date for socket closures
  useEffect(() => {
    codeValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('rco-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#0f1115',
          'editor.lineHighlightBackground': '#ffffff0a',
          'editorLineNumber.foreground': '#4f5569',
          'editorIndentGuide.background': '#2a2d3d',
        },
      });
      monaco.editor.setTheme('rco-dark');
    }
  }, [monaco]);

  const updateRemoteCursors = useCallback(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    let cssRules = '';
    const newDecorations = [];
    
    Object.values(remoteCursors.current).forEach(c => {
      // Avoid rendering our own cursor sent back
      if (c.userId === user?.id) return;

      const uniqueClass = `cursor-${c.userId}`;
      const color = c.color?.startsWith('#') ? c.color : '#3b82f6';
      
      cssRules += `
        .${uniqueClass} {
           border-left: 2px solid ${color} !important;
           position: relative;
           z-index: 10;
        }
        .${uniqueClass}::before {
           content: '${sanitizeForHTML(c.username)}';
           position: absolute;
           top: -16px;
           left: 0px;
           background: ${color};
           color: white;
           font-size: 10px;
           padding: 0 4px;
           border-radius: 4px;
           border-bottom-left-radius: 0;
           pointer-events: none;
           white-space: nowrap;
           opacity: 1;
           animation: cursorFade 4s forwards;
        }
      `;
      
      newDecorations.push({
         range: new monacoRef.current.Range(c.line, c.column, c.line, c.column),
         options: {
           className: uniqueClass,
           stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
         }
      });
    });

    if (!cssRules.includes('@keyframes cursorFade')) {
       cssRules += `
         @keyframes cursorFade {
            0% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
         }
       `;
    }
    
    let styleEl = document.getElementById('remote-cursor-styles');
    if (!styleEl) {
       styleEl = document.createElement('style');
       styleEl.id = 'remote-cursor-styles';
       document.head.appendChild(styleEl);
    }
    // Re-rendering innerHTML resets the fade animation beautifully!
    styleEl.innerHTML = cssRules;
    
     if (decorationCollectionRef.current) {
       decorationCollectionRef.current.set(newDecorations);
     } else {
       decorationCollectionRef.current = editorRef.current.createDecorationsCollection(newDecorations);
     }
    }, [user]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleCodeChange = (newCode) => {
      isExternalChange.current = true;
      onChange(newCode);
    };

    const handleCursorChange = (cursorData) => {
      remoteCursors.current[cursorData.userId] = cursorData;
      updateRemoteCursors();
    };

    const handleRequestFirstSync = ({ targetSocketId }) => {
      // The oldest user sends back the full code state to the new user
      socket.emit('first-sync-response', { targetSocketId, code: codeValueRef.current });
    };

    const handleRoomUsers = (users) => {
       const activeIds = users.map(u => u.id);
       let changed = false;
       Object.keys(remoteCursors.current).forEach(id => {
          if (!activeIds.includes(id)) {
             delete remoteCursors.current[id];
             changed = true;
          }
       });
       if (changed) updateRemoteCursors();
    };

    socket.on('code-change', handleCodeChange);
    socket.on('cursor-change', handleCursorChange);
    socket.on('request-first-sync', handleRequestFirstSync);
    socket.on('room-users', handleRoomUsers);

    return () => {
      socket.off('code-change', handleCodeChange);
      socket.off('cursor-change', handleCursorChange);
      socket.off('request-first-sync', handleRequestFirstSync);
      socket.off('room-users', handleRoomUsers);
    };
  }, [socket, roomId, onChange, updateRemoteCursors]);

  const handleEditorChange = (newVal) => {
    // Only broadcast if the user actually typed this (not an incoming socket sync)
    if (!isExternalChange.current && socket && roomId) {
      socket.emit('code-change', { roomId, code: newVal });
    }
    onChange(newVal);
    isExternalChange.current = false;
  };

  const handleEditorDidMount = (editor, m) => {
    editorRef.current = editor;
    monacoRef.current = m;
    
    editor.onDidChangeCursorPosition((e) => {
      if (!socket || !user || !roomId) return;
      socket.emit('cursor-change', {
        roomId,
        userId: user.id,
        username: user.username,
        color: user.color,
        line: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  return (
    <div className="w-full h-full bg-[#0f1115]">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={handleEditorChange}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          formatOnPaste: true,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        loading={
          <div className="w-full h-full flex items-center justify-center text-text-muted text-sm font-mono">
             Initializing Workspace...
          </div>
        }
      />
    </div>
  );
}
