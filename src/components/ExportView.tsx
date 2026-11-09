import React from 'react';
import { ExternalLink, Github } from 'lucide-react';

export function ExportView() {
  return (
    <section className="mx-auto max-w-3xl space-y-4 pb-12">
      <div className="rounded-2xl border border-[#2b342b] bg-[#171b17] p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3 text-[#e6c875]">
          <Github className="h-6 w-6" />
          <span className="text-xs font-semibold uppercase tracking-wider">Project source</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#f0f3ee]">Stoic Daily on GitHub</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9eaaa0]">
          Browse the source code, deployment workflow, and Firebase integration in the public repository.
        </p>
        <a
          href="https://github.com/KyambaddeAlex/stoic-daily"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#c89b3c] px-4 py-2 text-sm font-semibold text-[#121412] transition-colors hover:bg-[#d8aa45]"
        >
          View source repository
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
