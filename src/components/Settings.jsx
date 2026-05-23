import { useState, useEffect } from "react";

export default function Settings() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [selectedModel, setSelectedModel] = useState(localStorage.getItem("gemini_model") || "");
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Fetch available models whenever there is a saved API key
  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      fetchModels(savedKey);
    }
  }, []);

  async function fetchModels(keyToUse) {
    if (!keyToUse) return;
    setLoadingModels(true);
    setError("");
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyToUse}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch models");
      }

      // Filter for gemini models that support generating content
      const filtered = data.models
        .filter(m => m.name.toLowerCase().includes("gemini") && m.supportedGenerationMethods.includes("generateContent"))
        .map(m => m.name.split("/").pop());

      setModels(filtered);
      
      // Default to gemini-1.5-flash or the first available if nothing is selected
      const currentSaved = localStorage.getItem("gemini_model");
      if (!currentSaved && filtered.length > 0) {
        const defaultModel = filtered.find(m => m.includes("1.5-flash")) || filtered[0];
        localStorage.setItem("gemini_model", defaultModel);
        setSelectedModel(defaultModel);
      }
    } catch (err) {
      console.error(err);
      setError("Could not retrieve model list. Please check your API key.");
    } finally {
      setLoadingModels(false);
    }
  }

  function saveKey(e) {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    localStorage.setItem("gemini_api_key", trimmedKey);
    setSaved(true);
    setError("");
    
    // Attempt to load models for this new key
    fetchModels(trimmedKey);
    
    setTimeout(() => setSaved(false), 3000);
  }

  function handleModelChange(e) {
    const model = e.target.value;
    setSelectedModel(model);
    localStorage.setItem("gemini_model", model);
  }

  function clearKey() {
    localStorage.removeItem("gemini_api_key");
    localStorage.removeItem("gemini_model");
    setApiKey("");
    setSelectedModel("");
    setModels([]);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-panel rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <h2 className="text-xl font-bold text-theme-title mb-8 flex items-center gap-3 tracking-tight relative z-10">
          <div className="p-2 bg-theme-badge rounded-xl border border-theme-border shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          Google Gemini Integration
        </h2>
        
        <div className="bg-theme-alert-bg border border-theme-alert-border rounded-2xl p-5 mb-8 relative z-10 backdrop-blur-sm">
          <p className="text-sm text-theme-alert-text leading-relaxed">
            <strong className="text-theme-title block mb-1">How to get an API key:</strong> 
            Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="font-bold text-indigo-500 dark:text-indigo-400 hover:underline underline-offset-2 transition-colors">Google AI Studio</a>, log in, and click "Create API key". It is completely free and powers the AI Interview Coach!
          </p>
        </div>

        <form onSubmit={saveKey} className="flex flex-col gap-6 relative z-10">
          <div>
            <label className="block text-[11px] font-bold text-theme-muted mb-2 ml-1 uppercase tracking-widest">Gemini API Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 glass-input rounded-xl transition-all font-mono text-sm placeholder-theme-muted focus:outline-none"
              />
            </div>
          </div>

          {/* Model Selector Dropdown */}
          {models.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-theme-muted mb-2 ml-1 uppercase tracking-widest">Preferred AI Model</label>
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className="w-full glass-input rounded-xl px-4 py-3.5 text-theme-title focus:outline-none transition-colors text-sm [color-scheme:dark]"
              >
                {models.map(model => (
                  <option key={model} value={model} className="bg-theme-bg text-theme-title">
                    {model} {model === "gemini-1.5-flash" ? "(Recommended Default)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-theme-muted mt-2">
                Tip: If your current model experiences high-demand capacity limits (503 errors), try switching to another model like <code className="text-indigo-500 dark:text-indigo-400 font-semibold">gemini-1.5-flash-8b</code> (lightweight & fast) or <code className="text-indigo-500 dark:text-indigo-400 font-semibold">gemini-2.0-flash</code>.
              </p>
            </div>
          )}

          {loadingModels && (
            <div className="flex items-center gap-2 text-xs text-theme-subtitle py-1">
              <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <span>Checking available models for your API key...</span>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-xs py-1 font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2">
            <button 
              type="submit" 
              className="px-7 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95"
            >
              Save Key
            </button>
            <button 
              type="button" 
              onClick={clearKey}
              className="px-6 py-3 rounded-xl font-bold text-theme-subtitle hover:bg-theme-subtle-bg hover:text-theme-title border border-transparent hover:border-theme-border transition-all active:scale-95"
            >
              Clear
            </button>
            {saved && (
              <span className="text-emerald-500 font-bold text-sm animate-pulse flex items-center gap-1.5 ml-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> 
                Saved Successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
