export default function Stats({ applications }) {
  const totalApplied = applications.length;
  const inProgress = applications.filter(a => !['Rejected', 'Offer'].includes(a.status)).length;
  const offers = applications.filter(a => a.status === 'Offer').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;
  const rejectionRate = totalApplied > 0 ? Math.round((rejected / totalApplied) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Applied */}
      <div className="glass-panel glass-panel-hover p-6 rounded-3xl flex justify-between items-start transition-all">
        <div>
          <p className="text-theme-subtitle text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">Total Applied</p>
          <p className="text-xs text-theme-muted">All time</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2 border border-blue-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <span className="text-3xl font-extrabold text-theme-title">{totalApplied}</span>
        </div>
      </div>

      {/* In Progress */}
      <div className="glass-panel glass-panel-hover p-6 rounded-3xl flex justify-between items-start transition-all">
        <div>
          <p className="text-theme-subtitle text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">In Progress</p>
          <p className="text-xs text-theme-muted">Across all stages</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2 border border-purple-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
             <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-3xl font-extrabold text-theme-title">{inProgress}</span>
        </div>
      </div>

      {/* Offers */}
      <div className="glass-panel glass-panel-hover p-6 rounded-3xl flex justify-between items-start transition-all relative overflow-hidden">
        {offers > 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>}
        <div className="relative z-10">
          <p className="text-theme-subtitle text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">Offers</p>
          <p className="text-xs text-theme-muted">Total received</p>
        </div>
        <div className="flex flex-col items-end relative z-10">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-2 border border-green-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
             <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-3xl font-extrabold text-theme-title">{offers}</span>
        </div>
      </div>

      {/* Rejected */}
      <div className="glass-panel glass-panel-hover p-6 rounded-3xl flex justify-between items-start transition-all">
        <div>
          <p className="text-theme-subtitle text-sm font-medium mb-1 uppercase tracking-wider text-[11px]">Rejected</p>
          <p className="text-xs text-theme-muted">{rejectionRate}% rejection rate</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-2 border border-red-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span className="text-3xl font-extrabold text-theme-title">{rejected}</span>
        </div>
      </div>
    </div>
  );
}
