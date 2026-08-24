import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  GitPullRequest, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'review' | 'github' | 'deploy' | 'analytics'>('review');

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Glows & Grids */}
      <div className="absolute inset-0 bg-radial-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-indigo-500/15 to-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/70 hover:border-cyan-500/50 text-xs font-medium text-slate-300 shadow-xl backdrop-blur-md group transition-all duration-200"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-semibold">New</span>
            <span>Autonomous PR Review Bot & 1-Click Portfolios</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

        {/* Hero Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mt-6 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans leading-[1.1]">
            Your Entire Developer Workflow,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
              Powered by AI.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-2xl text-slate-300 font-medium tracking-wide">
            Code. Review. Build. Deploy. Document. Showcase. Grow.
          </p>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The next-generation unified platform for high-velocity software engineers. Connect your GitHub repos, get instant AST-powered code reviews, generate verified showcase portfolios, and deploy globally in seconds.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Start Building Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-slate-950" />
            </button>

            <a
              href="#ai-tools"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 text-slate-200 font-semibold text-base backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Explore AI Tools</span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md group-hover:text-slate-200 transition-colors">
                Live Demo
              </span>
            </a>
          </div>

          {/* Micro trust indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>50 Free AI reviews/mo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>1-Click GitHub sync</span>
            </div>
          </div>
        </motion.div>

        {/* Large Interactive Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-14 max-w-6xl mx-auto"
        >
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-slate-700/80 via-slate-800/40 to-slate-900/90 shadow-2xl shadow-cyan-950/40">
            {/* Outer window frame */}
            <div className="bg-[#0b0e14] rounded-2xl overflow-hidden border border-slate-800/80">
              
              {/* Window Header / Tab Selector */}
              <div className="px-4 py-3 bg-[#0d111a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline-flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    app.devhub.ai/workspace/main
                  </span>
                </div>

                {/* Interactive Cards Switcher Tabs */}
                <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('review')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'review'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Code Review</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('github')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'github'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
                    <span>GitHub</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('deploy')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'deploy'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deployment</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'analytics'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Portfolio Analytics</span>
                  </button>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="font-mono">Sync Active</span>
                </div>
              </div>

              {/* Window Body Grid: 4 Dynamic Preview Cards Layout */}
              <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 bg-gradient-to-b from-[#0b0e14] to-[#07090c]">
                
                {/* 1. AI Code Review Card */}
                <div
                  onClick={() => setActiveTab('review')}
                  className={`lg:col-span-6 rounded-xl p-5 border transition-all cursor-pointer ${
                    activeTab === 'review'
                      ? 'bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/20'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          AI Code Review
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                            PR #142 Passed
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400">auth-service / jwt_validator.ts</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      98% Confidence
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-semibold text-rose-300">Security Warning:</span> Missing token expiration validation in verifySession()
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                      <div className="text-rose-400">- const decoded = jwt.decode(token);</div>
                      <div className="text-emerald-400">+ const decoded = jwt.verify(token, secret, &#123; algorithms: ['RS256'], maxAge: '2h' &#125;);</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Analysis time: 1.2s</span>
                    <span className="text-cyan-400 font-medium hover:underline flex items-center gap-1">
                      View Full AST Diff <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* 2. GitHub Integration Card */}
                <div
                  onClick={() => setActiveTab('github')}
                  className={`lg:col-span-6 rounded-xl p-5 border transition-all cursor-pointer ${
                    activeTab === 'github'
                      ? 'bg-slate-900/90 border-purple-500/40 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/20'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <GitPullRequest className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">GitHub Sync Engine</h4>
                        <p className="text-xs text-slate-400">org: devhub-org (18 repos connected)</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                      Live Webhook
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-mono text-slate-300">feat/ai-streaming-agent</span>
                      </div>
                      <span className="text-slate-500">2m ago • 4 commits</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="font-mono text-slate-300">fix/websocket-reconnect</span>
                      </div>
                      <span className="text-slate-500">14m ago • AI Reviewed</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Branch Protection: Enforced</span>
                    <span className="text-purple-400 font-medium hover:underline flex items-center gap-1">
                      Manage Repositories <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* 3. Deployment Card */}
                <div
                  onClick={() => setActiveTab('deploy')}
                  className={`lg:col-span-6 rounded-xl p-5 border transition-all cursor-pointer ${
                    activeTab === 'deploy'
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Global Edge Deployment</h4>
                        <p className="text-xs text-slate-400">production: api-prod-iad1</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      HTTP/3 200 OK
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400">Global TTFB</div>
                      <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">14ms</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400">SSL Certificate</div>
                      <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">Auto TLS</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400">Edge Nodes</div>
                      <div className="text-sm font-bold font-mono text-purple-400 mt-0.5">310 Pop</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="font-mono text-slate-400">https://api.devhub.live</span>
                    <span className="text-emerald-400 font-medium hover:underline flex items-center gap-1">
                      View Edge Logs <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* 4. Portfolio Analytics Card */}
                <div
                  onClick={() => setActiveTab('analytics')}
                  className={`lg:col-span-6 rounded-xl p-5 border transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/20'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Portfolio Analytics</h4>
                        <p className="text-xs text-slate-400">alex-rivera.devhub.page</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +142% this wk
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Recruiter Views</div>
                      <div className="text-base font-bold font-mono text-amber-300">1,842</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] text-slate-400">GitHub Stars</div>
                      <div className="text-base font-bold font-mono text-cyan-300">2,419</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Inbound Leads</div>
                      <div className="text-base font-bold font-mono text-emerald-300">19 DMs</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>Top Referrer: GitHub Trending / HackerNews</span>
                    <span className="text-amber-400 font-medium hover:underline flex items-center gap-1">
                      Open Insights <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
