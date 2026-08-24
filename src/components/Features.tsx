import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Bot, 
  GitPullRequest, 
  FileText, 
  Layout, 
  Zap, 
  BarChart3, 
  Users, 
  Sparkles, 
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import { FEATURES_DATA } from '../data/landingData';

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  Bot,
  GitPullRequest,
  FileText,
  Layout,
  Zap,
  BarChart3,
  Users,
};

export const Features: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'code' | 'career' | 'deploy' | 'collab'>('all');

  const filteredFeatures = selectedCategory === 'all'
    ? FEATURES_DATA
    : FEATURES_DATA.filter((f) => f.category === selectedCategory);

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#08090d]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Power-Packed Feature Suite</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for the modern developer lifecycle.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            From your first git commit to code review, deployment, portfolio generation, and team pair-programming. Everything in one unified, AI-augmented workspace.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {[
            { key: 'all', label: 'All 8 Features' },
            { key: 'code', label: 'Code & Review' },
            { key: 'career', label: 'Portfolio & Resumes' },
            { key: 'deploy', label: 'Edge Deployment' },
            { key: 'collab', label: 'GitHub & Team' },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 8 Feature Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeatures.map((feature, idx) => {
            const Icon = ICON_MAP[feature.iconName] || Sparkles;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="group relative rounded-2xl p-6 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#0c0f17]/90 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-cyan-950/30 hover:-translate-y-1.5"
              >
                {/* Subtle top indicator glow */}
                <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/0 group-hover:via-cyan-400/50 to-transparent transition-all duration-300" />

                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700/80 group-hover:border-cyan-500/50 group-hover:bg-cyan-950/40 text-cyan-400 flex items-center justify-center transition-colors duration-300 shadow-md">
                      <Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {feature.badge && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border border-slate-700/60 group-hover:border-cyan-500/30">
                        {feature.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-5 text-lg font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>{feature.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all opacity-0 group-hover:opacity-100" />
                  </h3>

                  <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Highlight Pill */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-xs font-mono text-cyan-400/90">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{feature.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
