import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Briefcase, GraduationCap, Mail, Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Directory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchAlumni() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        if (querySnapshot.empty) {
          setAlumni([]);
        } else {
          const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAlumni(usersData);
        }
      } catch (error) {
        console.error("Error fetching alumni:", error);
        setAlumni([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAlumni();
  }, []);
  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = person.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          person.currentProfession?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === '' || person.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const handleSendMessage = (userId) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate(`/messages?user=${userId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Alumni Directory</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Connect with FCAHPT Vom graduates across the globe. Search by name, profession, or filter by your course of study.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="glass-panel p-6 rounded-2xl mb-10 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search alumni by name or profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
              />
            </div>
            <div className="relative sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white appearance-none"
              >
                <option value="">All Courses</option>
                <option value="Animal Health and Production">Animal Health</option>
                <option value="Fisheries Technology">Fisheries</option>
                <option value="Science Laboratory Technology">SLT</option>
                <option value="Environmental Health Technology">Environmental Health</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {filteredAlumni.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700">No alumni found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((person, index) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xl border-2 border-green-50 group-hover:border-green-200 transition-colors shrink-0">
                        {person.displayName ? person.displayName.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-green-700 transition-colors">
                          {person.displayName || 'Anonymous Alumni'}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <GraduationCap className="w-4 h-4" />
                          <span>Class of {person.graduationYear || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6 flex-grow">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-2">{person.currentProfession || 'Profession not specified'}</span>
                      </div>
                      {person.course && (
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <div className="w-4 h-4 mt-0.5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                          </div>
                          <span className="line-clamp-1">{person.course}</span>
                        </div>
                      )}
                      {person.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{person.location}</span>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => handleSendMessage(person.id)}
                      className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors flex items-center justify-center gap-2 mt-auto"
                    >
                      <Mail className="w-4 h-4" />
                      Send Message
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
