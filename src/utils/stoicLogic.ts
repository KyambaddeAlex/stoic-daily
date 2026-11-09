/**
 * Pure Stoic calculations, data structures, and helper functions.
 */

export type Virtue = 'wisdom' | 'courage' | 'justice' | 'temperance';

export const VIRTUES: Record<string, Virtue> = {
  WISDOM: 'wisdom',
  COURAGE: 'courage',
  JUSTICE: 'justice',
  TEMPERANCE: 'temperance',
};

export const VIRTUE_LABELS: Record<Virtue, string> = {
  wisdom: 'Wisdom',
  courage: 'Courage',
  justice: 'Justice',
  temperance: 'Temperance',
};

export const VIRTUE_DESCRIPTIONS: Record<Virtue, string> = {
  wisdom: 'Sound judgment, navigating complex situations with calm clarity.',
  courage: 'Standing firm in truth and duty; acting despite fear or discomfort.',
  justice: 'Fairness, kindness to fellow beings, and public service.',
  temperance: 'Self-control, moderation, and intentional focus over impulsive desires.',
};

export interface AmbitionItem {
  id: string;
  title: string;
  virtue: Virtue;
  priority: 'high' | 'medium' | 'low';
  actionSteps: string[];
  completed: boolean;
  createdAt: string;
}

export interface DichotomyItem {
  id: string;
  text: string;
  category: 'within' | 'outside';
  reframed: string;
  createdAt: string;
}

export interface ExpenseItem {
  id: string;
  amount: number;
  category: 'necessity' | 'growth' | 'impulse';
  description: string;
  date: string;
}

export interface StoicQuote {
  id: string;
  text: string;
  author: string;
  source: string;
  virtue?: Virtue;
  application: string;
  custom?: boolean;
}

export interface DailyReflectionData {
  date: string; // YYYY-MM-DD
  morningIntentions: string;
  anticipatedChallenge: string;
  ambitions: AmbitionItem[];
  dichotomyItems: DichotomyItem[];
  eveningReflection: string;
  self_audit_well: string;
  self_audit_short: string;
  lessonsLearned: string;
  habitCurbed: string;
  dailyWins: string[];
  serenityRating: number; // 1-5
  updatedAt: string;
}

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'mentor' | 'practitioner';
  joinedAt: string;
  streakCount: number;
  lastActive: string;
  adminConsentAccepted: boolean;
  adminNotes?: string[];
  mentorGuidance?: string;
  reflectionCount: number;
}

export interface CommunityBroadcast {
  id: string;
  title: string;
  message: string;
  type: 'notice' | 'challenge' | 'quote';
  active: boolean;
  createdAt: string;
}

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatDisplayDate(dateKey: string): string {
  if (!isValidDateKey(dateKey)) return dateKey;
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculates current streak given an array of date keys ('YYYY-MM-DD').
 */
export function calculateStreak(dates: string[], referenceDate = localDateKey()): number {
  if (!dates || dates.length === 0) return 0;

  const dateSet = new Set(dates);
  let streak = 0;

  const [refYear, refMonth, refDay] = referenceDate.split('-').map(Number);
  let curr = new Date(refYear, refMonth - 1, refDay, 12, 0, 0);

  // If today isn't logged yet, check if yesterday was logged to continue the streak
  const todayKey = localDateKey(curr);
  if (!dateSet.has(todayKey)) {
    curr.setDate(curr.getDate() - 1);
    const yesterdayKey = localDateKey(curr);
    if (!dateSet.has(yesterdayKey)) {
      return 0;
    }
  }

  // Count backwards
  while (true) {
    const key = localDateKey(curr);
    if (dateSet.has(key)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Computes distribution of virtues across ambitions.
 */
export function calculateVirtueDistribution(
  ambitions: AmbitionItem[]
): Record<Virtue, { count: number; percentage: number }> {
  const result: Record<Virtue, { count: number; percentage: number }> = {
    wisdom: { count: 0, percentage: 0 },
    courage: { count: 0, percentage: 0 },
    justice: { count: 0, percentage: 0 },
    temperance: { count: 0, percentage: 0 },
  };

  if (!ambitions || ambitions.length === 0) return result;

  for (const item of ambitions) {
    if (item.virtue && result[item.virtue]) {
      result[item.virtue].count += 1;
    }
  }

  const total = ambitions.length;
  for (const v of Object.keys(result) as Virtue[]) {
    result[v].percentage = total > 0 ? Math.round((result[v].count / total) * 100) : 0;
  }

  return result;
}

/**
 * Analyzes Dichotomy of Control items.
 */
export function analyzeDichotomy(items: DichotomyItem[]) {
  const within = items.filter((i) => i.category === 'within').length;
  const outside = items.filter((i) => i.category === 'outside').length;
  const reframedCount = items.filter((i) => i.reframed && i.reframed.trim().length > 0).length;
  const total = items.length;

  return {
    total,
    within,
    outside,
    withinRatio: total > 0 ? Math.round((within / total) * 100) : 0,
    outsideRatio: total > 0 ? Math.round((outside / total) * 100) : 0,
    reframedRate: total > 0 ? Math.round((reframedCount / total) * 100) : 0,
  };
}

/**
 * Calculates mindful spending metrics.
 */
export function calculateSpendingMetrics(expenses: ExpenseItem[], monthlyBudget = 1000) {
  let necessityTotal = 0;
  let growthTotal = 0;
  let impulseTotal = 0;

  for (const exp of expenses) {
    if (exp.category === 'necessity') necessityTotal += exp.amount;
    else if (exp.category === 'growth') growthTotal += exp.amount;
    else if (exp.category === 'impulse') impulseTotal += exp.amount;
  }

  const totalSpent = necessityTotal + growthTotal + impulseTotal;
  const intentionalSpent = necessityTotal + growthTotal;
  const intentionalRatio = totalSpent > 0 ? Math.round((intentionalSpent / totalSpent) * 100) : 100;
  const budgetRemaining = Math.max(0, monthlyBudget - totalSpent);
  const budgetUsedPercentage = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;

  return {
    totalSpent,
    necessityTotal,
    growthTotal,
    impulseTotal,
    intentionalRatio,
    budgetRemaining,
    budgetUsedPercentage,
  };
}
