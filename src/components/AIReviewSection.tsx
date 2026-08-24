import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  User, 
  Send, 
  CheckCircle2, 
  Copy, 
  CheckCheck, 
  Sparkles, 
  FileCode, 
  RotateCcw
} from 'lucide-react';

export const AIReviewSection: React.FC = () => {
  const [activeFixApplied, setActiveFixApplied] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const issues = [
    {
      id: 0,
      title: '1. Weak JWT Secret & Missing Expiration',
      severity: 'Critical',
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'The token generation uses a hardcoded fallback secret and lacks a strict expiration timestamp (`exp`), allowing replay attacks.',
      recommendation: 'Use environment-injected cryptographic secrets with RS256 algorithm and mandatory 15-minute token TTL.'
    },
    {
      id: 1,
      title: '2. Timing Attack in Password Hash Comparison',
      severity: 'High',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Standard string equality (`===`) leaks timing information that allows attackers to reconstruct valid session tokens byte-by-byte.',
      recommendation: 'Switch to `crypto.timingSafeEqual` with constant-time buffer comparison.'
    },
    {
      id: 2,
      title: '3. Missing Brute-Force Rate Limiting Middleware',
      severity: 'Medium',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      description: 'Endpoint `/api/v1/auth/login` does not restrict rapid successive POST attempts from a single IP or user identifier.',
      recommendation: 'Attach Redis token-bucket rate limiter allowing maximum 5 failed attempts per 15-minute window.'
    }
  ];

  const handleCopyCode = () => {
    const code = activeFixApplied ? fixedCode : originalCode;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 900);
  };

  const originalCode = `// auth.service.ts (Before AI Review)
export async function authenticateUser(req: Request) {
  const { email, password } = req.body;
  const user = await db.user.findUnique({ where: { email } });
  
  // Vulnerability: Timing-unsafe string comparison
  if (!user || user.passwordHash !== hashPassword(password)) {
    throw new Error("Invalid credentials");
  }

  // Vulnerability: Weak fallback secret & no expiration
  const token = jwt.sign(
    { userId: user.id, role: user.role }, 
    process.env.JWT_SECRET || "default_dev_secret"
  );

  return { token, user };
}`;

  const fixedCode = `// auth.service.ts (After AI Automated Patch)
import crypto from 'node:crypto';
import { rateLimiter } from '@/middleware/rateLimit';

export async function authenticateUser(req: Request) {
  await rateLimiter.consume(req.ip, { points: 1 }); // Protected
  const { email, password } = req.body;
  const user = await db.user.findUnique({ where: { email } });

  if (!user) throw new AuthError("INVALID_CREDENTIALS");

  // Fixed: Constant-time comparison prevents side-channel leaks
  const isValid = crypto.timingSafeEqual(
    Buffer.from(user.passwordHash),
    Buffer.from(hashPassword(password))
  );
  if (!isValid) throw new AuthError("INVALID_CREDENTIALS");

  // Fixed: RS256 asymmetric signature with 15m expiration
  const token = jwt.sign({ sub: user.id, role: user.role }, privateKey, {
    algorithm: 'RS256',
    expiresIn: '15m',
    issuer: 'auth.devhub.ai'
  });

  return { token, user: sanitizeUser(user) };
}`;

  return (
    <section id="ai-tools" className="py-24 relative overflow-hidden bg-[#07090d]">
      {/* Background radial gradients */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-4">
            <Bot className="w-3.5 h-3.5" />
            <span>Interactive AI Code Reviewer</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ask AI to review, refactor & harden your codebase.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Powered by high-reasoning AST code intelligence. Discover security vulnerabilities, architectural bottlenecks, and zero-day regressions before they reach your main branch.
          </p>
        </div>

        {/* Big Interactive IDE + AI Chat Section */}
        <div className="mt-14 max-w-6xl mx-auto rounded-2xl p-[1px] bg-gradient-to-b from-cyan-500/30 via-slate-800/60 to-slate-900 shadow-2xl shadow-cyan-950/50">
          <div className="bg-[#0b0e14] rounded-2xl overflow-hidden border border-slate-800">
            
            {/* Top Toolbar */}
            <div className="px-5 py-3 bg-[#0d121c] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  services/auth/authenticateUser.ts
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Scanning AST...' : 'Re-Run AI Review'}</span>
                </button>

                <button
                  onClick={() => setActiveFixApplied(!activeFixApplied)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                    activeFixApplied
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20'
                  }`}
                >
                  {activeFixApplied ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert to Original</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Apply 3 AI Patches</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main Split Layout: AI Chat Column (Left) + Code & Diff Editor (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
              
              {/* Left Column: AI Chat Conversation */}
              <div className="lg:col-span-5 p-5 bg-[#090b10] flex flex-col justify-between space-y-4">
                
                <div className="space-y-4">
                  {/* User Query Bubble */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/80 text-sm text-slate-200 shadow-sm">
                      <p className="font-medium">"Review my authentication system."</p>
                    </div>
                  </motion.div>

                  {/* AI Response Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
                      <Bot className="w-4 h-4 text-slate-950" />
                    </div>
                    <div className="space-y-3 p-4 rounded-2xl rounded-tl-none bg-slate-900/90 border border-cyan-500/30 text-xs text-slate-300 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          AI Developer Bot (v2.4 AST)
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          Response time: 0.8s
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed font-sans text-sm">
                        "Your authentication implementation looks good overall, but I found <span className="text-rose-400 font-bold">3 areas</span> that should be improved to prevent credential forgery and timing attacks:"
                      </p>

                      {/* 3 Interactive Issues Accordion / List */}
                      <div className="space-y-2 pt-1">
                        {issues.map((issue) => (
                          <div
                            key={issue.id}
                            onClick={() => setSelectedIssue(issue.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              selectedIssue === issue.id
                                ? 'bg-slate-800/90 border-cyan-500/40 ring-1 ring-cyan-500/20'
                                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white text-xs">
                                {issue.title}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${issue.badgeClass}`}>
                                {issue.severity}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {issue.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* AI Summary Banner */}
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Auto-patch ready to apply
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">+12 / -7 LOC</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Simulated Chat Input Box */}
                <div className="relative mt-2">
                  <input
                    type="text"
                    readOnly
                    value="Ask follow-up question or instruct refactor..."
                    className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 pr-10 focus:outline-none"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Right Column: Code Snippet & Live Patch Diff */}
              <div className="lg:col-span-7 p-5 bg-[#07090d] flex flex-col justify-between">
                
                <div>
                  {/* Code Editor Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-slate-400">
                        Language: TypeScript
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        activeFixApplied ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {activeFixApplied ? 'Patched (Secure)' : 'Unpatched (3 Vulnerabilities)'}
                      </span>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Snippet Box */}
                  <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800/80 shadow-inner">
                    <AnimatePresence mode="wait">
                      <motion.pre
                        key={activeFixApplied ? 'fixed' : 'original'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-300"
                      >
                        <code>
                          {activeFixApplied ? fixedCode : originalCode}
                        </code>
                      </motion.pre>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Bottom Recommendation Highlight */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      Selected Recommendation ({issues[selectedIssue].title}):
                    </div>
                    <p className="mt-1 text-slate-400 leading-normal">
                      {issues[selectedIssue].recommendation}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
