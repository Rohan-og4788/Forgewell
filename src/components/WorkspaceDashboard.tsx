import React, { useState } from 'react';
import { 
  FolderGit2, 
  GitBranch, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Server
} from 'lucide-react';

export const WorkspaceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'repos' | 'reviews' | 'deployments'>('all');

  const projects = [
    { name: 'hyper-vector-engine', framework: 'Rust / WASM', score: '98/100', branch: 'main', lastCommit: '12m ago' },
    { name: 'synapse-copilot-ui', framework: 'Next.js 15', score: '94/100', branch: 'feat/claude-3-7', lastCommit: '1h ago' },
    { name: 'auth-vault-service', framework: 'Go / gRPC', score: '89/100', branch: 'hotfix/jwt-ttl', lastCommit: '3h ago' },
  ];

  const repositories = [
    { name: 'aidh/core-indexer', visibility: 'Public', stars: '1.4k', openPrs: 3, language: 'TypeScript' },
    { name: 'aidh/edge-runtime-go', visibility: 'Private', stars: '—', openPrs: 1, language: 'Go' },
    { name: 'aidh/developer-portfolios', visibility: 'Public', stars: '840', openPrs: 5, language: 'React' },
  ];

  const reviews = [
    { id: 'PR-892', title: 'Implement zero-copy JSON parser in SIMD', author: 'marcus_c', result: 'Pass (0 issues)', time: '4m ago' },
    { id: 'PR-891', title: 'Refactor OAuth token rotation mechanism', author: 'elena_r', result: 'Auto-Patched (2 fixes)', time: '35m ago' },
    { id: 'PR-889', title: 'Add distributed tracing headers to gRPC client', author: 'lucas_d', result: 'Pass (AST verified)', time: '2h ago' },
  ];

  const deployments = [
    { target: 'Production (US-East)', url: 'https://api.devhub.ai', latency: '12ms', version: 'v2.4.1' },
    { target: 'Preview (pr-892)', url: 'https://pr-892.devhub.preview', latency: '16ms', version: 'build-7749' },
    { target: 'Staging (EU-Central)', url: 'https://staging.devhub.ai', latency: '24ms', version: 'v2.4.2-rc' },
  ];

  return (
    <section id="workspace" className="py-24 relative overflow-hidden bg-[#08090d] border-t border-slate-900">
      {/* Glow */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-4">
            <Server className="w-3.5 h-3.5" />
            <span>Unified Command Center</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Developer Workspace
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            A single cockpit for all your active projects, connected GitHub repositories, automated AI code reviews, edge deployments, and live analytics.
          </p>
        </div>

        {/* Dashboard Frame */}
        <div className="mt-14 max-w-6xl mx-auto rounded-2xl bg-slate-950/80 border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Top Workspace Header Bar */}
          <div className="p-4 sm:p-5 bg-[#0e121a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  DevHub Studio Workspace
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Active Session
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Connected to 18 GitHub Repositories • 3 Cloud Clusters</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-medium">
              {[
                { id: 'all', label: 'Overview' },
                { id: 'projects', label: 'Projects (3)' },
                { id: 'repos', label: 'GitHub Repos (18)' },
                { id: 'reviews', label: 'AI Reviews (24)' },
                { id: 'deployments', label: 'Deployments (3)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dashboard Body Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 bg-[#090b10]">
            
            {/* 1. Projects Section */}
            {(activeTab === 'all' || activeTab === 'projects') && (
              <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <FolderGit2 className="w-4 h-4 text-cyan-400" />
                    <span>Active Projects</span>
                  </div>
                  <span className="text-xs text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">
                    + New Project
                  </span>
                </div>

                <div className="space-y-2.5">
                  {projects.map((proj) => (
                    <div key={proj.name} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-200">{proj.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{proj.framework} • branch: {proj.branch}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {proj.score}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">{proj.lastCommit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. GitHub Repositories Section */}
            {(activeTab === 'all' || activeTab === 'repos') && (
              <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <GitBranch className="w-4 h-4 text-purple-400" />
                    <span>GitHub Repositories</span>
                  </div>
                  <span className="text-xs text-purple-400 hover:underline cursor-pointer">
                    Manage Sync
                  </span>
                </div>

                <div className="space-y-2.5">
                  {repositories.map((repo) => (
                    <div key={repo.name} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-200">{repo.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{repo.language} • {repo.visibility}</div>
                      </div>
                      <div className="text-right text-xs text-slate-400 font-mono">
                        <span className="text-cyan-400">★ {repo.stars}</span>
                        <span className="ml-2 text-slate-500">PRs: {repo.openPrs}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. AI Reviews Queue */}
            {(activeTab === 'all' || activeTab === 'reviews') && (
              <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>Recent AI Reviews</span>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono">24 reviews today</span>
                </div>

                <div className="space-y-2.5">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-cyan-400 font-semibold mr-1.5">{rev.id}</span>
                        <span className="text-slate-200">{rev.title}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">by @{rev.author} • {rev.time}</div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap ml-2">
                        {rev.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Deployments & Edge Telemetry */}
            {(activeTab === 'all' || activeTab === 'deployments') && (
              <div className="lg:col-span-6 rounded-xl p-5 bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Edge Deployments</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono">310 Edge Nodes</span>
                </div>

                <div className="space-y-2.5">
                  {deployments.map((dep) => (
                    <div key={dep.target} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-slate-200 font-semibold">{dep.target}</div>
                        <div className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer">{dep.url}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {dep.latency}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{dep.version}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Live Analytics Ribbon */}
            <div className="lg:col-span-12 rounded-xl p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Developer Velocity & Code Quality Index</div>
                  <div className="text-xs text-slate-400">Engineering sprint cycle time decreased by 42% over last 30 days</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-slate-400">PR Merge Time</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">18 min (avg)</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400">Test Coverage</div>
                  <div className="text-sm font-bold font-mono text-cyan-400">96.4%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400">Bug Catch Rate</div>
                  <div className="text-sm font-bold font-mono text-purple-400">99.1%</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
