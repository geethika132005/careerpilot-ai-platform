import { useState } from "react";
import { COLUMNS } from "../App";
import { generateInterviewPrep } from "../ai";
import ReactMarkdown from "react-markdown";

function AddApplicationModal({ onClose, onAdd, onEdit, existingData }) {
  const isEditing = !!existingData;

  const [company, setCompany] = useState(existingData?.company || "");
  const [role, setRole] = useState(existingData?.role || "");
  const [date, setDate] = useState(existingData?.date || "");
  const [status, setStatus] = useState(existingData?.status || "Applied");
  const [location, setLocation] = useState(existingData?.location || "");
  const [salary, setSalary] = useState(existingData?.salary || "");
  const [notes, setNotes] = useState(existingData?.notes || "");

  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'ai_prep'
  
  const [aiLoading, setAiLoading] = useState(false);
  const [prepResult, setPrepResult] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!company || !role || !date) {
      alert("Please fill required fields (Company, Role, Date)");
      return;
    }

    const payload = {
       ...existingData,
       company,
       role,
       date,
       status,
       location,
       salary,
       notes,
    };

    try {
      if (isEditing) {
        await onEdit(payload);
      } else {
        await onAdd({ ...payload, id: Date.now().toString() });
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save application: " + error.message);
    }
  }

  async function handleGeneratePrep() {
    setAiLoading(true);
    setPrepResult("");
    try {
      const text = await generateInterviewPrep(company, role);
      setPrepResult(text);
    } catch (err) {
      alert(err.message);
    }
    setAiLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f0f1a]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="glass-panel rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] h-[800px] border border-white/10 bg-[#151522]/90">
        
        {/* Header */}
        <div className="px-8 pt-7 pb-5 bg-black/20 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-7 relative z-10">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isEditing ? "Edit Application" : "New Application"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">Track your next big opportunity.</p>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/5 shadow-sm shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex gap-2 relative z-10 bg-black/20 p-1 rounded-2xl w-fit border border-white/5">
            <button 
              type="button"
              onClick={() => setActiveTab("details")}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "details" ? "bg-white/10 text-white shadow-lg border border-white/10 scale-[1.02]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              Application Details
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("ai_prep")}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${activeTab === "ai_prep" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)] border border-indigo-400/30 scale-[1.02]" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              AI Interview Coach
            </button>
          </div>
        </div>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {activeTab === "details" && (
            <form id="app-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Company Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Apple"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3.5 glass-input rounded-xl transition-all placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Role <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3.5 glass-input rounded-xl transition-all placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3.5 glass-input rounded-xl transition-all placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. $150k - $180k"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full px-4 py-3.5 glass-input rounded-xl transition-all placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Target Date <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3.5 glass-input rounded-xl transition-all text-sm [color-scheme:dark] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Current Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3.5 glass-input rounded-xl transition-all text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] appearance-none bg-[#1a1a2e]"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.name} value={col.name} className="bg-[#1a1a2e] text-white py-2">
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 mt-2">
                  <label className="block text-[11px] font-bold text-slate-400 mb-2 ml-1 uppercase tracking-widest">Additional Notes</label>
                  <textarea
                    placeholder="Links to job positing, thoughts on the interview..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3.5 glass-input rounded-xl transition-all placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] resize-none text-sm"
                  />
                </div>
              </div>
            </form>
          )}

          {activeTab === "ai_prep" && (
            <div className="flex flex-col h-full relative">
              <div className="mb-8 text-center relative z-10">
                <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">AI Interview Coach</h3>
                <p className="text-slate-400">Get precise questions and culture tips specifically trained for <span className="font-bold text-indigo-400">{company || 'this company'}</span>.</p>
              </div>
              
              {!prepResult && !aiLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-10 border border-white/10 rounded-3xl bg-indigo-500/5 shadow-[inset_0_0_40px_rgba(99,102,241,0.05)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <svg className="w-24 h-24 text-indigo-500/40 mb-8 relative z-10 group-hover:scale-110 transition-transform duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <button 
                    onClick={handleGeneratePrep}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_10px_40px_rgba(99,102,241,0.6)] hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-3 text-lg relative z-10"
                  >
                    <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    Generate Master Strategy
                  </button>
                  <p className="text-[10px] text-slate-500 mt-6 font-bold tracking-widest uppercase relative z-10">Powered by Google Gemini</p>
                </div>
              )}

              {aiLoading && (
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500 rounded-full animate-ping opacity-60"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center tracking-tight">Analyzing "{company}" hiring patterns...<br/><span className="text-indigo-400 text-sm font-normal block mt-2">This takes about 3 seconds</span></h3>
                </div>
              )}

              {prepResult && !aiLoading && (
                <div className="flex-1 p-8 bg-black/40 border border-white/10 rounded-3xl overflow-y-auto shadow-inner prose prose-invert prose-headings:text-white prose-a:text-indigo-400 prose-strong:text-indigo-300 max-w-none">
                  <ReactMarkdown>{prepResult}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer (Only show for details) */}
        {activeTab === "details" && (
          <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex justify-end gap-4 mt-auto shrink-0 relative z-10 backdrop-blur-md">
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              form="app-form"
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)] transition-all active:scale-95"
            >
              {isEditing ? "Save Changes" : "Create Application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddApplicationModal;
