import React, { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight, Eye, Lock, Users } from 'lucide-react';
import {
  formatDisplayDate,
  type DailyReflectionData,
  type UserAccount,
} from '../utils/stoicLogic';

interface AdminDashboardProps {
  currentUser: UserAccount;
  allUsers: UserAccount[];
  onLoadReflections: (userId: string) => Promise<Record<string, DailyReflectionData>>;
}

export function AdminDashboard({
  currentUser,
  allUsers,
  onLoadReflections,
}: AdminDashboardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Record<string, DailyReflectionData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedUser = allUsers.find((user) => user.uid === selectedUserId);

  useEffect(() => {
    if (!selectedUserId) {
      setReflections({});
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    onLoadReflections(selectedUserId)
      .then((result) => {
        if (active) setReflections(result);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load reflections.');
          setReflections({});
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedUserId, onLoadReflections]);

  if (currentUser.role !== 'admin') {
    return (
      <section className="mx-auto my-12 max-w-lg rounded-2xl border border-red-800/40 bg-[#171b17] p-8 text-center">
        <Lock className="mx-auto mb-3 h-8 w-8 text-red-400" />
        <h2 className="font-serif text-xl font-bold text-[#f0f3ee]">Administrator access only</h2>
        <p className="mt-2 text-sm text-[#a4b1a2]">
          This area is restricted to the configured administrator account.
        </p>
      </section>
    );
  }

  const dates = Object.keys(reflections).sort((a, b) => b.localeCompare(a));

  return (
    <section className="space-y-6 pb-12">
      <header className="flex items-center gap-3">
        <div className="rounded-xl border border-[#c89b3c]/40 bg-[#c89b3c]/10 p-3 text-[#e6c875]">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#f0f3ee]">Consenting practitioners</h1>
          <p className="text-sm text-[#8e9a8b]">
            Only accounts with explicit mentorship consent are listed.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.4fr)]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8e9a8b]">
            {allUsers.length} consenting account{allUsers.length === 1 ? '' : 's'}
          </p>
          {allUsers.map((user) => (
            <button
              key={user.uid}
              type="button"
              onClick={() => setSelectedUserId(user.uid)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                selectedUserId === user.uid
                  ? 'border-[#c89b3c]/50 bg-[#222822] text-[#e6c875]'
                  : 'border-[#2b342b] bg-[#171b17] text-[#dce1da] hover:border-[#536052]'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{user.displayName}</span>
                <span className="block truncate text-xs text-[#8e9a8b]">{user.email}</span>
              </span>
              <ChevronRight className="ml-3 h-4 w-4 shrink-0" />
            </button>
          ))}
          {allUsers.length === 0 && (
            <p className="rounded-xl border border-[#2b342b] bg-[#171b17] p-4 text-sm text-[#8e9a8b]">
              No users have opted in yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#2b342b] bg-[#171b17] p-5">
          {selectedUser ? (
            <>
              <div className="mb-5 flex items-start gap-3 border-b border-[#2b342b] pb-4">
                <Eye className="mt-1 h-5 w-5 shrink-0 text-[#c89b3c]" />
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#f0f3ee]">
                    Reflections for {selectedUser.displayName}
                  </h2>
                  <p className="text-xs text-[#8e9a8b]">{selectedUser.email}</p>
                </div>
              </div>

              {loading && <p className="text-sm text-[#8e9a8b]">Loading reflections…</p>}
              {error && (
                <p role="alert" className="flex items-start gap-2 text-sm text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}
              {!loading && !error && dates.length === 0 && (
                <p className="text-sm text-[#8e9a8b]">No saved reflections.</p>
              )}
              <div className="space-y-4">
                {dates.map((date) => {
                  const reflection = reflections[date];
                  return (
                    <article key={date} className="rounded-xl border border-[#2b342b] bg-[#121512] p-4">
                      <h3 className="mb-2 text-xs font-semibold text-[#e6c875]">
                        {formatDisplayDate(date)}
                      </h3>
                      {reflection.morningIntentions && (
                        <p className="mb-2 whitespace-pre-wrap text-sm text-[#dce1da]">
                          {reflection.morningIntentions}
                        </p>
                      )}
                      {reflection.eveningReflection && (
                        <p className="whitespace-pre-wrap text-sm text-[#a4b1a2]">
                          {reflection.eveningReflection}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#8e9a8b]">Select a consenting practitioner to view their saved reflections.</p>
          )}
        </div>
      </div>
    </section>
  );
}
