import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Code2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { setCredentials } from '../store/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(`Welcome back, ${data.user.username}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 503
        ? '⏳ Server is starting up — please wait a moment and try again.'
        : err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />

      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl mb-4 shadow-glow-blue"
          >
            <Code2 className="w-8 h-8 text-white" />
          </Motion.div>
          <Motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-text-primary mb-2"
            id="login-heading"
          >
            Welcome back
          </Motion.h1>
          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-text-muted text-sm"
          >
            Sign in to your{' '}
            <span className="gradient-text font-semibold">RCO-IDE</span> workspace
          </Motion.p>
        </div>

        {/* Card */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass rounded-3xl p-8 shadow-panel"
        >
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2.5 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-sm rounded-xl px-4 py-3 mb-5"
                id="login-error"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange flex-shrink-0" />
                {error}
              </Motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="input-label">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="input-label">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  id="toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full mt-2 py-3.5 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              id="login-submit"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Motion.button>
          </form>

          {/* Divider */}
          <div className="divider my-6">or</div>

          {/* Features hint */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '⚡', label: 'Live Collaboration' },
              { icon: '🔒', label: 'Secure Execution' },
              { icon: '📸', label: 'Code Snapshots' },
              { icon: '🎨', label: 'Monaco Editor' },
            ].map((feat) => (
              <div
                key={feat.label}
                className="flex items-center gap-2 bg-bg-elevated/60 rounded-xl px-3 py-2"
              >
                <span className="text-base">{feat.icon}</span>
                <span className="text-xs text-text-muted font-medium">{feat.label}</span>
              </div>
            ))}
          </div>
        </Motion.div>

        {/* Sign up link */}
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-text-muted mt-6"
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-accent-blue hover:text-blue-300 font-semibold transition-colors"
            id="go-to-register"
          >
            Create one free →
          </Link>
        </Motion.p>
      </Motion.div>
    </div>
  );
}
