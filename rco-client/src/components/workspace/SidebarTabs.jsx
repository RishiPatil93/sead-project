import { Users, History } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

export default function SidebarTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'collaborators', label: 'Collaborators', icon: Users },
    { id: 'snapshots', label: 'Snapshots', icon: History },
  ];

  return (
    <div className="flex flex-col h-full bg-bg-primary border-r border-border-default">
      <div className="flex items-center p-2 gap-1 border-b border-border-default/50 bg-bg-surface/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-colors duration-200 z-10
                ${isActive ? 'text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated/50'}
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-blue' : ''}`} />
              {tab.label}
              
              {/* Active Tab Background Pill */}
              {isActive && (
                <Motion.div
                  layoutId="active-tab-pill"
                  className="absolute inset-0 bg-bg-elevated border border-border-default rounded-lg -z-10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
