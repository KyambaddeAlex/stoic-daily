import React, { useState } from 'react';
import { X, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { type UserAccount } from '../utils/stoicLogic';
import { updateUserProfile } from '../services/storageService';

interface ProfileModalProps {
  currentUser: UserAccount;
  onClose: () => void;
  onRefreshUser: () => Promise<void>;
}

export function ProfileModal({
  currentUser,
  onClose,
  onRefreshUser,
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateUserProfile({ displayName: displayName.trim() });
      await onRefreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[#171b17] border border-[#2b342b] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#738072] hover:text-[#e4e7e2] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-[#242b24] pb-4">
          <div className="w-12 h-12 rounded-full bg-[#202720] border border-[#3b473b] text-[#e6c875] flex items-center justify-center font-bold text-lg">
            {(currentUser.displayName || currentUser.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 id="profile-title" className="text-lg font-serif font-bold text-[#f0f3ee]">
              {currentUser.displayName}
            </h3>
            <p className="text-xs text-[#8c988a]">{currentUser.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#222a22] text-[#c89b3c] border border-[#2e3a2e]">
              Role: {currentUser.role}
            </span>
          </div>
        </div>

        {/* Edit Name Form */}
        <form onSubmit={handleSave} className="space-y-3">
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-800/40 bg-red-950/30 p-3 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          <div>
            <label className="block text-xs font-semibold text-[#cad2c6] mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#121512] border border-[#283028] rounded-lg px-3 py-2 text-xs text-[#e4e7e2] focus:outline-none focus:border-[#c89b3c]/60"
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            {savedSuccess ? (
              <span className="text-xs text-[#8ce09a] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            ) : <span />}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-[#c89b3c] hover:bg-[#d8ab4c] text-[#121412] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Update Profile'}
            </button>
          </div>
        </form>

        {/* Administrator Access Notice Compliance */}
        <div className="bg-[#121512] border border-[#242b24] rounded-xl p-3.5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-[#e6c875] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Privacy & Mentorship Agreement</span>
          </div>
          <p className="text-[11px] text-[#8e9a8b] leading-relaxed">
            You consented to allow the application administrator (<strong className="text-[#cad2c6]">kyambaddealex55@gmail.com</strong>) to view your email, display name, and daily Stoic reflections for mentorship. Passwords are never visible.
          </p>
          <span className="inline-block text-[10px] text-[#6d7a6b]">
            Consent Status: <strong className="text-[#8ce09a]">Accepted (v1)</strong>
          </span>
        </div>

      </div>
    </div>
  );
}
