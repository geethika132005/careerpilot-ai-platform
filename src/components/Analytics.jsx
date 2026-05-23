import { COLUMNS } from "../App";

export default function Analytics({ applications, columns: columnsProp }) {
  const cols = columnsProp || COLUMNS;
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 glass-panel rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-20 h-20 bg-theme-subtle-bg border border-theme-border flex items-center justify-center rounded-2xl mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative z-10">
          <svg className="w-10 h-10 text-theme-subtitle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-theme-title mb-3 tracking-tight relative z-10">No Data Available</h2>
        <p className="text-theme-subtitle relative z-10 max-w-sm mx-auto">Track some applications to see your analytics dashboard populate with actionable insights.</p>
      </div>
    );
  }

  const getCount = (status) => applications.filter((a) => a.status === status).length;
  
  const stats = cols.map(col => ({
    name: col.name,
    count: getCount(col.name),
    color: col.color,
    bg: col.bg
  }));

  const maxCount = Math.max(...stats.map(s => s.count), 1);
  const total = applications.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Chart Section */}
      <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
        
        <h2 className="text-xl font-bold text-theme-title mb-10 flex items-center gap-3 tracking-tight relative z-10">
          <div className="p-2 bg-theme-subtle-bg rounded-xl border border-theme-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          Application Pipeline
        </h2>
        
        <div className="flex items-end h-64 gap-3 sm:gap-6 px-4 w-full relative z-10">
          {stats.map((stat) => {
            const heightPerc = Math.max((stat.count / maxCount) * 100, 4); // min 4% height to be visible
            const isZero = stat.count === 0;

            return (
              <div key={stat.name} className="flex-1 flex flex-col items-center gap-4">
                <span className={`text-sm font-bold ${isZero ? 'text-theme-muted' : 'text-theme-title drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]'}`}>{stat.count}</span>
                <div className="w-full h-full relative flex items-end group">
                  <div 
                    className="w-full rounded-2xl transition-all duration-700 relative overflow-hidden"
                    style={{ 
                      height: `${isZero ? 5 : heightPerc}%`,
                      backgroundColor: isZero ? 'var(--hover-bg-subtle)' : stat.color,
                      opacity: isZero ? 1 : 0.9,
                      boxShadow: isZero ? 'none' : `0 10px 30px -10px ${stat.color}, inset 0 1px 0 rgba(255,255,255,0.2)`
                    }}
                  >
                    {!isZero && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    )}
                    {!isZero && (
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity cursor-pointer"></div>
                    )}
                  </div>
                </div>
                <div className="text-center mt-2 w-full">
                  <span className={`text-[11px] font-semibold tracking-wide uppercase block truncate px-1 ${isZero ? 'text-theme-muted' : 'text-theme-subtitle'}`}>{stat.name}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Conversion Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel glass-panel-hover rounded-3xl p-7 shadow-xl">
          <h3 className="text-[11px] font-bold text-theme-subtitle uppercase tracking-widest mb-2 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Conversion Rate
          </h3>
          <div className="text-4xl font-extrabold text-theme-title mb-5 tracking-tighter">
            {Math.round(((stats.find(s => s.name === 'Offer')?.count || 0) / total) * 100) || 0}<span className="text-2xl text-theme-muted font-medium ml-1">%</span>
          </div>
          <div className="w-full bg-theme-badge rounded-full h-2.5 overflow-hidden border border-theme-subtle-border">
            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full relative" style={{ width: `${Math.round(((stats.find(s => s.name === 'Offer')?.count || 0) / total) * 100) || 0}%` }}>
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-sm"></div>
            </div>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-3xl p-7 shadow-xl">
          <h3 className="text-[11px] font-bold text-theme-subtitle uppercase tracking-widest mb-2 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Interview Rate
          </h3>
          <div className="text-4xl font-extrabold text-theme-title mb-5 tracking-tighter">
            {Math.round(((stats.filter(s => ['Technical', 'HR Interview', 'Offer'].includes(s.name)).reduce((sum, s) => sum + s.count, 0)) / total) * 100) || 0}<span className="text-2xl text-theme-muted font-medium ml-1">%</span>
          </div>
          <div className="w-full bg-theme-badge rounded-full h-2.5 overflow-hidden border border-theme-subtle-border">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full relative" style={{ width: `${Math.round(((stats.filter(s => ['Technical', 'HR Interview', 'Offer'].includes(s.name)).reduce((sum, s) => sum + s.count, 0)) / total) * 100) || 0}%` }}>
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-sm"></div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-7 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50"></div>
            <div className="w-14 h-14 bg-theme-subtle-bg rounded-2xl flex items-center justify-center mb-4 border border-theme-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] relative z-10 backdrop-blur-md">
              <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <p className="text-sm font-bold text-theme-title relative z-10">Keep up the momentum!</p>
            <p className="text-xs text-theme-subtitle mt-1.5 relative z-10">Consistency is key in the job hunt.</p>
        </div>
      </div>

    </div>
  );
}
