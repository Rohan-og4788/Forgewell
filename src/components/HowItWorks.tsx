import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  SearchCode, 
  UserCheck, 
  Rocket, 
  Terminal, 
  Check, 
  Copy, 
  CheckCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/landingData';

const STEP_ICONS = [GitBranch, SearchCode, UserCheck, Rocket];

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  const currentStepData = HOW_IT_WORKS_STEPS[activeStep];

  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-[#06070a] border-t border-slate-900">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-400 mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Zero Configuration Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            From raw repositories to an automated AI copilot, verified portfolio, and edge deployments in 4 simple steps.
          </p>
        </div>

        {/* Visual Timeline Header Stepper */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {HOW_IT_WORKS_STEPS.map((step, idx) => {
              const Icon = STEP_ICONS[idx];
              const isActive = activeStep === idx;
              const isPast = activeStep > idx;

              return (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(idx)}
                  className={`relative text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : isPast
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-500'
                  }`}
                >
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {step.number}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : isPast
                          ? 'bg-slate-800 text-cyan-400'
                          : 'bg-slate-900 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Step Name */}
                  <div className="mt-3">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
                      {step.step}
                    </span>
                    <h4
                      className={`text-sm font-bold truncate mt-0.5 ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {step.title}
                    </h4>
                  </div>

                  {/* Active bottom bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTimelineBar"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Card for the Selected Step */}
        <div className="mt-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-[#0c0f17] border border-slate-800/90 p-6 sm:p-8 shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left: Step Description and Highlights */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                      {currentStepData.step} • {currentStepData.stat}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {currentStepData.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {currentStepData.description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {currentStepData.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </div>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Between Steps */}
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : 3))}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActiveStep((prev) => (prev < 3 ? prev + 1 : 0))}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Right: Interactive Terminal & Visual Simulation */}
                <div className="lg:col-span-5">
                  <div className="rounded-xl bg-[#080a0f] border border-slate-800 shadow-2xl overflow-hidden">
                    
                    {/* Terminal Header */}
                    <div className="px-4 py-2.5 bg-[#0e121a] border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                        <span className="ml-2 text-xs font-mono text-slate-400">cli-session</span>
                      </div>
                      {currentStepData.codePreview && (
                        <button
                          onClick={() => handleCopy(currentStepData.codePreview)}
                          className="text-slate-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copy command"
                        >
                          {copiedCode ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Terminal Body */}
                    <div className="p-4 font-mono text-xs text-slate-300 space-y-2">
                      <div className="text-slate-500 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Initializing AI Developer Hub CLI v2.4</span>
                      </div>
                      
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-cyan-300 font-semibold flex items-center justify-between">
                        <code>$ {currentStepData.codePreview}</code>
                      </div>

                      {/* Simulated Step Output */}
                      <div className="pt-2 text-[11px] space-y-1 text-slate-400">
                        {activeStep === 0 && (
                          <>
                            <p className="text-emerald-400">✔ GitHub OAuth authentication successful</p>
                            <p className="text-slate-400">ℹ Found 24 repositories (18 Public, 6 Private)</p>
                            <p className="text-cyan-400">⚡ Initialized zero-latency webhook stream</p>
                          </>
                        )}
                        {activeStep === 1 && (
                          <>
                            <p className="text-emerald-400">✔ AST Parsed 148,920 LOC in 2.1s</p>
                            <p className="text-slate-300">ℹ Code Health Score: <span className="text-emerald-400 font-bold">94/100</span></p>
                            <p className="text-amber-400">⚠ 2 potential memory leaks patched automatically</p>
                          </>
                        )}
                        {activeStep === 2 && (
                          <>
                            <p className="text-emerald-400">✔ Generated ATS Resume: alex-rivera-swe.pdf</p>
                            <p className="text-cyan-400">✔ Created verified skill graph (Rust, TS, K8s)</p>
                            <p className="text-purple-400">⚡ Published 3 flagship project case studies</p>
                          </>
                        )}
                        {activeStep === 3 && (
                          <>
                            <p className="text-emerald-400">✔ Deployed to 310 edge nodes globally</p>
                            <p className="text-cyan-300">🔗 Live URL: https://alex.devhub.page</p>
                            <p className="text-emerald-300">⚡ TTFB: 11ms • SSL: Enabled</p>
                          </>
                        )}
                      </div>
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
