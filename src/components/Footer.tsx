import React from 'react';
import { 
  Cpu, 
  ArrowUpRight 
} from 'lucide-react';
import { GitHubIcon, TwitterIcon, DiscordIcon, LinkedInIcon } from './Icons';

export const Footer: React.FC = () => {
  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'AI Code Review', href: '#ai-tools' },
        { label: 'Portfolio Builder', href: '#portfolios' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Changelog', href: '#changelog' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#docs' },
        { label: 'Blog', href: '#blog' },
        { label: 'API Reference', href: '#api' },
        { label: 'Community Guides', href: '#guides' },
        { label: 'Status & Uptime', href: '#status' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '#about' },
        { label: 'Contact', href: '#contact' },
        { label: 'Careers (We\'re hiring!)', href: '#careers' },
        { label: 'Brand Assets', href: '#brand' },
        { label: 'GitHub Organization', href: 'https://github.com', external: true },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Security & SOC2', href: '#security' },
        { label: 'Cookie Settings', href: '#cookies' },
        { label: 'GDPR Compliance', href: '#gdpr' },
      ],
    },
  ];

  return (
    <footer className="bg-[#050609] border-t border-slate-800/80 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0d1117] rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                AI Developer Hub
              </span>
            </a>

            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              The unified developer cockpit for automated AI code reviews, 1-click verified portfolios, and edge deployments.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                aria-label="GitHub"
              >
                <GitHubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                aria-label="Discord"
              >
                <DiscordIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All systems operational (99.99%)</span>
              </div>
            </div>
          </div>

          {/* Columns: Product, Resources, Company, Legal */}
          {footerColumns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer' : undefined}
                      className="text-xs sm:text-sm text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                      {link.external && (
                        <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom copyright and legal note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AI Developer Hub Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-slate-300 transition-colors">Terms</a>
            <span>•</span>
            <a href="#security" className="hover:text-slate-300 transition-colors">Security</a>
            <span>•</span>
            <a href="#contact" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
