import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  ExternalLink, 
  Star, 
  Eye, 
  Sparkles, 
  Code2, 
  Terminal 
} from 'lucide-react';
import { PORTFOLIO_PREVIEWS } from '../data/landingData';

export const PortfolioShowcase: React.FC = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(0);

  const current = PORTFOLIO_PREVIEWS[selectedPortfolio];

  return (
    <section id="portfolios" className="py-24 relative overflow-hidden bg-[#06070a] border-t border-slate-900">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-400 mb-4">
            <Layout className="w-3.5 h-3.5" />
            <span>AI-Generated Portfolios</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Turn your GitHub commits into an irresistible portfolio.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Generate and deploy sleek, recruiter-tested developer showcase sites in 60 seconds with custom themes, verified project highlights, and live star counters.
          </p>
        </div>

        {/* Profile Switcher Tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {PORTFOLIO_PREVIEWS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedPortfolio(idx)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                selectedPortfolio === idx
                  ? 'bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/30'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
              <div className="text-left">
                <div className={`text-xs font-bold ${selectedPortfolio === idx ? 'text-white' : 'text-slate-300'}`}>
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{p.style}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Portfolio Live Display Window */}
        <div className="mt-10 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/80 to-[#0b0e14] border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Profile Overview */}
                <div className="lg:col-span-6 space-y-5">
                  
                  {/* Top Avatar & Badges */}
                  <div className="flex items-center gap-4">
                    <img
                      src={current.avatar}
                      alt={current.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/30 shadow-xl shadow-purple-950/50"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-white">{current.name}</h3>
                        <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Verified Dev
                        </span>
                      </div>
                      <p className="text-xs text-purple-400 font-medium">{current.role}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">Theme: {current.style}</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {current.bio}
                  </p>

                  {/* Skills Grid */}
                  <div>
                    <div className="text-xs font-mono text-slate-400 mb-2">Verified Skill Stack:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {current.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Stats Row */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" /> Stars
                      </div>
                      <div className="text-base font-bold font-mono text-amber-300 mt-0.5">{current.stats.githubStars}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Code2 className="w-3 h-3 text-cyan-400" /> Repos
                      </div>
                      <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">{current.stats.repos}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-purple-400" /> Views
                      </div>
                      <div className="text-base font-bold font-mono text-purple-300 mt-0.5">{current.stats.views}</div>
                    </div>
                  </div>

                </div>

                {/* Right: Featured Project Showcase Card */}
                <div className="lg:col-span-6">
                  <div className="rounded-xl bg-[#080a0f] border border-slate-800 p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        Featured AI Case Study
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Live on Edge</span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">
                        {current.featuredProject.title}
                      </h4>
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {current.featuredProject.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {current.featuredProject.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">
                        alex.devhub.page
                      </span>
                      <button className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
                        <span>Preview Live Portfolio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
