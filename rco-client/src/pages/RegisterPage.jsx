import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Mail, Lock, User, Eye, EyeOff,
  GraduationCap, BookOpen, ArrowRight, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { setCredentials } from '../store/authSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const ROLE_OPTIONS = [
  {
    value: 'student',
    label: 'Student',
    description: 'Join sessions, collaborate, and learn',
    icon: GraduationCap,
    color: 'accent-blue',
    borderColor: 'border-accent-blue',
    bgColor: 'bg-accent-blue/10',
    textColor: 'text-accent-blue',
  },
  {
    value: 'instructor',
    label: 'Instructor',
    description: 'Create rooms, guide students, manage sessions',
    icon: BookOpen,
    color: 'accent-purple',
    borderColor: 'border-accent-purple',
    bgColor: 'bg-accent-purple/10',
    textColor: 'text-accent-purple',
  },
];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success(`Welcome to RCO-IDE, ${data.user.username}! 🚀`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Weak', color: 'bg-accent-orange', width: '25%' };
    if (p.length < 10) return { label: 'Fair', color: 'bg-accent-yellow', width: '50%' };
    if (p.length < 14) return { label: 'Good', color: 'bg-accent-green', width: '75%' };
    return { label: 'Strong', color: 'bg-accent-green', width: '100%' };
  };
  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative orbs */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent-green/5 rounded-full blur-3xl pointer-events-none" />

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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl mb-4 shadow-glow-purple"
          >
            <Code2 className="w-8 h-8 text-white" />
          </Motion.div>
          <Motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-text-primary mb-2"
            id="register-heading"
          >
            Create account
          </Motion.h1>
          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-text-muted text-sm"
          >
            Join the{' '}
            <span className="gradient-text font-semibold">RCO-IDE</span> community
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
                id="register-error"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange flex-shrink-0" />
                {error}
              </Motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
            {/* Role Selection */}
            <div>
              <label className="input-label">I am a...</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {ROLE_OPTIONS.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role.value)}
                      className={`
                        relative flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 transition-all duration-200
                        ${isSelected
                          ? `${role.borderColor} ${role.bgColor}`
                          : 'border-border-default bg-bg-elevated hover:border-border-muted'
                        }
                      `}
                      id={`role-${role.value}`}
                    >
                      {isSelected && (
                        <CheckCircle2 className={`absolute top-2 right-2 w-4 h-4 ${role.textColor}`} />
                      )}
                      <Icon className={`w-5 h-5 ${isSelected ? role.textColor : 'text-text-muted'}`} />
                      <div>
                        <div className={`text-sm font-semibold ${isSelected ? role.textColor : 'text-text-primary'}`}>
                          {role.label}
                        </div>
                        <div className="text-xs text-text-muted leading-tight mt-0.5">
                          {role.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="reg-username" className="input-label">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="input-field pl-10"
                  autoComplete="username"
                  minLength={3}
                  maxLength={30}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="input-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="reg-email"
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
              <label htmlFor="reg-password" className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-11"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  id="toggle-reg-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {strength && (
                <Motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-muted">Strength</span>
                    <span className="text-xs font-medium text-text-muted">{strength.label}</span>
                  </div>
                  <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                </Motion.div>
              )}
            </div>

            {/* Submit */}
            <Motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-3.5 text-base font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              id="register-submit"
              style={{
                background: formData.role === 'instructor'
                  ? 'linear-gradient(135deg, #bc8cff, #58a6ff)'
                  : undefined,
              }}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating account...
                </>
              ) : (
                <>
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Motion.button>
          </form>
        </Motion.div>

        {/* Login link */}
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-text-muted mt-6"
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent-blue hover:text-blue-300 font-semibold transition-colors"
            id="go-to-login"
          >
            Sign in →
          </Link>
        </Motion.p>
      </Motion.div>
    </div>
  );
}
