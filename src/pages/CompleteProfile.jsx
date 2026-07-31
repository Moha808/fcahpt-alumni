import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { User, GraduationCap, Briefcase, AlertCircle, ArrowRight, Users, UserCheck } from 'lucide-react';

export default function CompleteProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [role, setRole] = useState('alumni');
  const [formData, setFormData] = useState({
    matriculationNumber: '',
    graduationYear: '',
    course: '',
    currentProfession: '',
    location: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If the user already has a role, redirect them appropriately
  useEffect(() => {
    if (currentUser && currentUser.role) {
      if (currentUser.status === 'pending' && !currentUser.isAdmin) {
        navigate('/pending');
      } else {
        navigate('/directory');
      }
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      setError('');
      setLoading(true);

      const userRef = doc(db, 'users', currentUser.uid);
      const isAlumni = role === 'alumni';
      
      const profileUpdates = {
        role: role,
        status: isAlumni ? 'pending' : 'approved',
        matriculationNumber: isAlumni ? formData.matriculationNumber : null,
        graduationYear: isAlumni ? formData.graduationYear : null,
        course: formData.course || null,
        currentProfession: isAlumni ? formData.currentProfession : null,
        location: formData.location || null,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, profileUpdates);
      
      // Navigate based on selected role
      if (isAlumni) {
        navigate('/pending');
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      setError('Failed to update profile. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-green-200/40 blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-amber-200/40 blur-3xl opacity-50 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl relative z-10 my-8"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 text-center">Complete Your Profile</h2>
          <p className="mt-2 text-center text-slate-600">
            Please select your role and tell us a bit more about yourself to get started.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('alumni')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                role === 'alumni' 
                  ? 'border-green-600 bg-green-50 text-green-700' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-green-300'
              }`}
            >
              <UserCheck className={`w-8 h-8 ${role === 'alumni' ? 'text-green-600' : 'text-slate-400'}`} />
              <span className="font-bold">I am an Alumni</span>
            </button>
            
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                role === 'student' 
                  ? 'border-amber-500 bg-amber-50 text-amber-700' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-amber-300'
              }`}
            >
              <Users className={`w-8 h-8 ${role === 'student' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="font-bold">Student / Visitor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* General course selection */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Course of Study</label>
                <select
                  name="course"
                  required
                  value={formData.course}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                >
                  <option value="">Select Course</option>
                  <option value="Animal Health and Production">Animal Health and Production</option>
                  <option value="Fisheries Technology">Fisheries Technology</option>
                  <option value="Science Laboratory Technology">Science Laboratory Technology</option>
                  <option value="Environmental Health Technology">Environmental Health Technology</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Veterinary Laboratory Technology">Veterinary Laboratory Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Jos, Plateau State"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Academic & Professional Info (ALUMNI ONLY) */}
            {role === 'alumni' && (
              <div className="space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Academic & Professional</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Matriculation Number / Alumni Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="matriculationNumber"
                      required={role === 'alumni'}
                      value={formData.matriculationNumber}
                      onChange={handleChange}
                      placeholder="e.g. FCAHPT/2024/001"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                    </div>
                    <select
                      name="graduationYear"
                      required={role === 'alumni'}
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                    >
                      <option value="">Select Year</option>
                      {Array.from({length: 50}, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Profession / Job Title</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="currentProfession"
                      value={formData.currentProfession}
                      onChange={handleChange}
                      placeholder="e.g. Senior Veterinarian"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed group mt-8"
          >
            {loading ? 'Saving profile...' : 'Complete Registration'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
