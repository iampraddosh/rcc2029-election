'use client';
import { useEffect, useState } from 'react';

export default function UnifiedNominationForm() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    rollNo: '',
    emailId: '',
    mobileNo: '',
    availReservation: '',
    availWomen: '',
    agreedNomination: false,
    agreedReservation: false,
  });

  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  // Check master switch status only after mounting on the client side
  useEffect(() => {
    async function checkWindow() {
      try {
        const res = await fetch(`${window.location.origin}/api/config`);
        const config = await res.json();
        setIsOpen(config.nomination_open ?? false);
      } catch (err) {
        setIsOpen(false);
      }
    }
    checkWindow();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedNomination || !formData.agreedReservation) {
      alert("Please check both confirmation boxes to submit your nomination.");
      return;
    }

    setStatus({ loading: true, message: '', error: false });

    try {
      const res = await fetch('/api/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        setStatus({ loading: false, message: result.error || "Submission failed.", error: true });
      } else {
        setStatus({ loading: false, message: "Nomination successfully submitted.", error: false });
        setFormData({
          fullName: '',
          rollNo: '',
          emailId: '',
          mobileNo: '',
          availReservation: '',
          availWomen: '',
          agreedNomination: false,
          agreedReservation: false,
        });
      }
    } catch (err) {
      setStatus({ loading: false, message: "A network error occurred. Please try again.", error: true });
    }
  };

  if (isOpen === null) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-stone-400 font-sans text-xs flex items-center justify-center">
        Syncing system parameters...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-stone-900 font-sans antialiased flex flex-col justify-between selection:bg-[#800000] selection:text-white">
      <div className="w-full h-1.5 bg-[#800000]" />

      <main className="w-full max-w-xl mx-auto px-6 py-12 md:py-20 grow">
        
        <header className="mb-12 space-y-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 uppercase">
            RCC Nomination Form
          </h1>
          <div className="h-px bg-stone-200 w-12 pt-1" />
        </header>

        {!isOpen ? (
          <div className="border border-dashed border-stone-200 rounded-xl p-12 text-center text-xs text-stone-400 font-medium">
            The formal nomination period has concluded or is currently closed by the Election Commission.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1: Core Profile */}
            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#800000] border-b border-stone-100 pb-2">
                01 / Personal Particulars
              </h2>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-stone-500 uppercase">Full Name</label>
                  <input 
                    type="text" required value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="e.g., Praddosh S M"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm transition-all focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-stone-500 uppercase">Roll Number</label>
                  <input 
                    type="text" required value={formData.rollNo}
                    onChange={e => setFormData({...formData, rollNo: e.target.value})}
                    placeholder="e.g., 24BBA01"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm transition-all focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-stone-500 uppercase">Institutional Email</label>
                  <input 
                    type="email" required value={formData.emailId}
                    onChange={e => setFormData({...formData, emailId: e.target.value})}
                    placeholder="username24@nludelhi.ac.in"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm transition-all focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold tracking-wider text-stone-500 uppercase">Mobile Number</label>
                  <input 
                    type="tel" required value={formData.mobileNo}
                    onChange={e => setFormData({...formData, mobileNo: e.target.value})}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm transition-all focus:bg-white focus:border-[#800000] focus:ring-1 focus:ring-[#800000] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <input 
                  type="checkbox" id="nominationDecl" required checked={formData.agreedNomination}
                  onChange={e => setFormData({...formData, agreedNomination: e.target.checked})}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 bg-white text-[#800000] focus:ring-0 accent-[#800000] cursor-pointer"
                />
                <label htmlFor="nominationDecl" className="text-xs text-stone-600 font-medium select-none cursor-pointer leading-relaxed">
                  I hereby formally submit my nomination for election to the Recruitment Coordination Committee (RCC).
                </label>
              </div>
            </div>

            {/* Section 2: Confidential Reservation Status */}
            <div className="space-y-6 pt-4 border-t border-stone-200/60">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#800000] border-b border-stone-100 pb-2">
                02 / Confidential Attributes
              </h2>

              <div className="bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-lg text-[11px] text-amber-900 leading-relaxed font-medium">
                <strong>Notice:</strong> Information declared below remains strictly confidential to the Election Commission and will not be displayed on any public dashboard.
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700 leading-snug">
                  Do you wish to avail reservation under any of the Reserved Categories recognised under the RCC Election Rules?
                </label>
                <p className="text-[10px] text-stone-400 italic font-medium">
                  Categories: SC, ST, OBC, EWS, PwD, LGBTQ+, Kashmiri Migrants, North-East Students.
                </p>
                
                <div className="flex space-x-4 pt-1">
                  <label className="flex items-center text-sm text-stone-700 cursor-pointer select-none">
                    <input 
                      type="radio" name="availReservation" value="Yes" required 
                      checked={formData.availReservation === 'Yes'} 
                      onChange={e => setFormData({...formData, availReservation: e.target.value})} 
                      className="h-4 w-4 border-stone-300 text-[#800000] focus:ring-0 accent-[#800000]" 
                    />
                    <span className="ml-2 text-xs font-semibold">Yes</span>
                  </label>
                  <label className="flex items-center text-sm text-stone-700 cursor-pointer select-none">
                    <input 
                      type="radio" name="availReservation" value="No" 
                      checked={formData.availReservation === 'No'} 
                      onChange={e => setFormData({...formData, availReservation: e.target.value})} 
                      className="h-4 w-4 border-stone-300 text-[#800000] focus:ring-0 accent-[#800000]" 
                    />
                    <span className="ml-2 text-xs font-semibold">No</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700">
                  Do you wish to be considered for a seat reserved for women?
                </label>
                
                <div className="flex space-x-4 pt-1">
                  <label className="flex items-center text-sm text-stone-700 cursor-pointer select-none">
                    <input 
                      type="radio" name="availWomen" value="Yes" required 
                      checked={formData.availWomen === 'Yes'} 
                      onChange={e => setFormData({...formData, availWomen: e.target.value})} 
                      className="h-4 w-4 border-stone-300 text-[#800000] focus:ring-0 accent-[#800000]" 
                    />
                    <span className="ml-2 text-xs font-semibold">Yes</span>
                  </label>
                  <label className="flex items-center text-sm text-stone-700 cursor-pointer select-none">
                    <input 
                      type="radio" name="availWomen" value="No" 
                      checked={formData.availWomen === 'No'} 
                      onChange={e => setFormData({...formData, availWomen: e.target.value})} 
                      className="h-4 w-4 border-stone-300 text-[#800000] focus:ring-0 accent-[#800000]" 
                    />
                    <span className="ml-2 text-xs font-semibold">No</span>
                  </label>
                </div>
              </div>

              <div className="flex items-start space-x-3 border-t border-stone-100 pt-5">
                <input 
                  type="checkbox" id="reservationDecl" required checked={formData.agreedReservation}
                  onChange={e => setFormData({...formData, agreedReservation: e.target.checked})}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 bg-white text-[#800000] focus:ring-0 accent-[#800000] cursor-pointer"
                />
                <label htmlFor="reservationDecl" className="text-[10px] font-medium text-stone-400 select-none cursor-pointer leading-relaxed">
                  I declare that the information furnished in this form is true and correct to the best of my knowledge.
                </label>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-4 pt-2">
              <button 
                type="submit" disabled={status.loading}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3 px-4 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-150 active:scale-[0.99] disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
              >
                {status.loading ? 'Submitting...' : 'Submit Nomination'}
              </button>

              {status.message && (
                <div className={`p-3.5 rounded-lg text-xs font-bold tracking-wide text-center border transition-all duration-200 ${
                  status.error 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  {status.message}
                </div>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}