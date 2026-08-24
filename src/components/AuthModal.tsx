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
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-[#0b0e14] border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 p-6 sm:p-8 z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              Welcome to AI Developer Hub!
            </h3>
            <p className="text-sm text-slate-300">
              {selectedPlan ? `You're signed up for the ${selectedPlan.toUpperCase()} tier.` : 'Your developer workspace is being prepared.'}
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
              Redirecting to workspace...
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] mx-auto mb-3 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0d1117] rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
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
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
              >
                <GitHubIcon className="w-4 h-4 text-white" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0b0e14] px-2 text-slate-500 font-mono">
                  or with email
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Work or Developer Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="mt-6 text-center text-xs text-slate-400">
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
