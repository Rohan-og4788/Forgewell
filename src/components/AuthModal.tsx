import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Cpu 
} from 'lucide-react';
import { GitHubIcon } from './Icons';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  selectedPlan?: string | null;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  selectedPlan,
  onClose,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode with props when changed
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 800);
  };

  const handleGitHubOAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-2xl bg-surface border border-line shadow-xl p-6 sm:p-8 z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-fg rounded-lg hover:bg-elevated transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-fg">
              Welcome to AI Developer Hub!
            </h3>
            <p className="text-sm text-muted">
              {selectedPlan ? `You're signed up for the ${selectedPlan.toUpperCase()} tier.` : 'Your developer workspace is being prepared.'}
            </p>
            <div className="p-3 rounded-xl bg-elevated border border-line text-xs font-mono text-cyan-700 dark:text-cyan-300">
              Redirecting to workspace...
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-lg bg-cyan-600 mx-auto mb-3 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-fg">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h3>
              <p className="text-xs text-muted mt-1">
                {selectedPlan
                  ? `Selected plan: ${selectedPlan.toUpperCase()}`
                  : 'Experience the AI developer workflow revolution.'}
              </p>
            </div>

            {/* Quick OAuth Button */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleGitHubOAuth}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-elevated hover:bg-line text-fg font-semibold text-sm border border-line flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <GitHubIcon className="w-4 h-4 text-fg" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-2 text-muted">
                  or with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Work or Developer Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    className="w-full bg-elevated border border-line focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-fg focus:outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Get Instant Access' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Mode toggle */}
            <div className="mt-6 text-center text-xs text-muted">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    Log In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account yet?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
