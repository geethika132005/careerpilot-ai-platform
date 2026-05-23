import React from 'react';
import { useTheme } from '../ThemeContext';

export default function Profile({ user, applications }) {
  const { isDark, toggleTheme } = useTheme();
  const totalApps = applications.length;
  const activeApps = applications.filter(a => !['Rejected', 'Offer'].includes(a.status)).length;
  const offers = applications.filter(a => a.status === 'Offer').length;

  return (
    <div className="p-8">
      <h2 className="text-3xl font-extrabold text-theme-title tracking-tight mb-8">Your Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="md:col-span-1 glass-panel rounded-3xl p-8 flex flex-col items-center text-center border border-theme-border relative overflow-hidden h-fit">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mb-6 shadow-[0_10px_30px_rgba(99,102,241,0.4)] relative z-10">
             <div className="w-full h-full rounded-full bg-theme-bg flex items-center justify-center text-4xl font-bold text-theme-title border-4 border-theme-bg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
             </div>
          </div>
          
          <h3 className="text-2xl font-bold text-theme-title mb-2 relative z-10">{user?.displayName || 'Welcome Back!'}</h3>
          <p className="text-sm text-theme-subtitle mb-6 relative z-10">{user?.email}</p>
          
          <div className="w-full bg-theme-subtle-bg rounded-2xl p-4 border border-theme-border mb-2 text-left relative z-10">
            <p className="text-[11px] font-bold text-theme-muted tracking-widest uppercase mb-1">Account ID</p>
            <p className="text-xs text-theme-subtitle font-mono truncate" title={user?.uid}>{user?.uid}</p>
          </div>
        </div>

        {/* Stats & Preferences */}
        <div className="md:col-span-2 flex flex-col gap-8">
           <div className="glass-panel rounded-3xl p-8 border border-theme-border">
              <h3 className="text-xl font-bold text-theme-title mb-6">Placement Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="bg-theme-subtle-bg border border-theme-border rounded-2xl p-5 hover:bg-theme-subtle-bg/85 transition-colors">
                    <p className="text-theme-subtitle text-sm font-medium mb-1">Total Applications</p>
                    <p className="text-4xl font-extrabold text-theme-title">{totalApps}</p>
                 </div>
                 <div className="bg-theme-subtle-bg border border-theme-border rounded-2xl p-5 hover:bg-theme-subtle-bg/85 transition-colors">
                    <p className="text-theme-subtitle text-sm font-medium mb-1">Active Processes</p>
                    <p className="text-4xl font-extrabold text-indigo-400">{activeApps}</p>
                 </div>
                 <div className="bg-theme-subtle-bg border border-theme-border rounded-2xl p-5 hover:bg-theme-subtle-bg/85 transition-colors">
                    <p className="text-theme-subtitle text-sm font-medium mb-1">Offers Received</p>
                    <p className="text-4xl font-extrabold text-green-400">{offers}</p>
                 </div>
              </div>
           </div>

           <div className="glass-panel rounded-3xl p-8 border border-theme-border flex-1">
              <h3 className="text-xl font-bold text-theme-title mb-6">Account Settings</h3>
              
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between p-5 bg-theme-subtle-bg rounded-2xl border border-theme-subtle-border">
                    <div>
                       <p className="text-theme-title font-medium">Interview Reminders</p>
                       <p className="text-xs text-theme-subtitle mt-1">Get notifications before upcoming events</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                       <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between p-5 bg-theme-subtle-bg rounded-2xl border border-theme-subtle-border">
                    <div>
                       <p className="text-theme-title font-medium">Dark Mode</p>
                       <p className="text-xs text-theme-subtitle mt-1">Toggle between light and dark themes</p>
                    </div>
                    <div 
                       onClick={toggleTheme}
                       className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${isDark ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-300'}`}
                    >
                       <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-200 ${isDark ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
