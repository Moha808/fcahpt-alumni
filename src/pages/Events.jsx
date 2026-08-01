import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function Events() {
  const { currentUser } = useAuth();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    type: 'Reunion'
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'Reunion':
        return 'bg-green-100 text-green-700';
      case 'Workshop':
        return 'bg-blue-100 text-blue-700';
      case 'Seminar':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getGoogleCalendarUrl = (event) => {
    const text = encodeURIComponent(event.title || 'Event');
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');
    
    let dates = '';
    try {
      // Best effort date parsing
      const startDate = new Date(`${event.date} ${event.time.split('-')[0] || ''}`);
      const endDate = event.time.includes('-') 
        ? new Date(`${event.date} ${event.time.split('-')[1]}`) 
        : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // add 2 hours if no end time
        
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const format = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
        dates = `&dates=${format(startDate)}/${format(endDate)}`;
      }
    } catch(e) {
      console.error("Error parsing date for calendar", e);
    }
  
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}${dates}`;
  };

  // Fetch events from Firestore
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setEvents([]);
        } else {
          const fetched = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            // Format dates from 'YYYY-MM-DD' to 'MMM DD, YYYY' if it fits
            let displayDate = data.date;
            try {
              const d = new Date(data.date);
              if (!isNaN(d.getTime())) {
                displayDate = d.toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric'
                });
              }
            } catch (err) {
              console.log(err);
            }

            return {
              id: doc.id,
              title: data.title,
              date: displayDate,
              time: data.time,
              location: data.location,
              description: data.description,
              type: data.type || 'Other',
              color: getTypeColor(data.type || 'Other')
            };
          });
          setEvents(fetched);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostEvent = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setFormError('');
      setFormLoading(true);

      const eventRef = collection(db, 'events');
      await addDoc(eventRef, {
        ...formData,
        postedBy: currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Format date for display
      let displayDate = formData.date;
      try {
        const d = new Date(formData.date);
        if (!isNaN(d.getTime())) {
          displayDate = d.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          });
        }
      } catch (err) {
        console.log(err);
      }

      const newEventItem = {
        id: Math.random().toString(), // temp ID
        title: formData.title,
        date: displayDate,
        time: formData.time,
        location: formData.location,
        description: formData.description,
        type: formData.type,
        color: getTypeColor(formData.type)
      };

      setEvents([newEventItem, ...events]);
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        type: 'Reunion'
      });
    } catch (error) {
      console.error("Error posting event:", error);
      setFormError("Failed to schedule event. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Upcoming Events</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto md:mx-0">
              Stay engaged with your alma mater. Register for upcoming workshops, reunions, and seminars.
            </p>
          </div>
          {currentUser && (currentUser.isAdmin || currentUser.role === 'alumni') && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center gap-2 self-center md:self-auto"
            >
              <Plus className="w-5 h-5" />
              Post an Event
            </button>
          )}
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {events.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No events found</h3>
                <p className="text-slate-500">There are currently no events listed.</p>
              </div>
            ) : (
              events.map((event, index) => {
                const dateParts = event.date.split(' ');
                const month = dateParts[0] || 'Oct';
                const day = dateParts[1] ? dateParts[1].replace(',', '') : '15';
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Date Block */}
                      <div className="bg-slate-50 md:w-48 p-6 flex flex-row md:flex-col items-center justify-between md:justify-center border-b md:border-b-0 md:border-r border-slate-200 shrink-0">
                        <div className="text-center">
                          <span className="block text-sm font-bold text-green-600 uppercase tracking-wider">{month}</span>
                          <span className="block text-4xl font-extrabold text-slate-900">{day}</span>
                        </div>
                        <span className={`mt-0 md:mt-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${event.color}`}>
                          {event.type}
                        </span>
                      </div>

                      {/* Event Details */}
                      <div className="p-6 md:p-8 flex-grow">
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-green-700 transition-colors">
                          {event.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {event.location}
                          </div>
                        </div>

                        <p className="text-slate-600 leading-relaxed mb-6">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => alert("Successfully registered for event!")}
                            className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                          >
                            Register Now
                          </button>
                          <a 
                            href={getGoogleCalendarUrl(event)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 text-slate-600 font-medium hover:text-green-600 transition-colors flex items-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Add to Calendar
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Post Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <Calendar className="text-green-600 w-6 h-6" /> Schedule an Event
              </h2>
              <p className="text-slate-500 mb-6">Schedule workshops, seminars, or reunions for the community.</p>

              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <form onSubmit={handlePostEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Modern Aquaculture Workshop"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                    <input
                      type="text"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="e.g. 10:00 AM - 2:00 PM"
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    >
                      <option value="Reunion">Reunion</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location / Platform</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Main Hall or Virtual (Zoom)"
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Event Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide details about the event topic, speakers, registration instructions, etc..."
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50 resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md shadow-green-600/10"
                  >
                    {formLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Scheduling...
                      </>
                    ) : 'Schedule Event'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
