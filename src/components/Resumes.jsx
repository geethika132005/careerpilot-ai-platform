import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

export default function Resumes({ user }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('resume');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'documents'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      // Sort by creation date or title
      fetched.sort((a, b) => b.updatedAt?.localeCompare(a.updatedAt || '') || 0);
      setDocuments(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error loading documents:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const openAddModal = () => {
    setEditingDoc(null);
    setTitle('');
    setUrl('');
    setType('resume');
    setIsModalOpen(true);
  };

  const openEditModal = (docData, e) => {
    e.stopPropagation(); // prevent card click triggers
    setEditingDoc(docData);
    setTitle(docData.title || '');
    setUrl(docData.url || '');
    setType(docData.type || 'resume');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const docData = {
      title: title.trim(),
      url: formattedUrl,
      type,
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingDoc) {
        await updateDoc(doc(db, 'documents', editingDoc.id), docData);
      } else {
        docData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'documents'), docData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Failed to save document. Please try again.");
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // prevent card click triggers
    if (window.confirm("Are you sure you want to delete this document/link?")) {
      try {
        await deleteDoc(doc(db, 'documents', id));
      } catch (err) {
        console.error("Error deleting document:", err);
      }
    }
  };

  const getDocIcon = (docType) => {
    switch (docType) {
      case 'resume':
        return (
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'portfolio':
        return (
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
        );
      case 'cover_letter':
        return (
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
    }
  };

  const getTypeNameLabel = (docType) => {
    switch (docType) {
      case 'resume': return 'Resume';
      case 'portfolio': return 'Portfolio Link';
      case 'cover_letter': return 'Cover Letter';
      default: return 'Other Document';
    }
  };

  const formatDateAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHrs === 0) {
          const diffMins = Math.floor(diffMs / (1000 * 60));
          if (diffMins === 0) return 'Just now';
          return `${diffMins}m ago`;
        }
        return `${diffHrs}h ago`;
      }
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="p-10 text-white min-h-full">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Resumes & Docs</h2>
        <p className="text-slate-400">Manage your resumes, portfolio links, and other application materials.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* New Resume Card Button */}
          <div 
            onClick={openAddModal}
            className="glass-panel rounded-2xl p-6 border flex flex-col items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300 cursor-pointer min-h-[220px] border-dashed border-white/20 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 active:scale-98"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:border-indigo-500/30 transition-all">
              <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Add Document or Link</span>
            <p className="text-xs text-slate-500 mt-1 max-w-[180px] text-center">Upload resume links, portfolios, or cover letters.</p>
          </div>

          {/* Documents list */}
          {documents.map((docData) => (
            <div 
              key={docData.id} 
              className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col relative group min-h-[220px] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.02]"
            >
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => openEditModal(docData, e)}
                  className="p-1.5 bg-black/40 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 border border-white/5 backdrop-blur-md transition-colors"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => handleDelete(docData.id, e)}
                  className="p-1.5 bg-black/40 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 backdrop-blur-md transition-colors"
                  title="Delete"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {getDocIcon(docData.type)}

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 group-hover:text-indigo-300 transition-colors line-clamp-2 pr-12">{docData.title}</h3>
                  <div className="flex gap-2 items-center text-xs text-slate-500">
                    <span className="font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                      {getTypeNameLabel(docData.type)}
                    </span>
                    {docData.updatedAt && (
                      <span>• Updated {formatDateAgo(docData.updatedAt)}</span>
                    )}
                  </div>
                </div>
                
                <a 
                  href={docData.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold text-center transition-all border border-white/5 hover:border-white/10 flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span>{docData.type === 'portfolio' ? 'Open Portfolio Link' : 'View Document'}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Glassmorphic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-8 border border-white/15 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-extrabold text-white mb-6">
              {editingDoc ? 'Edit Document Link' : 'Add New Document Link'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Resume v2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Document / Link Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm [color-scheme:dark]"
                >
                  <option value="resume" className="bg-[#16162a]">Resume</option>
                  <option value="portfolio" className="bg-[#16162a]">Portfolio Link</option>
                  <option value="cover_letter" className="bg-[#16162a]">Cover Letter</option>
                  <option value="other" className="bg-[#16162a]">Other Link / Doc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Link URL *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. drive.google.com/... or github.com/username"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">Please provide the link to your document (e.g. Google Drive link, Dropbox link, or web portfolio link).</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-bold text-white shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {editingDoc ? 'Save Changes' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
