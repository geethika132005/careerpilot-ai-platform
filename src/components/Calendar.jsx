import { COLUMNS } from "../App";

export default function Calendar({ applications, columns: columnsProp }) {
  const cols = columnsProp || COLUMNS;
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 glass-panel rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center rounded-2xl mb-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] relative z-10">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight relative z-10">Your Calendar is Empty</h2>
        <p className="text-slate-400 relative z-10 max-w-sm mx-auto">Add applications to see your interview timeline and upcoming deadlines here.</p>
      </div>
    );
  }

  const sortedApps = [...applications].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <h2 className="text-xl font-bold text-white mb-10 flex items-center gap-3 tracking-tight relative z-10">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          Upcoming Timeline
        </h2>

        <div className="relative border-l-2 border-white/10 ml-3 md:ml-6 space-y-10 pb-4 z-10">
          {sortedApps.map((app, i) => {
             const colData = cols.find(c => c.name === app.status) || cols[0];
             
             return (
              <div key={app.id} className="relative pl-8 md:pl-10 group">
                {/* Timeline Dot */}
                <span 
                  className="absolute left-[-6px] top-1.5 w-3 h-3 rounded-full ring-4 ring-[#0f0f1a] transition-transform duration-300 group-hover:scale-125"
                  style={{ backgroundColor: colData.color, boxShadow: `0 0 12px ${colData.color}` }}
                ></span>
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 glass-panel glass-panel-hover p-5 rounded-2xl transition-all duration-300 group-hover:translate-x-1">
                  <div>
                    <h3 className="font-bold text-white text-lg flex items-center gap-3">
                      {app.company}
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-white/10 shadow-sm" style={{ backgroundColor: colData.bg, color: colData.color }}>
                        {app.status}
                      </span>
                    </h3>
                    <p className="text-sm font-medium text-slate-300 mt-1.5">{app.role}</p>
                    <p className="text-sm text-slate-500 mt-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {app.location || 'Location Not Specified'}
                    </p>
                  </div>

                  <div className="shrink-0 bg-black/20 border border-white/5 rounded-xl px-5 py-3.5 flex flex-col items-center justify-center min-w-[130px] shadow-inner backdrop-blur-sm">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Date</span>
                    <span className="text-white font-bold text-lg tracking-tight">{app.date || 'TBD'}</span>
                  </div>
                </div>
              </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}
