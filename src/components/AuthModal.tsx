import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  LogIn,
  UserPlus,
} from 'lucide-react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '../services/firebase';
import { type UserAccount } from '../utils/stoicLogic';
import { saveUserConsent } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => Promise<void>;
  canClose: boolean;
  initialError?: string | null;
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  canClose,
  initialError,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide an email and password.');
      return;
    }

    if (!consentAccepted) {
      setError('Please accept the privacy and mentorship notice before continuing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(res.user, { displayName: displayName.trim() });
        }
        const account = await saveUserConsent(res.user, displayName);
        await onAuthSuccess(account);
      } else {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        const account = await saveUserConsent(res.user);
        await onAuthSuccess(account);
      }
      onClose();
    } catch (err: unknown) {
      console.warn('Email auth error:', err);
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Incorrect email or password.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Try signing in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#171b17] border border-[#2b352b] rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {canClose && <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#758273] hover:text-[#e4e7e2] transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full border border-[#c89b3c]/50 bg-[#1e221e] flex items-center justify-center text-[#c89b3c] font-serif font-bold text-2xl mx-auto shadow-inner">
            S
          </div>
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#c89b3c]">
            A PRACTICE, NOT A PERFORMANCE
          </p>
          <h2 id="auth-modal-title" className="text-2xl font-serif font-bold text-[#f0f3ee]">
            {mode === 'signin' ? 'Sign In to Stoic Daily' : 'Create Practitioner Account'}
          </h2>
          <p className="text-xs text-[#8e9a8c]">
            {mode === 'signin'
              ? 'Access your saved reflections, streaks, and personal virtue progress.'
              : 'Begin a calm daily practice with cloud persistence and Stoic mentorship.'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#cad2c6] mb-1">
                Your Display Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#6d796b] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Aurelius"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#121512] border border-[#283028] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#cad2c6] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6d796b] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121512] border border-[#283028] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cad2c6] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6d796b] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121512] border border-[#283028] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
              />
            </div>
          </div>

          {/* Explicit consent is required by the active Firestore rules. */}
          <label className="flex items-start gap-2 text-[11px] text-[#939f90] cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="accent-[#c89b3c] mt-0.5 rounded"
            />
            <span>
              I consent to the app administrator <strong className="text-[#e6c875]">kyambaddealex55@gmail.com</strong> viewing my email, display name, and daily reflections for mentorship. I understand my password is never visible.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#c89b3c] hover:bg-[#d8ab4c] text-[#121412] text-xs font-bold transition-colors shadow disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#121412] border-t-transparent animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-[#8e9a8b]">
          {mode === 'signin' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#e6c875] hover:underline font-semibold"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#e6c875] hover:underline font-semibold"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
