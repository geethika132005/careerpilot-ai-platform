import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendInterviewChatMessage, evaluateInterview, generateInterviewPrep } from '../ai';

export default function InterviewPrep({ setCurrentView }) {
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("gemini_api_key") || "");
  const [phase, setPhase] = useState('setup');
  
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isCoachTyping, setIsCoachTyping] = useState(false);
  
  const [cheatSheet, setCheatSheet] = useState('');
  const [loadingCheatSheet, setLoadingCheatSheet] = useState(false);
  const [evaluation, setEvaluation] = useState('');
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);

  const [currentlySpeaking, setCurrentlySpeaking] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isCoachTyping]);

  useEffect(() => {
    const handleFocus = () => {
      setApiKey(import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("gemini_api_key") || "");
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    let interval = null;
    if (phase === 'chat') {
      setSecondsElapsed(0);
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setSecondsElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const templates = [
    { company: 'Google', role: 'Frontend Engineer' },
    { company: 'Stripe', role: 'Full Stack Developer' },
    { company: 'Meta', role: 'Product Manager' },
  ];

  const handleStartInterview = async (selectedCompany, selectedRole) => {
    const comp = selectedCompany || company || 'a technology company';
    const r = selectedRole || role || 'Software Engineer';
    
    setCompany(comp);
    setRole(r);
    setPhase('chat');
    setIsCoachTyping(true);
    setMessages([]);
    setEvaluation('');
    setCheatSheet('');
    window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);

    const initialHistory = [
      {
        role: 'user',
        text: `Hi! I want to start a mock interview for the "${r}" role at "${comp}". Please welcome me and ask the first question.`
      }
    ];

    try {
      const responseText = await sendInterviewChatMessage(initialHistory, comp, r);
      setMessages([
        { role: 'assistant', text: responseText }
      ]);
    } catch (err) {
      console.error(err);
      setMessages([
        { role: 'assistant', text: `Sorry, I couldn't initialize the interview. Error: ${err.message}` }
      ]);
    } finally {
      setIsCoachTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isCoachTyping) return;

    window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const userMsg = { role: 'user', text: inputValue.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsCoachTyping(true);

    try {
      const responseText = await sendInterviewChatMessage(updatedMessages, company, role);
      setMessages([...updatedMessages, { role: 'assistant', text: responseText }]);
    } catch (err) {
      console.error(err);
      setMessages([...updatedMessages, { role: 'assistant', text: `Failed to fetch response: ${err.message}` }]);
    } finally {
      setIsCoachTyping(false);
    }
  };

  const handleGetHint = async () => {
    if (isCoachTyping) return;
    window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);
    setIsCoachTyping(true);

    const hintRequestMsg = { 
      role: 'user', 
      text: '[System Request: The candidate needs a subtle, helpful hint to help them answer your last question. Please provide a brief hint without giving away the exact answer.]' 
    };

    try {
      const responseText = await sendInterviewChatMessage([...messages, hintRequestMsg], company, role);
      setMessages([...messages, { role: 'assistant', text: responseText }]);
    } catch (err) {
      console.error(err);
      alert(`Could not retrieve hint: ${err.message}`);
    } finally {
      setIsCoachTyping(false);
    }
  };

  const handleEndAndEvaluate = async () => {
    if (messages.length < 2) {
      if (!window.confirm("The interview is very short. Are you sure you want to end it now?")) {
        return;
      }
    }
    window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setPhase('evaluation');
    setLoadingEvaluation(true);

    try {
      const scoreReport = await evaluateInterview(messages, company, role);
      setEvaluation(scoreReport);
    } catch (err) {
      console.error(err);
      setEvaluation(`### ❌ Evaluation Failed\n\nCould not compile your scorecard. Error: ${err.message}`);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  const handleGenerateCheatSheet = async () => {
    if (loadingCheatSheet) return;
    setLoadingCheatSheet(true);
    try {
      const sheet = await generateInterviewPrep(company, role);
      setCheatSheet(sheet);
    } catch (err) {
      console.error(err);
      setCheatSheet(`Failed to generate cheat sheet: ${err.message}`);
    } finally {
      setLoadingCheatSheet(false);
    }
  };

  const speakText = (text, index) => {
    if (currentlySpeaking === index) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    const cleanText = text
      .replace(/[*#_`~[\]]/g, '')
      .replace(/-\s+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Natural") || v.lang.startsWith("en-"));
    if (voice) utterance.voice = voice;

    utterance.onend = () => setCurrentlySpeaking(null);
    utterance.onerror = () => setCurrentlySpeaking(null);

    setCurrentlySpeaking(index);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputValue(prev => {
          const space = prev.endsWith(' ') || prev === '' ? '' : ' ';
          return prev + space + finalTranscript;
        });
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const resetInterview = () => {
    window.speechSynthesis.cancel();
    setCurrentlySpeaking(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setPhase('setup');
    setMessages([]);
    setInputValue('');
    setEvaluation('');
    setCheatSheet('');
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const parseEvaluation = (rawText) => {
    if (!rawText) return null;

    const scoreMatch = rawText.match(/(?:Overall Score|Score)\s*:\s*\*?\[?(\d+)\/10\]?\*?/i);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

    const sections = {
      score: score,
      rating: score >= 9 ? "Outstanding" : score >= 8 ? "Excellent" : score >= 6 ? "Good Progress" : "Needs Practice",
      ratingColor: score >= 9 ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : score >= 8 ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" : score >= 6 ? "text-amber-400 border-amber-500/20 bg-amber-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5",
      strongPoints: "",
      improvementAreas: "",
      sampleAnswers: ""
    };

    const strongMatch = rawText.match(/###\s*🌟\s*Strong\s*Points([\s\S]*?)(?:###\s*🛠️|###\s*💡|$)/i);
    const improvementMatch = rawText.match(/###\s*🛠️\s*Areas\s*for\s*Improvement([\s\S]*?)(?:###\s*💡|###\s*🌟|$)/i);
    const sampleMatch = rawText.match(/###\s*💡\s*Suggested\s*Sample\s*Answers([\s\S]*?)$/i);

    if (strongMatch) sections.strongPoints = strongMatch[1].trim();
    if (improvementMatch) sections.improvementAreas = improvementMatch[1].trim();
    if (sampleMatch) sections.sampleAnswers = sampleMatch[1].trim();

    if (!sections.strongPoints && !sections.improvementAreas) return null;

    return sections;
  };

  if (!apiKey) {
    return (
      <div className="p-10 text-white min-h-full flex flex-col justify-center items-center">
        <div className="glass-panel max-w-xl rounded-3xl p-8 border border-white/10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-extrabold mb-3">AI Interview Coach Locked</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            To enable the AI Mock Interviewer, please add your Google Gemini API Key to the <code className="text-indigo-400 font-bold">.env</code> file in your project root:
          </p>
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-left mb-6 text-slate-300">
            VITE_GEMINI_API_KEY=your_gemini_api_key_here
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            Note: You can generate a free API key instantly in <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>. Once added, please restart the development server.
          </p>
        </div>
      </div>
    );
  }

  const parsedEval = parseEvaluation(evaluation);

  return (
    <div className="p-10 text-white flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-1">Interview Prep Hub</h2>
          <p className="text-slate-400 text-sm">Practice behavioral questions, coding challenges, and get instant recruiter feedback.</p>
        </div>
        {phase !== 'setup' && (
          <button 
            onClick={resetInterview}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold transition-colors"
          >
            Reset Session
          </button>
        )}
      </div>

      {phase === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 items-start">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              Start New Mock Interview
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); handleStartInterview(); }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google, Apple, Stripe"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Engineer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                Launch Mock Interviewer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <h3 className="font-bold text-base mb-4">Quick Templates</h3>
              <div className="flex flex-col gap-2">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartInterview(tpl.company, tpl.role)}
                    className="text-left px-4 py-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-xs transition-all flex justify-between items-center group active:scale-98"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block mb-0.5">{tpl.role}</span>
                      <span className="text-slate-500">at {tpl.company}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col min-h-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="pb-4 border-b border-white/5 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-sm text-slate-200">Session Live: {role} at {company}</span>
                </div>
                <div className="text-xs bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-indigo-300 font-mono">
                  ⏱️ {formatTime(secondsElapsed)}
                </div>
              </div>
              <button 
                onClick={handleEndAndEvaluate}
                className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/10 active:scale-95"
              >
                End & Evaluate
              </button>
            </div>

            <div className="flex-1 bg-black/20 border border-white/5 rounded-2xl my-4 p-4 overflow-y-auto flex flex-col gap-4 shadow-inner min-h-0">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={index}
                    className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed relative group ${
                      isUser 
                        ? 'self-end bg-indigo-500/15 border border-indigo-500/20 text-white rounded-tr-sm' 
                        : 'self-start bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-6 mb-1.5 border-b border-white/5 pb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {isUser ? 'You' : 'Coach'}
                      </span>
                      {!isUser && (
                        <button 
                          onClick={() => speakText(msg.text, index)}
                          className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"
                          title="Speak Question"
                        >
                          {currentlySpeaking === index ? (
                            <span className="flex items-center gap-0.5 w-3.5 h-3.5 justify-center">
                              <span className="w-0.5 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                              <span className="w-0.5 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                              <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
                            </span>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed">
                        <ReactMarkdown>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              })}

              {isCoachTyping && (
                <div className="self-start max-w-[80%] bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-400 flex items-center gap-2">
                  <span>Coach is formulating a question</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="relative z-10 flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  disabled={isCoachTyping}
                  placeholder={
                    isCoachTyping 
                      ? "Waiting for coach..." 
                      : isListening 
                        ? "🎙️ Listening... Speak your answer now." 
                        : "Type or use Speak to answer..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 disabled:opacity-50 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors shadow-inner font-sans" 
                />
                <button 
                  type="submit"
                  disabled={isCoachTyping || !inputValue.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:hover:bg-indigo-500 rounded-lg text-white transition-all shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              
              <button
                type="button"
                onClick={toggleListening}
                disabled={isCoachTyping}
                className={`px-4 flex items-center justify-center gap-1.5 border rounded-xl text-xs font-semibold transition-all active:scale-95 whitespace-nowrap ${
                  isListening 
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                }`}
                title={isListening ? "Stop listening" : "Speak answer (Speech-to-Text)"}
              >
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    Stop Mic
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Speak
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGetHint}
                disabled={isCoachTyping || messages.length === 0}
                className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 rounded-xl text-xs font-semibold text-indigo-300 transition-colors active:scale-95 whitespace-nowrap"
                title="Get a hint from the interviewer"
              >
                💡 Hint
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-6 min-h-0 overflow-y-auto">
            <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col flex-1 min-h-0">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5 shrink-0">
                <h3 className="font-bold text-sm text-slate-200">Role Cheat Sheet</h3>
                <button 
                  onClick={handleGenerateCheatSheet}
                  disabled={loadingCheatSheet}
                  className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {loadingCheatSheet ? 'Generating...' : cheatSheet ? 'Regenerate' : 'Generate'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto text-xs text-slate-300 leading-relaxed pr-1 min-h-0">
                {loadingCheatSheet ? (
                  <div className="flex flex-col justify-center items-center py-12 gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
                    <span className="text-[11px] text-slate-500 font-medium">Analyzing company requirements...</span>
                  </div>
                ) : cheatSheet ? (
                  <div className="prose prose-invert max-w-none text-xs text-slate-300 prose-headings:text-indigo-400 prose-headings:font-bold prose-headings:text-sm prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
                    <ReactMarkdown>
                      {cheatSheet}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="mb-2">Need a quick reference?</p>
                    <p className="text-[11px]">Generate a custom cheat sheet with top likely questions and insider interview tips specifically for this role.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'evaluation' && (
        <div className="glass-panel rounded-3xl p-8 border border-white/10 flex flex-col flex-1 min-h-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex justify-between items-center pb-4 border-b border-white/5 shrink-0 z-10">
            <div>
              <h3 className="text-xl font-bold">Interview Performance Scorecard</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Detailed feedback for your {role} mock interview at {company}</p>
            </div>
            <button 
              onClick={resetInterview}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Start New Session
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 pr-2 z-10 min-h-0">
            {loadingEvaluation ? (
              <div className="flex flex-col justify-center items-center py-20 gap-3">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <h4 className="font-bold text-slate-200">Compiling Evaluation Report</h4>
                <p className="text-xs text-slate-500">Evaluating answers, grading performance, and compiling suggestions...</p>
              </div>
            ) : parsedEval ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  <div className="glass-panel bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="transparent" 
                          stroke="url(#indigoGrad)" 
                          strokeWidth="8" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * parsedEval.score) / 10}
                          strokeLinecap="round" 
                          className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-2xl font-extrabold text-white font-mono tracking-tighter">
                        {parsedEval.score} <span className="text-xs text-slate-500 font-normal">/ 10</span>
                      </div>
                    </div>
                    <div className={`mt-4 text-xs font-extrabold border px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm ${parsedEval.ratingColor}`}>
                      {parsedEval.rating}
                    </div>
                  </div>

                  <div className="md:col-span-2 glass-panel bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center gap-4">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Session Overview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Target Profile</span>
                        <span className="text-sm font-semibold text-white">{role}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">at {company}</span>
                      </div>
                      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-1">Duration</span>
                        <span className="text-sm font-semibold text-white">{formatTime(secondsElapsed)}</span>
                        <span className="text-xs text-slate-400 block mt-0.5">Total practice time</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-panel bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 relative overflow-hidden">
                    <h4 className="font-bold text-emerald-400 text-sm mb-4 flex items-center gap-2 border-b border-emerald-500/10 pb-2">
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                      Key Strengths
                    </h4>
                    <div className="prose prose-invert max-w-none text-xs text-slate-300 prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                      <ReactMarkdown>{parsedEval.strongPoints}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="glass-panel bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 relative overflow-hidden">
                    <h4 className="font-bold text-amber-400 text-sm mb-4 flex items-center gap-2 border-b border-amber-500/10 pb-2">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Suggestions for Growth
                    </h4>
                    <div className="prose prose-invert max-w-none text-xs text-slate-300 prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                      <ReactMarkdown>{parsedEval.improvementAreas}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {parsedEval.sampleAnswers && (
                  <div className="glass-panel bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 relative overflow-hidden">
                    <h4 className="font-bold text-indigo-400 text-sm mb-4 flex items-center gap-2 border-b border-indigo-500/10 pb-2">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Ideal Suggested Responses
                    </h4>
                    <div className="prose prose-invert max-w-none text-xs text-slate-300 prose-headings:text-indigo-400 prose-headings:font-bold prose-headings:text-xs prose-p:my-2 prose-ul:my-2 prose-li:my-1">
                      <ReactMarkdown>{parsedEval.sampleAnswers}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-black/25 border border-white/5 rounded-2xl p-6 shadow-inner">
                <div className="prose prose-invert max-w-none text-sm text-slate-300 prose-headings:text-indigo-400 prose-headings:font-bold prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-6 prose-p:leading-relaxed prose-li:my-1">
                  <ReactMarkdown>
                    {evaluation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
