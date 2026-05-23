export default function Sidebar({ user, onLogout, currentView = 'Dashboard', setCurrentView }) {
  const getButtonClass = (viewName) => {
    const isActive = currentView === viewName;
    if (isActive) {
      return "flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-theme-title border border-indigo-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";
    }
    return "flex items-center gap-3 w-full text-left px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-theme-subtitle hover:bg-theme-subtle-bg hover:text-theme-title";
  };

  return (
    <aside className="w-64 glass-panel border-r border-theme-border p-5 flex flex-col h-full rounded-tr-3xl rounded-br-3xl mr-2 my-2">
      <div className="flex items-center gap-3 mb-10 text-theme-title px-2 mt-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.4)]">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 className="font-bold text-lg tracking-tight">CareerPilot AI</h3>
      </div>

      <div className="mb-8">
        <p className="text-[11px] font-bold text-theme-muted mb-4 tracking-widest uppercase px-3">Workspace</p>
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={() => setCurrentView?.('Dashboard')}
            className={getButtonClass('Dashboard')}
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
             Dashboard
          </button>
          <button 
            onClick={() => setCurrentView?.('Analytics')}
            className={getButtonClass('Analytics')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Analytics
          </button>
          <button 
            onClick={() => setCurrentView?.('Calendar')}
            className={getButtonClass('Calendar')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Calendar
          </button>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-[11px] font-bold text-theme-muted mb-4 tracking-widest uppercase px-3">Resources</p>
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={() => setCurrentView?.('Resumes')}
            className={getButtonClass('Resumes')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Resumes
          </button>
          <button 
            onClick={() => setCurrentView?.('Contacts')}
            className={getButtonClass('Contacts')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Contacts
          </button>
          <button 
            onClick={() => setCurrentView?.('InterviewPrep')}
            className={getButtonClass('InterviewPrep')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Interview Prep
          </button>
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-theme-muted mb-4 tracking-widest uppercase px-3">Account</p>
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={() => setCurrentView?.('Profile')}
            className={getButtonClass('Profile')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profile
          </button>

        </div>
      </div>

      <div className="mt-auto pt-4 pb-2 px-3 flex justify-between items-center group cursor-pointer border-t border-theme-subtle-border" onClick={onLogout}>
        <div className="flex gap-3 items-center min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-full bg-theme-subtle-bg text-theme-title flex items-center justify-center font-bold text-sm border border-theme-border shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-theme-title group-hover:text-red-400 transition-colors truncate">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-[11px] text-theme-muted">Sign Out</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
