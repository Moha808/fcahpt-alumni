import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, Calendar, Trash2, ShieldAlert, Loader2, X, AlertTriangle, CheckCircle, XCircle, UserCheck } from 'lucide-react';

// ── Confirmation Modal ──────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isDanger = false, loading = false }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${isDanger ? 'text-red-600' : 'text-amber-600'}`} />
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm mb-6">{message}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white font-medium transition-colors disabled:opacity-70 flex items-center gap-2 ${
                isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Toast Notification ──────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white font-medium max-w-sm ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 shrink-0" />
            : <XCircle className="w-5 h-5 shrink-0" />
          }
          <span className="text-sm">{toast.message}</span>
          <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Admin Component ────────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [actionLoading, setActionLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const openConfirm = (config) => setConfirmModal({ isOpen: true, ...config });
  const closeConfirm = () => {
    if (!actionLoading) setConfirmModal({ isOpen: false });
  };

  // Fetch all data for the dashboard
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const usersSnap = await getDocs(collection(db, 'users'));
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        try {
          const jobsSnap = await getDocs(collection(db, 'jobs'));
          setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { /* no jobs yet */ }

        try {
          const eventsSnap = await getDocs(collection(db, 'events'));
          setEvents(eventsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { /* no events yet */ }

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // ── Delete Handlers ────────────────────────────────────────────────────
  const handleDeleteUser = (user) => {
    openConfirm({
      title: 'Delete User',
      message: `Are you absolutely sure you want to permanently delete "${user.displayName || user.email}"? This will remove them from the database and cannot be undone.`,
      confirmLabel: 'Yes, Delete User',
      isDanger: true,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await deleteDoc(doc(db, 'users', user.id));
          setUsers(prev => prev.filter(u => u.id !== user.id));
          setConfirmModal({ isOpen: false });
          showToast(`"${user.displayName || user.email}" has been deleted.`, 'success');
        } catch (error) {
          console.error('Error deleting user:', error);
          showToast('Failed to delete user. Check your permissions.', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleDeleteJob = (job) => {
    openConfirm({
      title: 'Delete Job Posting',
      message: `Are you sure you want to remove the job "${job.title}"? This cannot be undone.`,
      confirmLabel: 'Delete Job',
      isDanger: true,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await deleteDoc(doc(db, 'jobs', job.id));
          setJobs(prev => prev.filter(j => j.id !== job.id));
          setConfirmModal({ isOpen: false });
          showToast(`Job "${job.title}" deleted.`, 'success');
        } catch (error) {
          console.error('Error deleting job:', error);
          showToast('Failed to delete job.', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleDeleteEvent = (event) => {
    openConfirm({
      title: 'Delete Event',
      message: `Are you sure you want to remove the event "${event.title}"? This cannot be undone.`,
      confirmLabel: 'Delete Event',
      isDanger: true,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await deleteDoc(doc(db, 'events', event.id));
          setEvents(prev => prev.filter(e => e.id !== event.id));
          setConfirmModal({ isOpen: false });
          showToast(`Event "${event.title}" deleted.`, 'success');
        } catch (error) {
          console.error('Error deleting event:', error);
          showToast('Failed to delete event.', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  const handleApproveUser = (user) => {
    openConfirm({
      title: 'Approve Alumni',
      message: `Approve "${user.displayName || user.email}" as a verified alumni? They will gain full access to the platform.`,
      confirmLabel: 'Approve Alumni',
      isDanger: false,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await updateDoc(doc(db, 'users', user.id), { status: 'approved' });
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'approved' } : u));
          setConfirmModal({ isOpen: false });
          showToast(`${user.displayName || user.email} has been approved!`, 'success');
        } catch (error) {
          console.error('Error approving user:', error);
          showToast('Failed to approve user.', 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Admin Header */}
        <div className="mb-8 flex items-center gap-4 border-b border-slate-200 pb-6">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage platform users, jobs, and events.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase">Total Users</p>
              <p className="text-2xl font-extrabold text-slate-800">{users.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase">Active Jobs</p>
              <p className="text-2xl font-extrabold text-slate-800">{jobs.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase">Upcoming Events</p>
              <p className="text-2xl font-extrabold text-slate-800">{events.length}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6">
          {['users', 'jobs', 'events'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-bold transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Manage {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-600">Name</th>
                    <th className="p-4 font-bold text-slate-600">Email</th>
                    <th className="p-4 font-bold text-slate-600">Course</th>
                    <th className="p-4 font-bold text-slate-600">Status</th>
                    <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-800">
                          {user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
                        </div>
                        {user.matriculationNumber && (
                          <div className="text-xs text-slate-500 font-mono mt-1">Matric: {user.matriculationNumber}</div>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{user.email}</td>
                      <td className="p-4 text-slate-600 text-sm">{user.course || 'N/A'}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {user.isAdmin ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">Admin</span>
                          ) : user.role === 'student' ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">Student</span>
                          ) : user.status === 'pending' ? (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide">Pending Alumni</span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Alumni</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === 'pending' && !user.isAdmin && (
                            <button
                              onClick={() => handleApproveUser(user)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-bold transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                              Approve
                            </button>
                          )}
                          {!user.isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === 'jobs' && (
            <div>
              {jobs.length === 0 ? (
                <div className="p-12 text-center max-w-md mx-auto">
                  <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No Jobs Posted</h3>
                  <p className="text-slate-500">There are currently no active job postings in the database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 font-bold text-slate-600">Job Title</th>
                        <th className="p-4 font-bold text-slate-600">Company</th>
                        <th className="p-4 font-bold text-slate-600">Location</th>
                        <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-800">{job.title}</td>
                          <td className="p-4 text-slate-600">{job.company}</td>
                          <td className="p-4 text-slate-600">{job.location || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteJob(job)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Job"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div>
              {events.length === 0 ? (
                <div className="p-12 text-center max-w-md mx-auto">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No Events Scheduled</h3>
                  <p className="text-slate-500">There are currently no events in the database.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-4 font-bold text-slate-600">Event Title</th>
                        <th className="p-4 font-bold text-slate-600">Date</th>
                        <th className="p-4 font-bold text-slate-600">Location</th>
                        <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium text-slate-800">{event.title}</td>
                          <td className="p-4 text-slate-600">{event.date}</td>
                          <td className="p-4 text-slate-600">{event.location || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Event"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDanger={confirmModal.isDanger}
        loading={actionLoading}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
