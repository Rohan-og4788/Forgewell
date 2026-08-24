import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Terminal, CheckCircle2 } from 'lucide-react';

interface FinalCTAProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenAuth }) => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#07080d]">
      {/* Radiant ambient glow */}
      <div className="absolute inset-0 bg-radial-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl p-8 sm:p-14 bg-gradient-to-b from-slate-900/90 via-[#0d121c] to-[#080b12] border border-cyan-500/30 shadow-2xl shadow-cyan-950/40 text-center relative overflow-hidden"
        >
          {/* Subtle top rainbow line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready in under 60 seconds</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Build your entire developer identity in one place.
          </h2>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join over 50,000+ developers shipping cleaner code, automating PR reviews, and presenting verified portfolios to top engineering teams.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Start Building Free</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Explore Features</span>
            </a>
          </div>

          {/* Footer guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 pt-6 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Free tier forever
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              SOC2 Type II Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              No credit card needed
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
