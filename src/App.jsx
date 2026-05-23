import { useState, useEffect } from "react";
import AddApplicationModal from "./components/AddApplicationModal";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./components/Auth";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Stats from "./components/Stats";
import Analytics from "./components/Analytics";
import Calendar from "./components/Calendar";
import Profile from "./components/Profile";
import Resumes from "./components/Resumes";
import Contacts from "./components/Contacts";
import InterviewPrep from "./components/InterviewPrep";
import Settings from "./components/Settings";
import {
  collection,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

export const COLUMNS = [
  { name: "Applied", color: "#60A5FA", bg: "rgba(59, 130, 246, 0.15)" },
  { name: "In Touch", color: "#A78BFA", bg: "rgba(139, 92, 246, 0.15)" },
  { name: "Technical", color: "#FBBF24", bg: "rgba(245, 158, 11, 0.15)" },
  { name: "HR Interview", color: "#38BDF8", bg: "rgba(14, 165, 233, 0.15)" },
  { name: "Offer", color: "#4ADE80", bg: "rgba(34, 197, 94, 0.15)" },
  { name: "Rejected", color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
];

function App() {
  const [applications, setApplications] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("Dashboard");

  // Drag and drop state
  const [draggedAppId, setDraggedAppId] = useState(null);
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  // Dynamic Preferences State
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem("placement_board_columns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved columns", e);
      }
    }
    return COLUMNS;
  });

  const [currency, setCurrency] = useState(() => localStorage.getItem("placement_currency") || "$");
  const [sortOrder, setSortOrder] = useState(() => localStorage.getItem("placement_sort_order") || "Date (Descending)");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "applications"),
      where("userId", "==", user.uid),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  // Helper to reassign columns when deleted
  useEffect(() => {
    if (!applications.length || !columns.length) return;
    const colNames = columns.map(c => c.name);
    applications.forEach(async (app) => {
      if (app.status && !colNames.includes(app.status)) {
        await updateDoc(doc(db, "applications", app.id), {
          status: colNames[0]
        });
      }
    });
  }, [columns]);

  async function handleAdd(newApp) {
    await addDoc(collection(db, "applications"), {
      ...newApp,
      userId: user.uid,
    });
  }

  async function handleEdit(updatedApp) {
    await updateDoc(doc(db, "applications", updatedApp.id), updatedApp);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, "applications", id));
  }

  // --- HTML5 Drag & Drop Handlers ---
  function handleDragStart(e, id) {
    setDraggedAppId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e, colName) {
    e.preventDefault(); 
    if (draggedOverCol !== colName) {
      setDraggedOverCol(colName);
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDraggedOverCol(null);
  }

  async function handleDrop(e, newStatus) {
    e.preventDefault();
    setDraggedOverCol(null);
    if (!draggedAppId) return;

    setApplications((prev) =>
      prev.map((app) =>
        app.id === draggedAppId ? { ...app, status: newStatus } : app,
      ),
    );

    await updateDoc(doc(db, "applications", draggedAppId), {
      status: newStatus,
    });
    
    setDraggedAppId(null);
  }

  if (!user) return <Auth setUser={setUser} />;

  return (
    <div className="flex h-screen bg-theme-bg font-sans text-theme-text overflow-hidden relative">
      {/* Background Orbs */}
      <div style={{
        position: "absolute", top: "-200px", left: "20%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,var(--orb-opacity-1)) 0%, transparent 70%)",
        animation: "orb1 12s ease-in-out infinite alternate",
        pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "absolute", bottom: "-150px", right: "-100px",
        width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,var(--orb-opacity-2)) 0%, transparent 70%)",
        animation: "orb2 15s ease-in-out infinite alternate",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Main UI */}
      <div className="flex w-full h-full z-10">
        <Sidebar user={user} onLogout={() => signOut(auth)} currentView={currentView} setCurrentView={setCurrentView} />

        <main className="flex-1 flex flex-col min-w-0">
          <Topbar 
            search={search} 
            setSearch={setSearch} 
            onAdd={() => setModalData("add")} 
            activeCount={applications.filter(a => !['Rejected', 'Offer'].includes(a.status)).length}
          />

          <div className="flex-1 overflow-y-auto overflow-x-auto p-10">
            
            {currentView === "Dashboard" && (
              <>
                <Stats applications={applications} />

                <div className="flex gap-6 pb-4">
                  {columns.map((col) => {
                    const cards = applications
                      .filter((a) => a.status === col.name)
                      .filter(
                        (a) =>
                          a.company?.toLowerCase().includes(search.toLowerCase()) ||
                          a.role?.toLowerCase().includes(search.toLowerCase()),
                      );

                    const getSalaryValue = (salaryStr) => {
                      if (!salaryStr) return 0;
                      let clean = salaryStr.toLowerCase().replace(/[^0-9.km]/g, '');
                      let multiplier = 1;
                      if (clean.includes('k')) {
                        multiplier = 1000;
                        clean = clean.replace('k', '');
                      } else if (clean.includes('m')) {
                        multiplier = 1000000;
                        clean = clean.replace('m', '');
                      }
                      const val = parseFloat(clean);
                      return isNaN(val) ? 0 : val * multiplier;
                    };

                    const sortedCards = [...cards].sort((a, b) => {
                      if (sortOrder === "Company A-Z") {
                        return (a.company || "").localeCompare(b.company || "");
                      }
                      if (sortOrder === "Salary (High to Low)") {
                        return getSalaryValue(b.salary) - getSalaryValue(a.salary);
                      }
                      if (sortOrder === "Salary (Low to High)") {
                        return getSalaryValue(a.salary) - getSalaryValue(b.salary);
                      }
                      if (sortOrder === "Date (Ascending)") {
                        return new Date(a.date || 0) - new Date(b.date || 0);
                      }
                      // Default to Date (Descending)
                      return new Date(b.date || 0) - new Date(a.date || 0);
                    });

                    const isHovering = draggedOverCol === col.name;

                    return (
                      <div 
                        key={col.name} 
                        className="w-[300px] shrink-0"
                        onDragOver={(e) => handleDragOver(e, col.name)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col.name)}
                      >
                        <div className="flex items-center gap-2 mb-4 px-1">
                          <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}` }}></span>
                          <span className="font-semibold text-sm text-theme-title">{col.name}</span>
                          <span className="text-xs font-semibold text-theme-subtitle bg-theme-subtle-bg px-2 py-0.5 rounded-full ml-1 border border-theme-border">{cards.length}</span>
                          
                          <button 
                            className="ml-auto text-theme-subtitle hover:text-theme-title transition-colors p-1 hover:bg-theme-subtle-bg rounded-md"
                            onClick={() => setModalData("add")}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          </button>
                        </div>

                        <div className={`min-h-[200px] transition-colors rounded-2xl flex flex-col gap-3 pb-8 ${isHovering ? 'bg-theme-subtle-bg border border-theme-border rounded-3xl p-2' : ''}`}>
                          {sortedCards.map((app) => (
                            <div
                              key={app.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, app.id)}
                              onDragEnd={() => { setDraggedAppId(null); setDraggedOverCol(null); }}
                              className={`glass-panel glass-panel-hover p-5 flex flex-col group rounded-2xl
                                ${draggedAppId === app.id ? 'opacity-50 ring-2 ring-indigo-500 shadow-xl z-50 relative' : 'relative'}
                                transition-all duration-200 cursor-grab active:cursor-grabbing
                              `}
                            >
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setModalData(app); }}
                                    className="p-1.5 text-theme-title hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg bg-theme-badge border border-theme-subtle-border backdrop-blur-md transition-all"
                                    title="Edit"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(app.id); }}
                                    className="p-1.5 text-theme-title hover:text-red-400 hover:bg-red-500/10 rounded-lg bg-theme-badge border border-theme-subtle-border backdrop-blur-md transition-all"
                                    title="Delete"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                              </div>

                              <div className="flex gap-4 mb-4">
                                <div
                                  className="w-12 h-12 rounded-xl flex shrink-0 items-center justify-center font-bold text-lg border border-theme-border"
                                  style={{ backgroundColor: col.bg, color: col.color }}
                                >
                                  {app.company?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                  <h4 className="font-bold text-theme-title text-[15px] truncate pr-8">{app.company}</h4>
                                  <p className="text-sm text-theme-subtitle truncate">{app.role}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-theme-subtitle mb-5 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {app.location || "Location"}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {app.salary ? app.salary.replace(/^\$/, currency).replace(/\b\$/g, currency) : "Salary"}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                <div 
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-theme-subtle-border" 
                                  style={{ backgroundColor: col.bg, color: col.color }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color, boxShadow: `0 0 6px ${col.color}` }}></span>
                                  {col.name}
                                </div>
                                <span className="text-[11px] text-theme-muted font-medium whitespace-nowrap bg-theme-badge px-2 py-1 rounded-md border border-theme-subtle-border">
                                  {app.date || "Apr 15, 2026"}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {/* Empty Drop Zone Indicator */}
                          <div className={`mt-2 flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-theme-border text-theme-subtitle text-sm font-medium transition-opacity ${isHovering ? 'opacity-100 bg-theme-subtle-bg border-theme-border' : draggedAppId && cards.length === 0 ? 'opacity-40' : 'hidden'}`}>
                            Drop here
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {currentView === "Analytics" && (
              <Analytics applications={applications} columns={columns} />
            )}

            {currentView === "Calendar" && (
              <Calendar applications={applications} columns={columns} />
            )}

            {currentView === "Profile" && (
              <Profile user={user} applications={applications} />
            )}

            {currentView === "Resumes" && (
              <Resumes user={user} />
            )}

            {currentView === "Contacts" && (
              <Contacts user={user} />
            )}

            {currentView === "InterviewPrep" && (
              <InterviewPrep setCurrentView={setCurrentView} />
            )}

            {currentView === "Settings" && (
              <Settings 
                columns={columns} 
                setColumns={setColumns} 
                currency={currency} 
                setCurrency={setCurrency}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                user={user}
                applications={applications}
                setApplications={setApplications}
              />
            )}

          </div>
        </main>

        {modalData && (
          <AddApplicationModal
            onClose={() => setModalData(null)}
            onAdd={handleAdd}
            onEdit={handleEdit}
            existingData={modalData === "add" ? null : modalData}
            columns={columns}
            currency={currency}
          />
        )}
      </div>
    </div>
  );
}

export default App;
