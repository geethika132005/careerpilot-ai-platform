import { useTheme } from "../ThemeContext";

export default function Topbar({ search, setSearch, onAdd, activeCount = 12 }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex justify-between items-center px-10 py-6 glass-panel border-b border-theme-border m-2 rounded-3xl sticky top-2 z-20 shadow-xl">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-theme-title flex items-center gap-3 tracking-tight">
            Dashboard
            <span className="text-sm font-medium text-theme-subtitle/80 ml-2 hidden sm:inline-block">Track and manage your job applications</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold border border-green-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></span>
          {activeCount} active
        </div>

        <div className="relative group">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-subtitle group-focus-within:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            placeholder="Search applications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 glass-input rounded-xl text-sm w-48 sm:w-72 transition-all placeholder:text-theme-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          />
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-theme-subtitle hover:text-theme-title transition-colors hover:bg-theme-subtle-bg rounded-xl"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button className="relative p-2 text-theme-subtitle hover:text-theme-title transition-colors hover:bg-theme-subtle-bg rounded-xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-theme-bg shadow-[0_0_8px_#ef4444]"></span>
        </button>

        <button
          onClick={onAdd}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(99,102,241,0.4)] active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">New Application</span>
        </button>
      </div>
    </div>
  );
}
