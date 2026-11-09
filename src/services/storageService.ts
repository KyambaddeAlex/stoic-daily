import {
  type DailyReflectionData,
  type StoicQuote,
  type UserAccount,
  type CommunityBroadcast,
  type ExpenseItem,
} from '../utils/stoicLogic';
import {
  INITIAL_QUOTES,
  INITIAL_BROADCAST,
  INITIAL_MAXIMS,
} from '../data/seedData';
import { db, auth, updateProfile, type User } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const KEYS = {
  REFLECTIONS: 'stoic_daily_reflections',
  QUOTES: 'stoic_daily_quotes',
  FEATURED_QUOTE_ID: 'stoic_daily_featured_quote_id',
  BROADCAST: 'stoic_daily_broadcast',
  EXPENSES: 'stoic_daily_expenses',
  MONTHLY_BUDGET: 'stoic_daily_monthly_budget',
  MAXIMS: 'stoic_daily_maxims',
  AUDIT_LOGS: 'stoic_daily_audit_logs',
};

const USER_SCOPED_KEYS = new Set([
  KEYS.REFLECTIONS,
  KEYS.QUOTES,
  KEYS.FEATURED_QUOTE_ID,
  KEYS.BROADCAST,
  KEYS.EXPENSES,
  KEYS.MONTHLY_BUDGET,
  KEYS.MAXIMS,
  KEYS.AUDIT_LOGS,
]);

const ADMIN_ACCESS_CONSENT_VERSION = 'admin-read-v1';
const ADMIN_EMAIL = 'kyambaddealex55@gmail.com';

function storageKey(key: string): string {
  return USER_SCOPED_KEYS.has(key)
    ? `${key}:${auth.currentUser?.uid ?? 'signed-out'}`
    : key;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details: string;
}

export function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(storageKey(KEYS.QUOTES))) {
    localStorage.setItem(storageKey(KEYS.QUOTES), JSON.stringify(INITIAL_QUOTES));
  }

  if (!localStorage.getItem(storageKey(KEYS.BROADCAST))) {
    localStorage.setItem(storageKey(KEYS.BROADCAST), JSON.stringify(INITIAL_BROADCAST));
  }

  if (!localStorage.getItem(storageKey(KEYS.EXPENSES))) {
    localStorage.setItem(storageKey(KEYS.EXPENSES), JSON.stringify([]));
  }

  if (!localStorage.getItem(storageKey(KEYS.MONTHLY_BUDGET))) {
    localStorage.setItem(storageKey(KEYS.MONTHLY_BUDGET), '800');
  }

  if (!localStorage.getItem(storageKey(KEYS.MAXIMS))) {
    localStorage.setItem(storageKey(KEYS.MAXIMS), JSON.stringify(INITIAL_MAXIMS));
  }

}

// ---------------------- REFLECTIONS ----------------------

export function getReflections(): Record<string, DailyReflectionData> {
  try {
    const raw = localStorage.getItem(storageKey(KEYS.REFLECTIONS));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveReflections(data: Record<string, DailyReflectionData>) {
  localStorage.setItem(storageKey(KEYS.REFLECTIONS), JSON.stringify(data));
}

export function getReflectionForDate(dateKey: string): DailyReflectionData {
  const all = getReflections();
  if (all[dateKey]) {
    return all[dateKey];
  }
  return {
    date: dateKey,
    morningIntentions: '',
    anticipatedChallenge: '',
    ambitions: [],
    dichotomyItems: [],
    eveningReflection: '',
    self_audit_well: '',
    self_audit_short: '',
    lessonsLearned: '',
    habitCurbed: '',
    dailyWins: [],
    serenityRating: 4,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveReflectionForDate(data: DailyReflectionData): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in before saving a reflection.');

  const updatedData = {
    ...data,
    userId: user.uid,
    updatedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', user.uid, 'reflections', data.date), updatedData);

  const all = getReflections();
  all[data.date] = updatedData;
  saveReflections(all);
}

export async function saveUserConsent(user: User, displayName?: string): Promise<UserAccount> {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);
  const now = new Date().toISOString();
  const name = displayName?.trim() || user.displayName || user.email?.split('@')[0] || 'Stoic Practitioner';
  const createdAt = existing.data()?.createdAt || now;
  const role = user.email?.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'practitioner';

  if (name !== user.displayName) await updateProfile(user, { displayName: name });

  await setDoc(userRef, {
    uid: user.uid,
    email: user.email || '',
    displayName: name,
    role,
    createdAt,
    lastActive: now,
    adminAccessConsentVersion: ADMIN_ACCESS_CONSENT_VERSION,
  }, { merge: true });

  await setDoc(doc(db, 'adminDirectory', user.uid), {
    email: user.email || '',
    displayName: name,
    createdAt,
    updatedAt: now,
  });

  return {
    uid: user.uid,
    email: user.email || '',
    displayName: name,
    role,
    joinedAt: createdAt,
    streakCount: 0,
    lastActive: now,
    adminConsentAccepted: true,
    reflectionCount: 0,
  };
}

export async function getConsentedUser(user: User): Promise<UserAccount | null> {
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  const data = snapshot.data();
  if (data?.adminAccessConsentVersion !== ADMIN_ACCESS_CONSENT_VERSION) return null;

  const joinedAt = typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString();
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: typeof data.displayName === 'string'
      ? data.displayName
      : user.displayName || user.email?.split('@')[0] || 'Stoic Practitioner',
    role: user.email?.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'practitioner',
    joinedAt,
    streakCount: Number(data.streakCount) || 0,
    lastActive: new Date().toISOString(),
    adminConsentAccepted: true,
    reflectionCount: Number(data.reflectionCount) || 0,
  };
}

export async function loadUserReflections(userId: string): Promise<Record<string, DailyReflectionData>> {
  const snapshot = await getDocs(collection(db, 'users', userId, 'reflections'));
  const reflections = Object.fromEntries(
    snapshot.docs.map((reflection) => [
      reflection.id,
      { ...reflection.data(), date: reflection.id } as DailyReflectionData,
    ])
  );

  if (auth.currentUser?.uid === userId) saveReflections(reflections);
  return reflections;
}

export async function loadAdminDirectory(): Promise<UserAccount[]> {
  if (auth.currentUser?.email?.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error('Only the configured administrator can read the user directory.');
  }

  const snapshot = await getDocs(collection(db, 'adminDirectory'));
  return snapshot.docs.map((entry) => {
    const data = entry.data();
    const joinedAt = typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString();
    const email = typeof data.email === 'string' ? data.email : '';
    return {
      uid: entry.id,
      email,
      displayName: typeof data.displayName === 'string' ? data.displayName : 'Stoic Practitioner',
      role: email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'practitioner',
      joinedAt,
      streakCount: 0,
      lastActive: typeof data.updatedAt === 'string' ? data.updatedAt : joinedAt,
      adminConsentAccepted: true,
      reflectionCount: 0,
    };
  });
}

// ---------------------- QUOTES (CMS) ----------------------

export function getQuotes(): StoicQuote[] {
  try {
    const raw = localStorage.getItem(storageKey(KEYS.QUOTES));
    return raw ? JSON.parse(raw) : INITIAL_QUOTES;
  } catch {
    return INITIAL_QUOTES;
  }
}

export function saveQuotes(quotes: StoicQuote[]) {
  localStorage.setItem(storageKey(KEYS.QUOTES), JSON.stringify(quotes));
}

export function addQuote(quote: Omit<StoicQuote, 'id'>): StoicQuote {
  const quotes = getQuotes();
  const newQuote: StoicQuote = {
    ...quote,
    id: `q-${Date.now()}`,
    custom: true,
  };
  quotes.unshift(newQuote);
  saveQuotes(quotes);
  logAdminAction('Added Quote', `Added quote by ${quote.author}: "${quote.text.slice(0, 40)}..."`);
  return newQuote;
}

export function updateQuote(updated: StoicQuote) {
  const quotes = getQuotes().map((q) => (q.id === updated.id ? updated : q));
  saveQuotes(quotes);
  logAdminAction('Updated Quote', `Modified quote ${updated.id} by ${updated.author}`);
}

export function deleteQuote(id: string) {
  const quotes = getQuotes().filter((q) => q.id !== id);
  saveQuotes(quotes);
  logAdminAction('Deleted Quote', `Deleted quote id ${id}`);
}

export function getFeaturedQuoteId(): string | null {
  return localStorage.getItem(storageKey(KEYS.FEATURED_QUOTE_ID));
}

export function setFeaturedQuoteId(id: string | null) {
  if (id) {
    localStorage.setItem(storageKey(KEYS.FEATURED_QUOTE_ID), id);
    logAdminAction('Featured Quote', `Set quote ${id} as featured thought of the day`);
  } else {
    localStorage.removeItem(storageKey(KEYS.FEATURED_QUOTE_ID));
  }
}

export function getTodayQuote(): StoicQuote {
  const featuredId = getFeaturedQuoteId();
  const quotes = getQuotes();
  if (featuredId) {
    const found = quotes.find((q) => q.id === featuredId);
    if (found) return found;
  }

  // Deterministic daily rotation
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % quotes.length;
  return quotes[index] || INITIAL_QUOTES[0];
}

// ---------------------- USERS & ADMIN DIRECTORY ----------------------

export async function updateUserProfile(profile: Partial<UserAccount>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in before updating your profile.');

  const displayName = profile.displayName?.trim();
  if (!displayName) throw new Error('Display name cannot be empty.');

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);
  const now = new Date().toISOString();
  const createdAt = snapshot.data()?.createdAt || now;

  await updateProfile(user, { displayName });
  await setDoc(userRef, {
    displayName,
    updatedAt: now,
    adminAccessConsentVersion: ADMIN_ACCESS_CONSENT_VERSION,
  }, { merge: true });
  await setDoc(doc(db, 'adminDirectory', user.uid), {
    email: user.email || '',
    displayName,
    createdAt,
    updatedAt: now,
  });
}

// ---------------------- COMMUNITY BROADCAST ----------------------

export function getBroadcast(): CommunityBroadcast {
  try {
    const raw = localStorage.getItem(storageKey(KEYS.BROADCAST));
    return raw ? JSON.parse(raw) : INITIAL_BROADCAST;
  } catch {
    return INITIAL_BROADCAST;
  }
}

export function saveBroadcast(broadcast: CommunityBroadcast) {
  localStorage.setItem(storageKey(KEYS.BROADCAST), JSON.stringify(broadcast));
  logAdminAction('Broadcast Updated', `Updated community announcement: "${broadcast.title}"`);
}

// ---------------------- MINDFUL EXPENSES ----------------------

export function getExpenses(): ExpenseItem[] {
  try {
    const raw = localStorage.getItem(storageKey(KEYS.EXPENSES));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: ExpenseItem[]) {
  localStorage.setItem(storageKey(KEYS.EXPENSES), JSON.stringify(expenses));
}

export function addExpense(expense: Omit<ExpenseItem, 'id'>): ExpenseItem {
  const expenses = getExpenses();
  const newExp: ExpenseItem = {
    ...expense,
    id: `exp-${Date.now()}`,
  };
  expenses.unshift(newExp);
  saveExpenses(expenses);
  return newExp;
}

export function deleteExpense(id: string) {
  const expenses = getExpenses().filter((e) => e.id !== id);
  saveExpenses(expenses);
}

export function getMonthlyBudget(): number {
  const raw = localStorage.getItem(storageKey(KEYS.MONTHLY_BUDGET));
  return raw ? Number(raw) || 800 : 800;
}

export function saveMonthlyBudget(amount: number) {
  localStorage.setItem(storageKey(KEYS.MONTHLY_BUDGET), String(amount));
}

// ---------------------- MAXIMS ----------------------

export function getMaxims(): { id: string; principle: string; explanation: string }[] {
  try {
    const raw = localStorage.getItem(storageKey(KEYS.MAXIMS));
    return raw ? JSON.parse(raw) : INITIAL_MAXIMS;
  } catch {
    return INITIAL_MAXIMS;
  }
}

export function saveMaxims(maxims: { id: string; principle: string; explanation: string }[]) {
  localStorage.setItem(storageKey(KEYS.MAXIMS), JSON.stringify(maxims));
}

export function addMaxim(principle: string, explanation: string) {
  const maxims = getMaxims();
  maxims.push({ id: `max-${Date.now()}`, principle, explanation });
  saveMaxims(maxims);
}

// ---------------------- AUDIT LOGS ----------------------

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(KEYS.AUDIT_LOGS));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logAdminAction(action: string, details: string) {
  const currentUser = auth.currentUser;
  const logs = getAuditLogs();
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    adminEmail: currentUser?.email || '',
    action,
    details,
  };
  logs.unshift(entry);
  // Keep last 100 entries
  localStorage.setItem(storageKey(KEYS.AUDIT_LOGS), JSON.stringify(logs.slice(0, 100)));
}

// ---------------------- DATABASE EXPORT & RESET ----------------------

export function exportFullDatabase(): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    reflections: getReflections(),
    quotes: getQuotes(),
    users: auth.currentUser
      ? [{
          uid: auth.currentUser.uid,
          email: auth.currentUser.email || '',
          displayName: auth.currentUser.displayName || '',
        }]
      : [],
    broadcast: getBroadcast(),
    expenses: getExpenses(),
    maxims: getMaxims(),
    auditLogs: getAuditLogs(),
  };
  return JSON.stringify(payload, null, 2);
}

export function resetToSeedData() {
  for (const key of USER_SCOPED_KEYS) localStorage.removeItem(storageKey(key));
  initializeStorage();
  logAdminAction('System Reset', 'Reset all local storage to original seed defaults.');
}
