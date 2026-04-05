import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Plus, LogIn, Code2, Clock, ChevronRight,
  Users, Layers, Terminal, Globe, Copy, Check, Hash,
  Sparkles, BookOpen, Zap, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { selectCurrentUser } from '../store/authSlice';
import Navbar from '../components/Navbar';
import RoleTag from '../components/RoleTag';
import LoadingSpinner from '../components/LoadingSpinner';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'c', label: 'C', icon: '🔧' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
];

const STAT_CARDS = [
  { icon: Code2, label: 'Live Sessions', value: '0', color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  { icon: Users, label: 'Collaborators', value: '0', color: 'text-accent-green', bg: 'bg-accent-green/10' },
  { icon: Layers, label: 'Snapshots', value: '0', color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
];

function formatRelativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  // Create room dialog state
  const [createForm, setCreateForm] = useState({ name: '', language: 'javascript' });
  const [createLoading, setCreateLoading] = useState(false);

  // Join room state
  const [joinId, setJoinId] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  // My rooms
  const [myRooms, setMyRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  // Copied state (for room ID copy)
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchMyRooms();
  }, []);

  const fetchMyRooms = async () => {
    try {
      const { data } = await api.get('/rooms/my-rooms');
      setMyRooms(data.rooms || []);
    } catch {
      // Silently fail — rooms list is optional
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error('Please enter a room name');
      return;
    }
    setCreateLoading(true);
    try {
      const { data } = await api.post('/rooms/create', createForm);
      toast.success(`Room "${data.room.name}" created!`);
      navigate(`/room/${data.room.roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const id = joinId.trim().toUpperCase();
    if (!id || id.length < 4) {
      toast.error('Please enter a valid Room ID');
      return;
    }
    setJoinLoading(true);
    try {
      await api.get(`/rooms/${id}`);
      navigate(`/room/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Room not found. Check the ID and try again.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCopyId = (roomId) => {
    navigator.clipboard.writeText(roomId);
    setCopiedId(roomId);
    toast.success('Room ID copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl" id="dashboard-main">
        {/* Welcome Header */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-text-muted text-sm mb-1 font-medium">
                {greeting()}, 👋
              </p>
              <h1 className="text-3xl font-bold text-text-primary" id="dashboard-heading">
                {user?.username}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <RoleTag role={user?.role} />
                <span className="text-text-muted text-xs">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-bg-elevated/60 border border-border-default rounded-xl px-4 py-2">
              <Sparkles className="w-4 h-4 text-accent-yellow" />
              <span className="text-xs text-text-muted font-medium">
                {user?.role === 'instructor' ? 'Create and manage coding sessions' : 'Join sessions and collaborate'}
              </span>
            </div>
          </div>
        </Motion.div>

        {/* Stats Row */}
        <Motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {STAT_CARDS.map((stat) => {
            const Icon = stat.icon;
            const v = stat.label === 'Live Sessions'
              ? myRooms.length
              : stat.label === 'Snapshots'
              ? myRooms.length * 2
              : 0;
            return (
              <div key={stat.label} className="card flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{v}</div>
                  <div className="text-xs text-text-muted font-medium">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </Motion.div>

        {/* Main Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Create Room */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card border-accent-blue/20"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">Create New Room</h2>
                <p className="text-xs text-text-muted">Start a new collaborative session</p>
              </div>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4" id="create-room-form">
              <div>
                <label htmlFor="room-name" className="input-label">Session Name</label>
                <input
                  id="room-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. CS101 Lecture, Algorithm Practice..."
                  className="input-field"
                  maxLength={60}
                  required
                />
              </div>

              <div>
                <label className="input-label">Language</label>
                <div className="grid grid-cols-4 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => setCreateForm((p) => ({ ...p, language: lang.value }))}
                      className={`
                        flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-200 text-xs font-medium
                        ${createForm.language === lang.value
                          ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                          : 'border-border-default bg-bg-elevated text-text-muted hover:border-border-muted hover:text-text-primary'
                        }
                      `}
                      id={`lang-${lang.value}`}
                    >
                      <span className="text-lg">{lang.icon}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Motion.button
                type="submit"
                disabled={createLoading}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full disabled:opacity-60"
                id="create-room-btn"
              >
                {createLoading ? (
                  <><LoadingSpinner size="sm" />Creating room...</>
                ) : (
                  <><Plus className="w-4 h-4" />Create Session</>
                )}
              </Motion.button>
            </form>
          </Motion.div>

          {/* Join Room */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="card border-accent-green/20"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center">
                <LogIn className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">Join Existing Room</h2>
                <p className="text-xs text-text-muted">Enter a room ID to collaborate</p>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="mt-4" id="join-room-form">
              <label htmlFor="join-room-id" className="input-label">Room ID</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    id="join-room-id"
                    type="text"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                    placeholder="e.g. AB12CD34"
                    className="input-field pl-10 uppercase tracking-widest font-mono text-accent-green"
                    maxLength={8}
                  />
                </div>
                <Motion.button
                  type="submit"
                  disabled={joinLoading || !joinId.trim()}
                  whileTap={{ scale: 0.97 }}
                  className="btn-secondary disabled:opacity-50 border-accent-green/30 text-accent-green hover:border-accent-green/60"
                  id="join-room-btn"
                >
                  {joinLoading ? <LoadingSpinner size="sm" /> : <ChevronRight className="w-4 h-4" />}
                </Motion.button>
              </div>
            </form>

            {/* How it works */}
            <div className="mt-6 space-y-3">
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">How it works</p>
              {[
                { icon: Hash, text: 'Get the 8-character Room ID from your instructor' },
                { icon: LogIn, text: 'Enter it above and join instantly' },
                { icon: Code2, text: 'Start coding together in real time' },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-bg-elevated rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-accent-green" />
                    </div>
                    <span className="text-xs text-text-muted">{step.text}</span>
                  </div>
                );
              })}
            </div>
          </Motion.div>
        </div>

        {/* Recent Rooms */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-text-muted" />
              <h2 className="text-base font-semibold text-text-primary">Your Recent Sessions</h2>
            </div>
            {myRooms.length > 0 && (
              <span className="text-xs text-text-muted bg-bg-elevated px-2.5 py-1 rounded-full">
                {myRooms.length} session{myRooms.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {roomsLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : myRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-bg-elevated rounded-2xl flex items-center justify-center mb-4">
                <Terminal className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-muted text-sm font-medium mb-1">No sessions yet</p>
              <p className="text-text-muted text-xs">Create your first collaborative session above</p>
            </div>
          ) : (
            <div className="space-y-2" id="rooms-list">
              {myRooms.map((room, i) => (
                <Motion.div
                  key={room.roomId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-center justify-between p-4 bg-bg-elevated hover:bg-bg-hover rounded-xl border border-border-default hover:border-accent-blue/30 transition-all duration-200 group cursor-pointer"
                  onClick={() => navigate(`/room/${room.roomId}`)}
                  id={`room-item-${room.roomId}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-bg-primary rounded-lg flex items-center justify-center text-lg">
                      {LANGUAGES.find((l) => l.value === room.language)?.icon || '🖥️'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                        {room.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-text-muted font-mono">{room.roomId}</span>
                        <span className="text-xs text-text-muted">
                          {LANGUAGES.find((l) => l.value === room.language)?.label}
                        </span>
                        <span className="text-xs text-text-muted">{formatRelativeTime(room.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopyId(room.roomId); }}
                      className="btn-ghost text-xs py-1.5 px-2.5"
                      title="Copy Room ID"
                      id={`copy-room-${room.roomId}`}
                    >
                      {copiedId === room.roomId ? (
                        <Check className="w-3.5 h-3.5 text-accent-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </Motion.div>
              ))}
            </div>
          )}
        </Motion.div>

        {/* Feature highlights footer */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mt-6"
        >
          {[
            { icon: Zap, label: 'Real-Time Sync', desc: 'Millisecond-latency collaboration via Socket.io', color: 'text-accent-blue' },
            { icon: Globe, label: 'Code Execution', desc: 'Secure sandboxed execution via Judge0', color: 'text-accent-green' },
            { icon: Layers, label: 'Version Control', desc: 'Save and restore code snapshots anytime', color: 'text-accent-purple' },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.label} className="flex items-start gap-3 p-4 bg-bg-surface/40 rounded-xl">
                <Icon className={`w-4 h-4 ${feat.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <div className="text-xs font-semibold text-text-primary mb-0.5">{feat.label}</div>
                  <div className="text-xs text-text-muted leading-relaxed">{feat.desc}</div>
                </div>
              </div>
            );
          })}
        </Motion.div>
      </main>
    </div>
  );
}
