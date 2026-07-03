export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 text-stone-900">
      <div className="max-w-sm w-full space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Recruitment Coordination Committee (Batch of 2029)</h1>
          <p className="text-xs font-medium text-stone-400 mt-2">Election Portal</p>
        </div>

        <div className="space-y-3">
          <a href="/vote" className="block w-full py-4 bg-[#800000] text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-black transition">
            Cast Ballot
          </a>
          <a href="/tracker" className="block w-full py-4 bg-stone-100 text-stone-900 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-stone-200 transition">
            View Live Tracker
          </a>
        </div>
      </div>
    </div>
  );
}