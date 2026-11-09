import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Shield,
  Target,
  Sparkles,
  BookMarked,
  CheckCircle,
} from 'lucide-react';
import {
  VIRTUES,
  VIRTUE_LABELS,
  VIRTUE_DESCRIPTIONS,
  type Virtue,
} from '../utils/stoicLogic';
import { getMaxims, addMaxim } from '../services/storageService';

export function RoadmapView() {
  const [maxims, setMaxims] = useState(getMaxims());
  const [newPrinciple, setNewPrinciple] = useState('');
  const [newExplanation, setNewExplanation] = useState('');

  // Sample horizons (1, 3, 5 years)
  const [horizons, setHorizons] = useState([
    {
      id: 'h1',
      years: 1,
      title: 'Cultivate Unshakable Emotional Composure',
      description: 'Zero outbursts of anger. Respond to unexpected setbacks with deliberate pauses and Amor Fati.',
      status: 'active',
    },
    {
      id: 'h2',
      years: 3,
      title: 'Mastery of Craft & Sympatheia',
      description: 'Produce high-utility tools that elevate other people; mentor new practitioners in philosophy and code.',
      status: 'active',
    },
    {
      id: 'h3',
      years: 5,
      title: 'Financial Autonomy & Radical Simplicity',
      description: 'Live strictly below means; possess the inner independence where no external luxury can dictate peace.',
      status: 'active',
    },
  ]);

  const handleAddMaxim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinciple.trim() || !newExplanation.trim()) return;
    addMaxim(newPrinciple.trim(), newExplanation.trim());
    setMaxims(getMaxims());
    setNewPrinciple('');
    setNewExplanation('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="border-b border-[#242b24] pb-4">
        <p className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
          03 / LONG-TERM VISION & PHILOSOPHY
        </p>
        <h2 className="text-2xl font-serif font-bold text-[#f0f3ee]">
          Life Roadmap & Cardinal Virtues
        </h2>
        <p className="text-xs text-[#8c988a]">
          Connect your daily habits to 1, 3, and 5-year horizons grounded in classic Stoic character.
        </p>
      </div>

      {/* 4 Cardinal Virtues Deep Dive */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#c89b3c]" />
          <h3 className="text-base font-semibold text-[#f0f3ee]">The 4 Cardinal Virtues</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(VIRTUES) as (keyof typeof VIRTUES)[]).map((key) => {
            const v = VIRTUES[key];
            const examples = {
              wisdom: ['Premeditatio Malorum (premeditation of adversity)', 'Clear discernment between facts and opinions', 'Continuous pursuit of truth over ego'],
              courage: ['Speaking up for what is fair despite social pressure', 'Facing challenging tasks without procrastination', 'Enduring hardship with patient dignity'],
              justice: ['Treating every person with equal respect and dignity', 'Giving back through service and honest work (Sympatheia)', 'Never cheating or cutting ethical corners'],
              temperance: ['Strict moderation in food, spending, and digital consumption', 'Pausing before reacting impulsively', 'Valuing self-restraint as true freedom'],
            }[v];

            return (
              <div
                key={v}
                className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-lg font-bold text-[#e6c875]">
                    {VIRTUE_LABELS[v]}
                  </h4>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-[#202720] text-[#a4b2a1] border border-[#2c362c]">
                    Cardinal Pillar
                  </span>
                </div>

                <p className="text-xs text-[#c6cfc3] leading-relaxed">
                  {VIRTUE_DESCRIPTIONS[v]}
                </p>

                <div className="pt-2 border-t border-[#232923] space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#798577]">
                    Daily Practice Tenets:
                  </span>
                  <ul className="space-y-1 text-xs text-[#8f9b8c]">
                    {examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#c89b3c]">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Life Horizons (1, 3, 5 Years) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#c89b3c]" />
          <h3 className="text-base font-semibold text-[#f0f3ee]">Life Horizons & Aspirations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {horizons.map((h) => (
            <div
              key={h.id}
              className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#c89b3c]/20 text-[#e6c875] border border-[#c89b3c]/30">
                  {h.years}-Year Horizon
                </span>
                <h4 className="font-serif text-base font-bold text-[#f0f3ee] pt-1">
                  {h.title}
                </h4>
                <p className="text-xs text-[#8c988a] leading-relaxed">
                  {h.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#242b24] flex items-center justify-between text-[11px] text-[#788576]">
                <span className="flex items-center gap-1 text-[#8ce09a]">
                  <CheckCircle className="w-3.5 h-3.5" /> Active Horizon
                </span>
                <span>Ground in Daily Ambitions</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Stoic Maxims */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-[#c89b3c]" />
            <h3 className="text-base font-semibold text-[#f0f3ee]">
              Personal Maxims & Rules of Life
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {maxims.map((m) => (
            <div
              key={m.id}
              className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-1.5"
            >
              <h4 className="font-serif text-base font-bold text-[#e6c875]">
                {m.principle}
              </h4>
              <p className="text-xs text-[#cad2c6] leading-relaxed">{m.explanation}</p>
            </div>
          ))}
        </div>

        {/* Add Maxim Form */}
        <div className="bg-[#161a16] border border-[#283028] rounded-xl p-5 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#c89b3c]">
            Add a Personal Stoic Rule or Maxim
          </h4>
          <form onSubmit={handleAddMaxim} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <input
                type="text"
                required
                placeholder="Maxim / Principle (e.g. Choose discomfort over regret)"
                value={newPrinciple}
                onChange={(e) => setNewPrinciple(e.target.value)}
                className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>
            <div className="sm:col-span-5">
              <input
                type="text"
                required
                placeholder="Meaning / Application (e.g. Voluntary hardship strengthens resilience)"
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full h-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#283228] hover:bg-[#344034] text-[#e6c875] border border-[#3b473b] text-xs font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Maxim
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
