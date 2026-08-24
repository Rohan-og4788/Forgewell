import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Sparkles, CheckCircle2 } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data/landingData';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#06070a] border-t border-slate-900">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/3 w-[600px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-4">
            <Quote className="w-3.5 h-3.5" />
            <span>Developer Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Loved by engineers shipping at the speed of thought.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            See how developers at top tier startups and scaleups streamline their reviews and showcase their engineering profiles.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS_DATA.map((t, idx) => (
            <motion.div
              key={t.handle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              className="rounded-2xl p-6 sm:p-7 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-[#0c0f17] border border-slate-800/90 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Content Quote */}
                <p className="mt-4 text-sm text-slate-300 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800">
                {/* Metric Badge */}
                <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-300">
                  <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>{t.metrics}</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1">
                      {t.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xs text-slate-400">{t.role} • {t.company}</div>
                    <div className="text-[11px] font-mono text-slate-500">{t.handle}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
