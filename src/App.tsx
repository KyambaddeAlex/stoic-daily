/**
 * Stoic Daily - Intentional Growth & Admin Hub
 * Built with React, TypeScript, Tailwind CSS, and Firebase persistence.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DailyPracticeView } from './components/DailyPracticeView';
import { HistoryView } from './components/HistoryView';
import { RoadmapView } from './components/RoadmapView';
import { SpendingView } from './components/SpendingView';
import { AdminDashboard } from './components/AdminDashboard';
import { ExportView } from './components/ExportView';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import {
  initializeStorage,
  getReflectionForDate,
  saveReflectionForDate,
  getReflections,
  getTodayQuote,
  getBroadcast,
  getConsentedUser,
  loadUserReflections,
  loadAdminDirectory,
} from './services/storageService';
import {
  auth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User,
} from './services/firebase';
import {
  localDateKey,
  type DailyReflectionData,
  type UserAccount,
} from './utils/stoicLogic';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(localDateKey());
  const [activeTab, setActiveTab] = useState<string>('practice');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [reflection, setReflection] = useState<DailyReflectionData | null>(null);
  const [allReflections, setAllReflections] = useState<Record<string, DailyReflectionData>>({});
  const [todayQuote, setTodayQuote] = useState(getTodayQuote());
  const [broadcast, setBroadcast] = useState(getBroadcast());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadSession = useCallback(async (firebaseUser: User, account?: UserAccount) => {
    const userAccount = account || await getConsentedUser(firebaseUser);
    if (!userAccount) {
      setCurrentUser(null);
      setAllUsers([]);
      setAuthError('Sign in and explicitly accept the privacy notice to continue.');
      setIsInitialized(true);
      return;
    }

    initializeStorage();
    const remoteReflections = await loadUserReflections(firebaseUser.uid);
    const todayKey = localDateKey();
    setCurrentUser(userAccount);
    setAllUsers(
      userAccount.role === 'admin'
        ? await loadAdminDirectory()
        : [userAccount]
    );
    setAllReflections(remoteReflections);
    setReflection(remoteReflections[todayKey] || getReflectionForDate(todayKey));
    setTodayQuote(getTodayQuote());
    setBroadcast(getBroadcast());
    setAuthError(null);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setAllUsers([]);
        setAllReflections({});
        setReflection(null);
        setIsInitialized(true);
        return;
      }

      void loadSession(firebaseUser).catch((error: unknown) => {
        setCurrentUser(null);
        setAuthError(error instanceof Error ? error.message : 'Unable to load your account.');
        setIsInitialized(true);
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['practice', 'history', 'roadmap', 'spending', 'admin', 'export'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    return () => unsubscribe();
  }, [loadSession]);

  // Update reflection when date changes
  const handleDateChange = useCallback((newDate: string) => {
    setCurrentDate(newDate);
    const ref = getReflectionForDate(newDate);
    setReflection(ref);
  }, []);

  // Save reflection updates
  const handleUpdateReflection = useCallback(async (updated: DailyReflectionData) => {
    try {
      await saveReflectionForDate(updated);
      setReflection(updated);
      setAllReflections(getReflections());
      showToast('Practice progress saved');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save your reflection.');
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const handleSignOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  }, []);

  const handleLoadUserReflections = useCallback(async (userId: string) => {
    return loadUserReflections(userId);
  }, []);

  const handleAuthSuccess = useCallback(async (userAccount: UserAccount) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('Authentication did not return a user.');
    await loadSession(firebaseUser, userAccount);
    showToast(`Welcome, ${userAccount.displayName}`);
  }, [loadSession]);

  const handleRefreshProfile = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    const userAccount = await getConsentedUser(firebaseUser);
    if (userAccount) setCurrentUser(userAccount);
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#121412] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#c89b3c] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser || !reflection) {
    return (
      <div className="min-h-screen bg-[#121412]">
        <AuthModal
          isOpen
          canClose={false}
          initialError={authError}
          onClose={() => undefined}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-[#121412] text-[#e4e7e2] flex flex-col font-sans selection:bg-[#c89b3c]/30 selection:text-[#f4e8cc]">
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        onDateChange={handleDateChange}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenProfile={() => setIsProfileOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'practice' && (
          <DailyPracticeView
            currentDate={currentDate}
            reflection={reflection}
            onUpdateReflection={handleUpdateReflection}
            quote={todayQuote}
            broadcast={broadcast}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            reflections={allReflections}
            onSelectDate={(date) => {
              handleDateChange(date);
              setActiveTab('practice');
            }}
          />
        )}

        {activeTab === 'roadmap' && <RoadmapView />}

        {activeTab === 'spending' && <SpendingView />}

        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            allUsers={allUsers}
            onLoadReflections={handleLoadUserReflections}
          />
        )}

        {activeTab === 'export' && <ExportView />}
      </main>

      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onRefreshUser={handleRefreshProfile}
        />
      )}

      {/* Auto-save Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 bg-[#1c221c] border border-[#3b473b] text-[#e6c875] text-xs px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-[#8ce09a]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
