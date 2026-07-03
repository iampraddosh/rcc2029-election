'use client';
import { useEffect, useState } from 'react';

interface Candidate {
  full_name: string;
  roll_no: string;
  email_id: string;
}

export default function PublicTracker() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [resultsDeclared, setResultsDeclared] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ cast: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const configRes = await fetch('/api/config');
        const config = await configRes.json();
        
        const res = await fetch('/api/candidates');
        const data = await res.json();
        setResultsDeclared(data.resultsDeclared || false);
        if (data.candidates) setCandidates(data.candidates);

        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // Timestamps
        const NOM_END = new Date('2026-07-04T16:00:00+05:30').getTime();
        const CONCERNS_END = new Date('2026-07-04T23:59:59+05:30').getTime();
        const VOT_END = new Date('2026-07-06T09:00:00+05:30').getTime();

        let target = NOM_END;
        let label = "Nominations Close";

        if (config.concerns_open) {
          target = CONCERNS_END;
          label = "Concerns Deadline";
        } else if (config.voting_open) {
          target = VOT_END;
          label = "Voting Closes";
        } else if (!config.nomination_open && !config.concerns_open && !config.voting_open) {
          setTimeLeft("Election Concluded");
          return;
        }

        const interval = setInterval(() => {
          const now = new Date().getTime();
          const diff = target - now;
          if (diff <= 0) {
            setTimeLeft('Window Closed');
            clearInterval(interval);
          } else {
            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft(`${label}: ${hrs}h ${mins}m`);
          }
        }, 1000);
        return () => clearInterval(interval);

      } catch (err) {
        console.error("Error syncing ledger:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-stone-900 font-sans antialiased flex flex-col justify-between">
      <main className="w-full max-w-xl mx-auto px-6 py-12 md:py-20 grow">
        <header className="mb-12 space-y-2">
          <p className="text-[10px] font-bold tracking-[0.2em] text-stone-400 uppercase">
            {resultsDeclared ? 'Official Notification' : 'Live Roster &bull; Batch of 2029'}
          </p>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase">
            {resultsDeclared ? 'Elected Representatives' : 'Received Nominations'}
          </h1>
          
          {!resultsDeclared && !loading && (
            <div className="flex gap-4 mt-6">
              <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg flex-1">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Turnout</p>
                <p className="text-sm font-black text-[#800000]">{stats.cast} / {stats.total} Voted</p>
              </div>
              <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg flex-1">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Clock</p>
                <p className="text-sm font-mono font-bold text-stone-900">{timeLeft}</p>
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <p className="text-xs font-mono text-stone-400">Syncing electoral ledger data...</p>
        ) : candidates.length === 0 ? (
          <div className="border border-dashed border-stone-200 rounded-xl p-8 text-center text-xs text-stone-400 font-medium">
            No formal records found.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-xl bg-stone-50/30 overflow-hidden">
              {candidates.map((candidate, idx) => (
                <div key={idx} className="p-4 flex justify-between items-center text-sm transition hover:bg-white">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-stone-900">{candidate.full_name}</p>
                    <p className="text-[11px] font-medium text-stone-400 font-mono">{candidate.email_id}</p>
                  </div>
                  <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded border border-stone-200/40 shrink-0">
                    {candidate.roll_no}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}