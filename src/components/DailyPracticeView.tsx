import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  HelpCircle,
  Clock,
  ArrowRight,
  Shield,
  Lightbulb,
  HeartHandshake,
  Compass,
  AlertCircle,
  Bookmark,
  Play,
  RotateCcw,
  MessageSquare,
  Award,
} from 'lucide-react';
import {
  type DailyReflectionData,
  type AmbitionItem,
  type DichotomyItem,
  type StoicQuote,
  type Virtue,
  type CommunityBroadcast,
  type UserAccount,
  VIRTUE_LABELS,
  VIRTUE_DESCRIPTIONS,
  analyzeDichotomy,
} from '../utils/stoicLogic';
import { INITIAL_PROMPTS } from '../data/seedData';

interface DailyPracticeViewProps {
  currentDate: string;
  reflection: DailyReflectionData;
  onUpdateReflection: (updated: DailyReflectionData) => void;
  quote: StoicQuote;
  broadcast: CommunityBroadcast | null;
  currentUser: UserAccount;
}

export function DailyPracticeView({
  currentDate,
  reflection,
  onUpdateReflection,
  quote,
  broadcast,
  currentUser,
}: DailyPracticeViewProps) {
  // New Ambition form state
  const [ambitionTitle, setAmbitionTitle] = useState('');
  const [ambitionVirtue, setAmbitionVirtue] = useState<Virtue>('wisdom');
  const [ambitionPriority, setAmbitionPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [ambitionSteps, setAmbitionSteps] = useState('');

  // Dichotomy form state
  const [dichotomyText, setDichotomyText] = useState('');
  const [dichotomyCategory, setDichotomyCategory] = useState<'within' | 'outside'>('outside');
  const [dichotomyReframed, setDichotomyReframed] = useState('');

  // New win state
  const [newWinText, setNewWinText] = useState('');

  // Daily prompt rotation
  const todayDayIndex = Math.abs(currentDate.split('-').reduce((acc, curr) => acc + Number(curr), 0)) % INITIAL_PROMPTS.length;
  const currentPrompt = INITIAL_PROMPTS[todayDayIndex] || INITIAL_PROMPTS[0];

  // Midday pause timer (60 seconds)
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    if (timerActive && timerSeconds > 0) {
      interval = window.setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  // Ambition actions
  const handleAddAmbition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambitionTitle.trim()) return;

    const stepsArray = ambitionSteps
      ? ambitionSteps.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const newAmbition: AmbitionItem = {
      id: `amb-${Date.now()}`,
      title: ambitionTitle.trim(),
      virtue: ambitionVirtue,
      priority: ambitionPriority,
      actionSteps: stepsArray,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateReflection({
      ...reflection,
      ambitions: [...reflection.ambitions, newAmbition],
    });

    setAmbitionTitle('');
    setAmbitionSteps('');
  };

  const handleToggleAmbition = (id: string) => {
    const updated = reflection.ambitions.map((a) =>
      a.id === id ? { ...a, completed: !a.completed } : a
    );
    onUpdateReflection({ ...reflection, ambitions: updated });
  };

  const handleDeleteAmbition = (id: string) => {
    const updated = reflection.ambitions.filter((a) => a.id !== id);
    onUpdateReflection({ ...reflection, ambitions: updated });
  };

  const handleUsePrompt = () => {
    setAmbitionTitle(currentPrompt.title);
    setAmbitionVirtue(currentPrompt.virtue as Virtue);
    setAmbitionSteps(currentPrompt.steps);
  };

  // Dichotomy actions
  const handleAddDichotomy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dichotomyText.trim()) return;

    const newItem: DichotomyItem = {
      id: `dich-${Date.now()}`,
      text: dichotomyText.trim(),
      category: dichotomyCategory,
      reframed: dichotomyReframed.trim(),
      createdAt: new Date().toISOString(),
    };

    onUpdateReflection({
      ...reflection,
      dichotomyItems: [...reflection.dichotomyItems, newItem],
    });

    setDichotomyText('');
    setDichotomyReframed('');
  };

  const handleDeleteDichotomy = (id: string) => {
    const updated = reflection.dichotomyItems.filter((i) => i.id !== id);
    onUpdateReflection({ ...reflection, dichotomyItems: updated });
  };

  // Daily wins
  const handleAddWin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWinText.trim()) return;
    onUpdateReflection({
      ...reflection,
      dailyWins: [...(reflection.dailyWins || []), newWinText.trim()],
    });
    setNewWinText('');
  };

  const handleDeleteWin = (index: number) => {
    const updated = [...(reflection.dailyWins || [])];
    updated.splice(index, 1);
    onUpdateReflection({ ...reflection, dailyWins: updated });
  };

  const dichotomyStats = analyzeDichotomy(reflection.dichotomyItems);

  return (
    <div className="space-y-8 pb-12">
      {/* Community Broadcast Notice (from Admin) */}
      {broadcast && broadcast.active && (
        <section
          aria-label="Community announcement"
          className="bg-gradient-to-r from-[#202720] to-[#181c18] border border-[#c89b3c]/40 rounded-xl p-4 shadow-lg flex items-start gap-3.5"
        >
          <div className="p-2 rounded-lg bg-[#c89b3c]/20 text-[#e6c875] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#c89b3c]/20 text-[#e6c875]">
                {broadcast.type === 'challenge' ? 'Stoic Challenge' : 'Admin Announcement'}
              </span>
              <h3 className="text-sm font-semibold text-[#f0f3ee]">{broadcast.title}</h3>
            </div>
            <p className="text-xs text-[#cad1c8] leading-relaxed">{broadcast.message}</p>
          </div>
        </section>
      )}

      {/* Personalized Mentor Guidance Callout (if admin left advice for this user) */}
      {currentUser.mentorGuidance && (
        <section
          aria-label="Mentor guidance"
          className="bg-[#18201a] border border-[#3b523e] rounded-xl p-4 flex items-start gap-3.5 shadow"
        >
          <div className="p-2 rounded-lg bg-[#2e4732] text-[#8ce09a] shrink-0 mt-0.5">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#2e4732] text-[#8ce09a]">
                Mentor Guidance
              </span>
              <span className="text-xs text-[#8ca08e]">For {currentUser.displayName}</span>
            </div>
            <p className="text-sm text-[#dce4dc] mt-1.5 italic font-serif">
              "{currentUser.mentorGuidance}"
            </p>
          </div>
        </section>
      )}

      {/* Today's Stoic Thought Card */}
      <section
        aria-label="Daily Stoic quote"
        className="relative bg-gradient-to-b from-[#1c221c] to-[#161a16] border border-[#2c352c] rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden"
      >
        <div className="absolute top-2 right-4 text-7xl font-serif text-[#c89b3c]/10 select-none pointer-events-none">
          “
        </div>
        <div className="relative space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-widest font-mono uppercase text-[#c89b3c]">
              TODAY'S STOIC THOUGHT
            </span>
            {quote.virtue && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#242b24] text-[#a5b2a3] border border-[#303a30]">
                {VIRTUE_LABELS[quote.virtue]}
              </span>
            )}
          </div>

          <blockquote className="font-serif text-xl sm:text-2xl text-[#f3f6f1] leading-relaxed italic">
            "{quote.text}"
          </blockquote>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#a2aca0]">
            <span className="font-semibold text-[#e0e5de]">{quote.author}</span>
            <span>·</span>
            <span>{quote.source}</span>
          </div>

          <div className="pt-2 border-t border-[#252c25] flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-[#c89b3c] shrink-0 mt-0.5" />
            <p className="text-xs text-[#c6cec4] leading-relaxed">
              <strong className="text-[#e2c77d]">Practical Application: </strong>
              {quote.application}
            </p>
          </div>
        </div>
      </section>

      {/* 01 / MORNING PRACTICE */}
      <section aria-labelledby="heading-morning" className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#242b24] pb-2">
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
              01 / MORNING PRACTICE
            </p>
            <h2 id="heading-morning" className="text-2xl font-serif font-bold text-[#f0f3ee]">
              Set Your Intention
            </h2>
            <p className="text-xs text-[#8c988a]">
              Choose a few things worth your effort. Decide how you'll meet the day.
            </p>
          </div>
          <span className="font-serif text-3xl text-[#364036] font-bold">01</span>
        </div>

        {/* Morning Intention & Anticipated Challenge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-2">
            <label htmlFor="morning-intention" className="block text-xs font-semibold text-[#dce1da]">
              How do I want to show up today?
            </label>
            <textarea
              id="morning-intention"
              rows={3}
              value={reflection.morningIntentions}
              onChange={(e) =>
                onUpdateReflection({ ...reflection, morningIntentions: e.target.value })
              }
              placeholder="e.g. Calm amidst urgency, patient with colleagues, focused on honest effort..."
              className="w-full bg-[#121512] border border-[#262d26] rounded-lg p-2.5 text-xs text-[#e4e7e2] placeholder-[#5a6458] focus:outline-none focus:border-[#c89b3c]/60"
            />
            <p className="text-[10px] text-[#717d6f]">
              Auto-saved as you type. A guiding compass for your hours ahead.
            </p>
          </div>

          <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="anticipated-challenge" className="block text-xs font-semibold text-[#dce1da]">
                Anticipated Challenge (Premeditatio Malorum)
              </label>
              <span className="text-[10px] text-[#c89b3c] font-medium">Stoic Preparation</span>
            </div>
            <textarea
              id="anticipated-challenge"
              rows={3}
              value={reflection.anticipatedChallenge}
              onChange={(e) =>
                onUpdateReflection({ ...reflection, anticipatedChallenge: e.target.value })
              }
              placeholder="e.g. Expected delays or disagreements—how will I respond without losing composure?"
              className="w-full bg-[#121512] border border-[#262d26] rounded-lg p-2.5 text-xs text-[#e4e7e2] placeholder-[#5a6458] focus:outline-none focus:border-[#c89b3c]/60"
            />
            <p className="text-[10px] text-[#717d6f]">
              Marcus Aurelius: "When you wake up, tell yourself: the people I deal with today will be meddling, ungrateful..."
            </p>
          </div>
        </div>

        {/* Ambitions Panel */}
        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[#e4e7e2]">Priority Ambitions</h3>
              <p className="text-xs text-[#8c988a]">
                Grounded in Stoic virtues. Focus strictly on deliberate actions you own.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-[#202620] text-[#c89b3c] border border-[#2c362c]">
              {reflection.ambitions.filter((a) => a.completed).length} of {reflection.ambitions.length} completed
            </span>
          </div>

          {/* Daily Prompt Suggestion */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-[#1c221c] border border-[#2a342a]">
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#c89b3c]">
                A PROMPT FOR TODAY ({VIRTUE_LABELS[currentPrompt.virtue as Virtue]})
              </span>
              <p className="text-xs text-[#dce1da] font-medium">{currentPrompt.title}</p>
              <p className="text-[11px] text-[#869284]">{currentPrompt.steps}</p>
            </div>
            <button
              type="button"
              onClick={handleUsePrompt}
              className="px-2.5 py-1 text-xs rounded bg-[#283228] hover:bg-[#344034] text-[#e6c875] border border-[#3b473b] transition-colors shrink-0"
            >
              Use this prompt
            </button>
          </div>

          {/* Ambition Form */}
          <form onSubmit={handleAddAmbition} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
                  Priority Ambition
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Write clean code for two focused hours"
                  value={ambitionTitle}
                  onChange={(e) => setAmbitionTitle(e.target.value)}
                  className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
                  Cardinal Virtue
                </label>
                <select
                  value={ambitionVirtue}
                  onChange={(e) => setAmbitionVirtue(e.target.value as Virtue)}
                  className="w-full bg-[#121512] border border-[#283028] rounded-lg px-2.5 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
                >
                  <option value="wisdom">Wisdom (Judgment)</option>
                  <option value="courage">Courage (Bravery)</option>
                  <option value="justice">Justice (Fairness)</option>
                  <option value="temperance">Temperance (Restraint)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
                  Priority
                </label>
                <select
                  value={ambitionPriority}
                  onChange={(e) => setAmbitionPriority(e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full bg-[#121512] border border-[#283028] rounded-lg px-2.5 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
                Action Steps <span className="text-[#6d796b]">(comma separated)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Silence phone, outline functions, test step 1"
                value={ambitionSteps}
                onChange={(e) => setAmbitionSteps(e.target.value)}
                className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c89b3c] hover:bg-[#d8ab4c] text-[#121412] font-semibold text-xs transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                Add Ambition
              </button>
            </div>
          </form>

          {/* Ambitions List */}
          <div className="space-y-2 pt-2">
            {reflection.ambitions.length === 0 ? (
              <p className="text-center py-6 text-xs text-[#717c6f] italic">
                Start small. One deliberate action is enough to begin.
              </p>
            ) : (
              reflection.ambitions.map((ambition) => {
                const priorityColors = {
                  high: 'bg-red-950/40 text-red-300 border-red-800/40',
                  medium: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
                  low: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
                };

                return (
                  <div
                    key={ambition.id}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border transition-all ${
                      ambition.completed
                        ? 'bg-[#141814] border-[#222a22] opacity-75'
                        : 'bg-[#1a1f1a] border-[#2c352c]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleAmbition(ambition.id)}
                      className="mt-0.5 text-[#8f9b8e] hover:text-[#c89b3c] transition-colors"
                      aria-label={`Toggle ${ambition.title}`}
                    >
                      {ambition.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#c89b3c]" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#4e5a4d]" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            ambition.completed
                              ? 'line-through text-[#798577]'
                              : 'text-[#e4e7e2]'
                          }`}
                        >
                          {ambition.title}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#242b24] text-[#a4b1a2] border border-[#313c31]">
                          {VIRTUE_LABELS[ambition.virtue]}
                        </span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
                            priorityColors[ambition.priority]
                          }`}
                        >
                          {ambition.priority}
                        </span>
                      </div>

                      {ambition.actionSteps && ambition.actionSteps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ambition.actionSteps.map((step, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded bg-[#131613] text-[#939f91] border border-[#232a23]"
                            >
                              • {step}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAmbition(ambition.id)}
                      className="p-1 text-[#667264] hover:text-red-400 transition-colors"
                      aria-label={`Delete ${ambition.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 02 / DICHOTOMY OF CONTROL */}
      <section aria-labelledby="heading-control" className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#242b24] pb-2">
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
              02 / THE DICHOTOMY OF CONTROL
            </p>
            <h2 id="heading-control" className="text-2xl font-serif font-bold text-[#f0f3ee]">
              Sort What's Yours to Carry
            </h2>
            <p className="text-xs text-[#8c988a]">
              Epictetus: Give your effort to your choices. Meet outcomes and external events with composure.
            </p>
          </div>
          <span className="font-serif text-3xl text-[#364036] font-bold">02</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Form & Items */}
          <div className="lg:col-span-2 bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-5">
            <h3 className="text-base font-semibold text-[#e4e7e2]">Put a Thought in Its Place</h3>

            <form onSubmit={handleAddDichotomy} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
                  Thought, concern, or situation
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whether others approve of my work, or whether the flight is delayed"
                  value={dichotomyText}
                  onChange={(e) => setDichotomyText(e.target.value)}
                  className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
                    Realm of Authority
                  </label>
                  <select
                    value={dichotomyCategory}
                    onChange={(e) => setDichotomyCategory(e.target.value as 'within' | 'outside')}
                    className="w-full bg-[#121512] border border-[#283028] rounded-lg px-2.5 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
                  >
                    <option value="outside">Outside My Control (Outcomes / People)</option>
                    <option value="within">Within My Control (My Effort / Mindset)</option>
                  </select>
                </div>

                <div className="sm:col-span-7">
                  <label className="block text-[11px] font-medium text-[#9ba699] mb-1">
                    My Useful Response (Amor Fati)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Prepare meticulously, accept whatever occurs without rancor"
                    value={dichotomyReframed}
                    onChange={(e) => setDichotomyReframed(e.target.value)}
                    className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#283228] hover:bg-[#344034] text-[#e6c875] border border-[#3b473b] font-semibold text-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add to Control Board
                </button>
              </div>
            </form>

            {/* Dichotomy Items */}
            <div className="space-y-2.5 pt-2">
              {reflection.dichotomyItems.length === 0 ? (
                <p className="text-center py-6 text-xs text-[#717c6f] italic">
                  A worry named clearly is easier to examine. Add your first concern above.
                </p>
              ) : (
                reflection.dichotomyItems.map((item) => {
                  const isWithin = item.category === 'within';
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-lg bg-[#141814] border border-[#273027] flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isWithin
                                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/40'
                                : 'bg-stone-800 text-stone-300 border border-stone-700'
                            }`}
                          >
                            {isWithin ? 'Within Control' : 'Outside Control'}
                          </span>
                          <span className="text-xs text-[#dce1da] font-medium">{item.text}</span>
                        </div>

                        {item.reframed && (
                          <div className="flex items-start gap-1.5 text-xs text-[#c6cebf] pl-1 pt-1">
                            <ArrowRight className="w-3.5 h-3.5 text-[#c89b3c] shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-[#e2c77d]">Useful response: </strong>
                              {item.reframed}
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteDichotomy(item.id)}
                        className="p-1 text-[#667264] hover:text-red-400 transition-colors"
                        aria-label={`Delete ${item.text}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dichotomy Ratio & Principle Card */}
          <div className="space-y-4">
            <div className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#c89b3c]">
                Balance of Perspective
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#cad1c7]">
                  <span>Within Control ({dichotomyStats.within})</span>
                  <span>{dichotomyStats.withinRatio}%</span>
                </div>
                <div className="w-full bg-[#121412] h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{ width: `${dichotomyStats.withinRatio}%` }}
                  />
                  <div
                    className="bg-stone-600 h-full transition-all"
                    style={{ width: `${dichotomyStats.outsideRatio}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#cad1c7]">
                  <span>Outside Control ({dichotomyStats.outside})</span>
                  <span>{dichotomyStats.outsideRatio}%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#252c25] text-xs text-[#8c988a] space-y-1.5">
                <p>
                  <strong>Within:</strong> Your judgment, intentions, desires, impulses, and actions.
                </p>
                <p>
                  <strong>Outside:</strong> Body, property, reputation, external outcomes, and public office.
                </p>
              </div>
            </div>

            {/* Midday Memento Mori Pause */}
            <div className="bg-gradient-to-b from-[#1b201b] to-[#141714] border border-[#2c352c] rounded-xl p-5 space-y-3 text-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
                MIDDAY MEMENTO MORI PAUSE
              </span>
              <p className="text-xs text-[#cad2c6]">
                Take 60 seconds of complete stillness. Strip away imaginary urgencies.
              </p>

              <div className="font-serif text-3xl font-bold text-[#e6c875]">
                00:{String(timerSeconds).padStart(2, '0')}
              </div>

              <div className="flex justify-center gap-2 pt-1">
                {!timerActive ? (
                  <button
                    type="button"
                    onClick={() => setTimerActive(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c89b3c] hover:bg-[#d8ab4c] text-[#121412] text-xs font-semibold rounded-md transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Begin 1-Min Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTimerActive(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#283228] text-[#e4e7e2] text-xs rounded-md"
                  >
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTimerActive(false);
                    setTimerSeconds(60);
                  }}
                  className="p-1.5 text-[#869284] hover:text-[#e4e7e2]"
                  aria-label="Reset pause timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 / EVENING REFLECTION & SENECA'S SELF-AUDIT */}
      <section aria-labelledby="heading-evening" className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#242b24] pb-2">
          <div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
              03 / EVENING PRACTICE
            </p>
            <h2 id="heading-evening" className="text-2xl font-serif font-bold text-[#f0f3ee]">
              Seneca's Nightly Audit
            </h2>
            <p className="text-xs text-[#8c988a]">
              "When the light is removed, I examine the whole of my day and retrace what I've said and done."
            </p>
          </div>
          <span className="font-serif text-3xl text-[#364036] font-bold">03</span>
        </div>

        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-6">
          {/* Seneca's 3 Questions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="self-audit-well" className="block text-xs font-semibold text-[#8ce09a]">
                1. What went well today?
              </label>
              <textarea
                id="self-audit-well"
                rows={3}
                value={reflection.self_audit_well}
                onChange={(e) =>
                  onUpdateReflection({ ...reflection, self_audit_well: e.target.value })
                }
                placeholder="Where did you act with composure, kindness, or craft?"
                className="w-full bg-[#121512] border border-[#283028] rounded-lg p-2.5 text-xs text-[#e4e7e2] placeholder-[#5a6458] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="self-audit-short" className="block text-xs font-semibold text-[#e89086]">
                2. Where did I fall short?
              </label>
              <textarea
                id="self-audit-short"
                rows={3}
                value={reflection.self_audit_short}
                onChange={(e) =>
                  onUpdateReflection({ ...reflection, self_audit_short: e.target.value })
                }
                placeholder="Examine without harshness: impatience, distraction, indulgence?"
                className="w-full bg-[#121512] border border-[#283028] rounded-lg p-2.5 text-xs text-[#e4e7e2] placeholder-[#5a6458] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="lessons-learned" className="block text-xs font-semibold text-[#e6c875]">
                3. What will I improve tomorrow?
              </label>
              <textarea
                id="lessons-learned"
                rows={3}
                value={reflection.lessonsLearned}
                onChange={(e) =>
                  onUpdateReflection({ ...reflection, lessonsLearned: e.target.value })
                }
                placeholder="One concrete adjustment for tomorrow's practice."
                className="w-full bg-[#121512] border border-[#283028] rounded-lg p-2.5 text-xs text-[#e4e7e2] placeholder-[#5a6458] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>
          </div>

          {/* Habit Curbed & Serenity Rating */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#252c25]">
            <div className="space-y-1.5">
              <label htmlFor="habit-curbed" className="block text-xs font-semibold text-[#dce1da]">
                Impulsive Moment Resisted or Habit Curbed
              </label>
              <input
                id="habit-curbed"
                type="text"
                value={reflection.habitCurbed}
                onChange={(e) =>
                  onUpdateReflection({ ...reflection, habitCurbed: e.target.value })
                }
                placeholder="e.g. Resisted checking phone during family dinner, avoided angry retort"
                className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[#dce1da]">
                  Day's Serenity & Composure Rating
                </label>
                <span className="text-xs text-[#e6c875] font-bold">
                  {reflection.serenityRating} / 5
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={reflection.serenityRating}
                onChange={(e) =>
                  onUpdateReflection({ ...reflection, serenityRating: Number(e.target.value) })
                }
                className="w-full accent-[#c89b3c] bg-[#1a1f1a] rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#717c6f]">
                <span>1: Agitated</span>
                <span>3: Moderate</span>
                <span>5: Deep Equanimity</span>
              </div>
            </div>
          </div>

          {/* Daily Wins & Milestones */}
          <div className="space-y-3 pt-2 border-t border-[#252c25]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#dce1da] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#c89b3c]" />
                  Daily Wins & Quiet Victories
                </h4>
                <p className="text-[11px] text-[#7e8a7c]">
                  Small steps in alignment with your character.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddWin} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Listened completely to a colleague without interrupting"
                value={newWinText}
                onChange={(e) => setNewWinText(e.target.value)}
                className="flex-1 bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-[#283228] hover:bg-[#344034] text-[#e6c875] text-xs font-semibold transition-colors"
              >
                Log Win
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1">
              {reflection.dailyWins && reflection.dailyWins.length > 0 ? (
                reflection.dailyWins.map((win, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1d231d] border border-[#2c362c] text-xs text-[#dce1da]"
                  >
                    <span>✳ {win}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteWin(idx)}
                      className="text-[#687466] hover:text-red-400"
                      aria-label={`Remove win ${win}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-[11px] text-[#707c6f] italic">
                  No quiet wins logged yet today.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
