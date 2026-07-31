import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, GraduationCap, Briefcase, AlertCircle, ArrowRight, Users, UserCheck } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('alumni');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    matriculationNumber: '',
    graduationYear: '',
    course: '',
    currentProfession: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: role,
        matriculationNumber: role === 'alumni' ? formData.matriculationNumber : null,
        graduationYear: role === 'alumni' ? formData.graduationYear : null,
        course: role === 'alumni' ? formData.course : null,
        currentProfession: role === 'alumni' ? formData.currentProfession : null,
        photoURL: null
      };

      await signup(formData.email, formData.password, userData);
      
      if (role === 'alumni') {
        navigate('/pending'); // Alumni need approval
      } else {
        navigate('/jobs'); // Students are instantly approved, but directory is hidden. Let's send them to jobs.
      }
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
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
          <h2 className="text-3xl font-extrabold text-slate-900 text-center">Join the FCAHPT Network</h2>
          <p className="mt-2 text-center text-slate-600">
            Create your alumni profile to connect with peers and access opportunities.
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
            {/* Personal Info */}
            <div className={`space-y-4 ${role === 'student' ? 'md:col-span-2 max-w-xl mx-auto w-full' : ''}`}>
              <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Academic & Professional Info (ALUMNI ONLY) */}
            {role === 'alumni' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Academic & Professional</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Matriculation Number / Alumni Code</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="matriculationNumber"
                    required
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
                    required
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
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                    placeholder="e.g. Senior Veterinarian"
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
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
            Sign in instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
