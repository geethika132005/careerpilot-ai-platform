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

export default function Contacts({ user }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [lastContact, setLastContact] = useState('');
  const [email, setEmail] = useState('');
  const [linkedIn, setLinkedIn] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      // Sort by last contact date or name
      fetched.sort((a, b) => a.name.localeCompare(b.name));
      setContacts(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Error loading contacts:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setCompany('');
    setRole('');
    setLastContact(new Date().toISOString().split('T')[0]);
    setEmail('');
    setLinkedIn('');
    setIsModalOpen(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setName(contact.name || '');
    setCompany(contact.company || '');
    setRole(contact.role || '');
    setLastContact(contact.lastContact || '');
    setEmail(contact.email || '');
    setLinkedIn(contact.linkedIn || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const contactData = {
      name: name.trim(),
      company: company.trim(),
      role: role.trim(),
      lastContact,
      email: email.trim(),
      linkedIn: linkedIn.trim(),
      userId: user.uid,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingContact) {
        await updateDoc(doc(db, 'contacts', editingContact.id), contactData);
      } else {
        contactData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'contacts'), contactData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving contact:", err);
      alert("Failed to save contact. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
      } catch (err) {
        console.error("Error deleting contact:", err);
      }
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-10 text-white relative min-h-full">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Network & Contacts</h2>
          <p className="text-slate-400">Keep track of recruiters, referrals, and networking connections.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 border border-white/10 text-center flex flex-col items-center max-w-lg mx-auto mt-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">No Contacts Yet</h3>
          <p className="text-slate-400 text-sm mb-6">Start building your recruitment network! Add recruiters, hiring managers, and industry peers to keep track of your outreach.</p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-bold transition-all"
          >
            Create Your First Contact
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="pb-4 px-4 font-semibold">Name</th>
                  <th className="pb-4 px-4 font-semibold">Company</th>
                  <th className="pb-4 px-4 font-semibold">Role</th>
                  <th className="pb-4 px-4 font-semibold">Last Contact</th>
                  <th className="pb-4 px-4 font-semibold">Socials & Contact</th>
                  <th className="pb-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-200">
                {contacts.map((contact, index) => {
                  const colors = [
                    'bg-indigo-500/30 text-indigo-300',
                    'bg-purple-500/30 text-purple-300',
                    'bg-emerald-500/30 text-emerald-300',
                    'bg-amber-500/30 text-amber-300',
                    'bg-rose-500/30 text-rose-300',
                    'bg-sky-500/30 text-sky-300'
                  ];
                  const avatarColor = colors[index % colors.length];

                  return (
                    <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-medium flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}>
                          {getInitials(contact.name)}
                        </div>
                        <span className="truncate max-w-[150px]">{contact.name}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold">{contact.company || '—'}</td>
                      <td className="py-4 px-4 text-slate-400">{contact.role || '—'}</td>
                      <td className="py-4 px-4 text-slate-300">{formatDate(contact.lastContact)}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              title={contact.email}
                              className="p-1.5 bg-white/5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all border border-white/5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </a>
                          )}
                          {contact.linkedIn && (
                            <a
                              href={contact.linkedIn.startsWith('http') ? contact.linkedIn : `https://${contact.linkedIn}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="LinkedIn Profile"
                              className="p-1.5 bg-white/5 rounded-lg hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-all border border-white/5"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                              </svg>
                            </a>
                          )}
                          {!contact.email && !contact.linkedIn && <span className="text-slate-500 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(contact)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                            title="Edit Contact"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Delete Contact"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Glassmorphic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
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
              {editingContact ? 'Edit Connection' : 'Add New Contact'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Tech Recruiter"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Contact Date</label>
                <input
                  type="date"
                  value={lastContact}
                  onChange={(e) => setLastContact(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm [color-scheme:dark]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="jane.smith@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">LinkedIn URL</label>
                  <input
                    type="text"
                    placeholder="linkedin.com/in/username"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                  />
                </div>
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
                  {editingContact ? 'Save Changes' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
