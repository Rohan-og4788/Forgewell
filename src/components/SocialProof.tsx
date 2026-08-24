import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Database, 
  Globe, 
  Layers, 
  Sparkles, 
  Terminal, 
  Zap 
} from 'lucide-react';

export const SocialProof: React.FC = () => {
  const logos = [
    { name: 'Vercel Labs', icon: Zap, label: 'VERCEL' },
    { name: 'Supabase', icon: Database, label: 'SUPABASE' },
    { name: 'Linear', icon: Layers, label: 'LINEAR' },
    { name: 'Raycast', icon: Terminal, label: 'RAYCAST' },
    { name: 'Cloudflare', icon: Globe, label: 'CLOUDFLARE' },
    { name: 'Docker', icon: Cpu, label: 'DOCKER' },
    { name: 'Anthropic Guild', icon: Sparkles, label: 'ANTHROPIC' },
  ];

  const stats = [
    { value: '50,000+', label: 'Active Developers' },
    { value: '1.4M+', label: 'AI Code Reviews Conducted' },
    { value: '99.99%', label: 'Edge Platform Uptime' },
    { value: '450k+', label: 'Portfolios & Resumes Built' },
  ];

  return (
    <section className="py-14 border-y border-slate-800/80 bg-[#07080c]/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-400">
            Built for modern developers & engineering teams worldwide
          </p>
        </div>

        {/* Company Logos Grid */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          {logos.map((logo, idx) => {
            const Icon = logo.icon;
            return (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 cursor-default group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center group-hover:border-cyan-500/40 group-hover:text-cyan-400 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-mono text-sm tracking-wider font-semibold group-hover:text-cyan-300 transition-colors">
                  {logo.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Live Metrics Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-800/50">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="text-center p-3 rounded-xl bg-slate-900/30 border border-slate-800/60"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300 font-mono">
                {stat.value}
              </div>
              <div className="text-xs text-slate-400 mt-1 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
