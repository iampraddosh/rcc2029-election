export default function Concluded() {
  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/nlu-delhi-campus.jpg')" }} // Ensure this image is in your /public folder
      />

      {/* Red Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-linear-to-br from-[#800000]/90 to-stone-900/90" />

      {/* Content Container */}
      <div className="relative z-20 text-center space-y-6 px-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            RCC Elections 2026 for RCC 2029 (2026-27)
          </h1>
          <p className="text-stone-300 font-medium tracking-widest uppercase text-xs">
            Election Cycle Concluded
          </p>
        </div>

        <div className="h-px w-16 bg-white/30 mx-auto" />

        <p className="text-stone-200 text-sm max-w-sm mx-auto leading-relaxed">
          The electoral process for the 2026-2027 term has officially ended. 
          The Election Commission thanks the batch of 2029 for its active participation. 
          We look forward to reconvening for the 2027 cycle.
        </p>

        <div className="pt-8">
           <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
             Office of the Election Commission
           </span>
        </div>
      </div>
    </div>
  );
}