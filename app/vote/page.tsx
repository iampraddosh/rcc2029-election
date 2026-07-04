'use client';
import { useEffect, useState } from 'react';

interface Candidate {
  full_name: string;
  roll_no: string;
  email_id: string;
}

export default function AnonymousBallotPortal() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<string[]>([]);
  const [voterEmail, setVoterEmail] = useState('');
  const [voterToken, setVoterToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  useEffect(() => {
    async function initPortal() {
      try {
        const configRes = await fetch(`${window.location.origin}/api/config`);
        const config = await configRes.json();
        setIsOpen(config.voting_open ?? false);

        if (config.voting_open) {
          const rosterRes = await fetch(`${window.location.origin}/api/candidates`);
          const rosterData = await rosterRes.json();
          if (rosterData.candidates) setCandidates(rosterData.candidates);
        }
      } catch (err) {
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }
    initPortal();
  }, []);

  const handleSelectCandidate = (name: string) => {
    if (selectedVotes.includes(name)) {
      // Always allow unselecting a candidate
      setSelectedVotes(selectedVotes.filter(item => item !== name));
    } else {
      // Strict enforcement of the 13-seat ceiling
      if (selectedVotes.length >= 13) return;
      setSelectedVotes([...selectedVotes, name]);
    }
  };

  const handleCastBallot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterEmail || !voterToken) {
      alert("Please provide both your institutional email and access token.");
      return;
    }
    if (selectedVotes.length === 0) {
      alert("Your ballot is empty. Please select at least 1 candidate.");
      return;
    }

    const confirmVote = confirm(`Confirm Submission?\n\nYou have selected ${selectedVotes.length} candidate(s).`);
    if (!confirmVote) return;

    setStatus({ loading: true, message: '', error: false });

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: voterEmail,
          token: voterToken.toUpperCase().trim(),
          selectedCandidates: selectedVotes,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setStatus({ loading: false, message: result.error || "Ballot submission failed.", error: true });
      } else {
        setStatus({ loading: false, message: "Ballot cast successfully. Recorded anonymously.", error: false });
        setSelectedVotes([]);
        setVoterEmail('');
        setVoterToken('');
      }
    } catch (err) {
      setStatus({ loading: false, message: "A secure protocol handshake failure occurred.", error: true });
    }
  };

  if (isOpen === null || (isOpen && loading)) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-stone-400 font-sans text-xs flex items-center justify-center">
        Syncing vault credentials...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-stone-900 font-sans antialiased flex flex-col justify-between selection:bg-[#800000] selection:text-white">
      <main className="w-full max-w-xl mx-auto px-6 py-12 md:py-20 grow">
        <header className="mb-12 space-y-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase">
            Cast Anonymous Vote
          </h1>
          <div className="h-px bg-stone-200 w-12 pt-1" />
        </header>

        {!isOpen ? (
          <div className="border border-dashed border-stone-200 rounded-xl p-12 text-center text-xs text-stone-400 font-medium">
            The voting window is currently closed.
          </div>
        ) : (
          <form onSubmit={handleCastBallot} className="space-y-10">
            {/* Auth Section */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#800000] border-b border-stone-100 pb-2">
                01 / Authentication
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-stone-500 uppercase mb-1">Institutional Email ID</label>
                  <input 
                    type="email" 
                    required 
                    value={voterEmail} 
                    onChange={e => setVoterEmail(e.target.value)} 
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#800000]" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-stone-500 uppercase mb-1">Unique Access Token</label>
                  <input 
                    type="text" 
                    required 
                    value={voterToken} 
                    onChange={e => setVoterToken(e.target.value.toUpperCase())} 
                    placeholder="RCC2029-XXXXXX" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm uppercase outline-none focus:border-[#800000]" 
                  />
                </div>
              </div>
            </div>

            {/* Ballot Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-stone-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#800000]">
                  02 / Ballot Construction
                </h2>
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                  Selected: {selectedVotes.length} / 13 Seats
                </span>
              </div>

              {candidates.length === 0 ? (
                <div className="border border-dashed border-stone-200 rounded-xl p-8 text-center text-xs text-stone-400 font-medium">
                  No verified candidates.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {candidates.map((candidate, idx) => {
                    const isSelected = selectedVotes.includes(candidate.full_name);
                    // Disable option only if 13 choices are reached and this option isn't selected
                    const isFull = selectedVotes.length >= 13 && !isSelected;
                    
                    return (
                      <button
                        key={idx} 
                        type="button" 
                        disabled={isFull}
                        onClick={() => handleSelectCandidate(candidate.full_name)}
                        className={`w-full p-4 flex justify-between items-center text-sm rounded-xl border transition-all ${
                          isSelected 
                            ? 'border-[#800000] bg-[#800000]/10 font-bold' 
                            : isFull 
                              ? 'opacity-40 border-stone-100 bg-stone-50 cursor-not-allowed' 
                              : 'border-stone-200 bg-stone-50/40 hover:border-stone-300'
                        }`}
                      >
                        <span className={isSelected ? 'text-[#800000]' : 'text-stone-900'}>
                          {candidate.full_name}
                        </span>
                        <span className="font-mono text-stone-400 text-[11px]">
                          {candidate.roll_no}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={status.loading} 
              className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors disabled:opacity-50"
            >
              {status.loading ? 'Validating & Depositing...' : 'Cast Anonymous Ballot'}
            </button>

            {status.message && (
              <div className={`p-3.5 rounded-lg text-center text-xs font-bold ${status.error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
                {status.message}
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  );
}