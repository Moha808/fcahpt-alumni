import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Users, Briefcase, Calendar, Trash2, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data for the dashboard
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch Users
        const usersSnap = await getDocs(collection(db, 'users'));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // Fetch Jobs (Assuming we have a 'jobs' collection, otherwise empty)
        try {
          const jobsSnap = await getDocs(collection(db, 'jobs'));
          setJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
          console.log("No jobs collection found yet.");
        }

        // Fetch Events (Assuming we have an 'events' collection, otherwise empty)
        try {
          const eventsSnap = await getDocs(collection(db, 'events'));
          setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (e) {
          console.log("No events collection found yet.");
        }

      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you absolutely sure you want to delete the user: ${userName}? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
        alert('User deleted successfully.');
      } catch (error) {
        console.error("Error deleting user:", error);
        alert('Failed to delete user.');
      }
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (window.confirm(`Are you sure you want to delete the job: ${jobTitle}?`)) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
        setJobs(jobs.filter(j => j.id !== jobId));
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (window.confirm(`Are you sure you want to delete the event: ${eventTitle}?`)) {
      try {
        await deleteDoc(doc(db, 'events', eventId));
        setEvents(events.filter(e => e.id !== eventId));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
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
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-bold transition-colors ${activeTab === 'users' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 rounded-xl font-bold transition-colors ${activeTab === 'jobs' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            Manage Jobs
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 rounded-xl font-bold transition-colors ${activeTab === 'events' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            Manage Events
          </button>
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
                    <th className="p-4 font-bold text-slate-600">Role</th>
                    <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{user.displayName || user.firstName + ' ' + user.lastName}</div>
                        {user.matriculationNumber && <div className="text-xs text-slate-500 font-mono mt-1">Matric: {user.matriculationNumber}</div>}
                      </td>
                      <td className="p-4 text-slate-600">{user.email}</td>
                      <td className="p-4 text-slate-600">{user.course || 'N/A'}</td>
                      <td className="p-4 flex gap-2">
                        {user.isAdmin ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wide">Admin</span>
                        ) : user.role === 'student' ? (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">Student</span>
                        ) : user.status === 'pending' ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wide">Pending Alumni</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">Alumni</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {user.status === 'pending' && !user.isAdmin && (
                            <button 
                              onClick={async () => {
                                try {
                                  // Since users fetch is a snapshot, we just update Firestore.
                                  // In real app, we should use setDoc/updateDoc
                                  const { updateDoc } = await import('firebase/firestore');
                                  await updateDoc(doc(db, 'users', user.id), { status: 'approved' });
                                  setUsers(users.map(u => u.id === user.id ? { ...u, status: 'approved' } : u));
                                } catch (error) {
                                  console.error("Error approving user", error);
                                  alert("Failed to approve user");
                                }
                              }}
                              className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-bold transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {!user.isAdmin && (
                            <button 
                              onClick={() => handleDeleteUser(user.id, user.displayName)}
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
            <div className="p-8 text-center">
              {jobs.length === 0 ? (
                <div className="max-w-md mx-auto">
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
                        <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => (
                        <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-800">{job.title}</td>
                          <td className="p-4 text-slate-600">{job.company}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
             <div className="p-8 text-center">
              {events.length === 0 ? (
                <div className="max-w-md mx-auto">
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
                        <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(event => (
                        <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-800">{event.title}</td>
                          <td className="p-4 text-slate-600">{event.date}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
    </div>
  );
}
