import { motion as Motion } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function CollaboratorsList({ collaborators = [] }) {
  const { user: me } = useSelector(state => state.auth);

  return (
    <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Online — {collaborators.length}
        </h3>
      </div>
      
      <div className="space-y-2">
        {collaborators.map((user, i) => {
          const isMe = me?.id === user.id;
          // default color if none provided
          const userColor = user.color || 'bg-accent-blue';
          
          return (
          <Motion.div
            key={user.socketId || user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bg-elevated transition-colors group cursor-pointer border border-transparent hover:border-border-default/50"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-bg-surface ${userColor.startsWith('bg-') ? userColor : ''}`} style={{ backgroundColor: userColor.startsWith('#') ? userColor : undefined, ...(userColor.startsWith('bg-') ? {} : { color: '#fff' }) }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-green rounded-full border-2 border-bg-primary shadow-sm" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-primary leading-tight">
                  {user.username} {isMe && <span className="text-text-muted font-normal text-xs ml-1">(You)</span>}
                </span>
                <span className="text-xs text-text-muted capitalize">
                  {user.role || 'student'}
                </span>
              </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
               <div className={`w-2 h-2 rounded-full opacity-50 ${userColor.startsWith('bg-') ? userColor : ''}`} style={{ backgroundColor: userColor.startsWith('#') ? userColor : undefined }} />
            </div>
          </Motion.div>
        )})}
      </div>
      
      {/* Invite Hint */}
      <div className="mt-6 p-4 rounded-xl border border-dashed border-border-muted bg-bg-surface/30 text-center">
        <p className="text-xs text-text-muted leading-relaxed">
          Share the Room ID to invite more collaborators instantly.
        </p>
      </div>
    </div>
  );
}
