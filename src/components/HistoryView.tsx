import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  Award,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  type DailyReflectionData,
  calculateStreak,
  calculateVirtueDistribution,
  formatDisplayDate,
  VIRTUE_LABELS,
  type Virtue,
} from '../utils/stoicLogic';

interface HistoryViewProps {
  reflections: Record<string, DailyReflectionData>;
  onSelectDate: (dateKey: string) => void;
}

export function HistoryView({ reflections, onSelectDate }: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVirtueFilter, setSelectedVirtueFilter] = useState<string>('all');
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const reflectionDates = Object.keys(reflections).sort().reverse();
  const currentStreak = calculateStreak(reflectionDates);

  // Compute total ambitions and virtue distribution across all history
  const allAmbitions = Object.values(reflections).flatMap((r) => r.ambitions || []);
  const virtueStats = calculateVirtueDistribution(allAmbitions);

  // Filtered reflections
  const filteredDates = reflectionDates.filter((dateKey) => {
    const ref = reflections[dateKey];
    if (!ref) return false;

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMorning = ref.morningIntentions?.toLowerCase().includes(q);
      const matchChallenge = ref.anticipatedChallenge?.toLowerCase().includes(q);
      const matchEvening = ref.eveningReflection?.toLowerCase().includes(q);
      const matchWell = ref.self_audit_well?.toLowerCase().includes(q);
      const matchShort = ref.self_audit_short?.toLowerCase().includes(q);
      const matchLessons = ref.lessonsLearned?.toLowerCase().includes(q);
      const matchAmbitions = ref.ambitions?.some((a) => a.title.toLowerCase().includes(q));
      const matchDichotomy = ref.dichotomyItems?.some((d) => d.text.toLowerCase().includes(q));

      if (
        !matchMorning &&
        !matchChallenge &&
        !matchEvening &&
        !matchWell &&
        !matchShort &&
        !matchLessons &&
        !matchAmbitions &&
        !matchDichotomy
      ) {
        return false;
      }
    }

    // Virtue filter check
    if (selectedVirtueFilter !== 'all') {
      const hasVirtue = ref.ambitions?.some((a) => a.virtue === selectedVirtueFilter);
      if (!hasVirtue) return false;
    }

    return true;
  });

  const toggleExpand = (dateKey: string) => {
    setExpandedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  const handleExportMarkdown = () => {
    let md = '# Stoic Daily Practice Journal\n\n';
    reflectionDates.forEach((date) => {
      const r = reflections[date];
      md += `## ${formatDisplayDate(date)}\n`;
      if (r.morningIntentions) md += `**Morning Intention:** ${r.morningIntentions}\n\n`;
      if (r.ambitions?.length) {
        md += `**Ambitions:**\n`;
        r.ambitions.forEach((a) => {
          md += `- [${a.completed ? 'x' : ' '}] (${VIRTUE_LABELS[a.virtue]}) ${a.title}\n`;
        });
        md += '\n';
      }
      if (r.dichotomyItems?.length) {
        md += `**Dichotomy of Control:**\n`;
        r.dichotomyItems.forEach((d) => {
          md += `- [${d.category.toUpperCase()}]: ${d.text} ${d.reframed ? `-> Response: ${d.reframed}` : ''}\n`;
        });
        md += '\n';
      }
      if (r.self_audit_well) md += `**What went well:** ${r.self_audit_well}\n\n`;
      if (r.self_audit_short) md += `**Where I fell short:** ${r.self_audit_short}\n\n`;
      if (r.lessonsLearned) md += `**Lessons learned:** ${r.lessonsLearned}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stoic-daily-journal-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242b24] pb-4">
        <div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
            02 / JOURNAL & ARCHIVE
          </p>
          <h2 className="text-2xl font-serif font-bold text-[#f0f3ee]">
            Your Practice History
          </h2>
          <p className="text-xs text-[#8c988a]">
            Review your consistency, lessons learned, and virtue cultivation over time.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportMarkdown}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#222822] hover:bg-[#2b332b] text-xs text-[#e6c875] border border-[#3b473b] transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export Journal (.md)
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/30">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#8e9a8b] uppercase font-semibold">Current Streak</p>
            <p className="text-2xl font-serif font-bold text-[#f0f3ee]">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </p>
          </div>
        </div>

        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-[#1f291f] text-[#c89b3c] border border-[#2c382c]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#8e9a8b] uppercase font-semibold">Total Days Recorded</p>
            <p className="text-2xl font-serif font-bold text-[#f0f3ee]">
              {reflectionDates.length}
            </p>
          </div>
        </div>

        <div className="bg-[#171b17] border border-[#283028] rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#8e9a8b] uppercase font-semibold">Total Ambitions Tracked</p>
            <p className="text-2xl font-serif font-bold text-[#f0f3ee]">
              {allAmbitions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Virtues Distribution Breakdown */}
      <div className="bg-[#171b17] border border-[#283028] rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[#c89b3c]">
          Cardinal Virtue Cultivation
        </h3>
        <p className="text-xs text-[#8d998b]">
          A balanced character cultivates all four virtues harmoniously.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {(Object.keys(virtueStats) as Virtue[]).map((v) => (
            <div key={v} className="p-3 rounded-lg bg-[#131613] border border-[#232923] space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#dce1da]">{VIRTUE_LABELS[v]}</span>
                <span className="text-[#c89b3c] font-mono">{virtueStats[v].count}</span>
              </div>
              <div className="w-full bg-[#1e231e] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#c89b3c] h-full rounded-full transition-all"
                  style={{ width: `${virtueStats[v].percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-[#717d6f]">{virtueStats[v].percentage}% of ambitions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#758172] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search past intentions, challenges, lessons, wins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161a16] border border-[#283028] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
          />
        </div>

        <select
          value={selectedVirtueFilter}
          onChange={(e) => setSelectedVirtueFilter(e.target.value)}
          className="bg-[#161a16] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#dce1da] focus:outline-none"
        >
          <option value="all">All Virtues</option>
          <option value="wisdom">Wisdom</option>
          <option value="courage">Courage</option>
          <option value="justice">Justice</option>
          <option value="temperance">Temperance</option>
        </select>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredDates.length === 0 ? (
          <div className="text-center py-12 bg-[#161a16] border border-[#252c25] rounded-xl p-8 space-y-2">
            <p className="text-sm text-[#8c988a]">No past reflections matched your search criteria.</p>
            <p className="text-xs text-[#626e60]">Begin your daily practice on the Today tab.</p>
          </div>
        ) : (
          filteredDates.map((dateKey) => {
            const entry = reflections[dateKey];
            const isExpanded = expandedDates[dateKey];

            return (
              <div
                key={dateKey}
                className="bg-[#171b17] border border-[#273027] rounded-xl overflow-hidden transition-all"
              >
                <div
                  onClick={() => toggleExpand(dateKey)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#1c221c] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-[#f0f3ee]">
                        {formatDisplayDate(dateKey)}
                      </h4>
                      {entry.serenityRating && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#252c25] text-[#e6c875] border border-[#343e34]">
                          ★ {entry.serenityRating}/5 Serenity
                        </span>
                      )}
                    </div>
                    {entry.morningIntentions && (
                      <p className="text-xs text-[#8f9b8c] line-clamp-1 italic">
                        "{entry.morningIntentions}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDate(dateKey);
                      }}
                      className="text-xs text-[#c89b3c] hover:underline flex items-center gap-1"
                    >
                      Open Day <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#758172]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#758172]" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#232a23] space-y-4 text-xs">
                    {/* Morning Intention & Challenge */}
                    {entry.morningIntentions && (
                      <div>
                        <strong className="text-[#c89b3c]">Morning Intention: </strong>
                        <span className="text-[#dce1da]">{entry.morningIntentions}</span>
                      </div>
                    )}

                    {entry.anticipatedChallenge && (
                      <div>
                        <strong className="text-[#c89b3c]">Anticipated Challenge: </strong>
                        <span className="text-[#dce1da]">{entry.anticipatedChallenge}</span>
                      </div>
                    )}

                    {/* Ambitions */}
                    {entry.ambitions && entry.ambitions.length > 0 && (
                      <div className="space-y-1">
                        <strong className="text-[#c89b3c]">Ambitions:</strong>
                        <ul className="space-y-1 pl-2">
                          {entry.ambitions.map((a) => (
                            <li key={a.id} className="text-[#cad2c6] flex items-center gap-2">
                              <span>{a.completed ? '✓' : '○'}</span>
                              <span className={a.completed ? 'line-through text-[#6e7a6c]' : ''}>
                                {a.title} ({VIRTUE_LABELS[a.virtue]})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Dichotomy Items */}
                    {entry.dichotomyItems && entry.dichotomyItems.length > 0 && (
                      <div className="space-y-1">
                        <strong className="text-[#c89b3c]">Dichotomy of Control:</strong>
                        <ul className="space-y-1 pl-2">
                          {entry.dichotomyItems.map((d) => (
                            <li key={d.id} className="text-[#cad2c6]">
                              • <strong className="text-[#a4b2a2]">{d.category === 'within' ? 'Within Control' : 'Outside Control'}: </strong>
                              {d.text} {d.reframed && `(Response: ${d.reframed})`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Evening Audit */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#232a23]">
                      {entry.self_audit_well && (
                        <div className="p-2.5 rounded bg-[#131613] border border-[#212721]">
                          <p className="font-semibold text-[#8ce09a]">What went well:</p>
                          <p className="text-[#cad2c6] mt-0.5">{entry.self_audit_well}</p>
                        </div>
                      )}
                      {entry.self_audit_short && (
                        <div className="p-2.5 rounded bg-[#131613] border border-[#212721]">
                          <p className="font-semibold text-[#e89086]">Where fell short:</p>
                          <p className="text-[#cad2c6] mt-0.5">{entry.self_audit_short}</p>
                        </div>
                      )}
                      {entry.lessonsLearned && (
                        <div className="p-2.5 rounded bg-[#131613] border border-[#212721]">
                          <p className="font-semibold text-[#e6c875]">Lessons learned:</p>
                          <p className="text-[#cad2c6] mt-0.5">{entry.lessonsLearned}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
