import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, GraduationCap, Briefcase, MapPin, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Profile() {
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    course: '',
    graduationYear: '',
    currentProfession: '',
    location: '',
    bio: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Split displayName if it exists
      const names = currentUser.displayName ? currentUser.displayName.split(' ') : ['', ''];
      
      setFormData({
        firstName: currentUser.firstName || names[0] || '',
        lastName: currentUser.lastName || names.slice(1).join(' ') || '',
        course: currentUser.course || '',
        graduationYear: currentUser.graduationYear || '',
        currentProfession: currentUser.currentProfession || '',
        location: currentUser.location || '',
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        updatedAt: new Date().toISOString()
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to update profile. ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Not Logged In</h2>
          <p className="text-slate-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8">Your Profile</h1>

        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <p className="font-medium">{message.text}</p>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header/Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-green-700 to-emerald-500 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg relative group">
                <div className="w-full h-full rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-3xl overflow-hidden">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    formData.firstName.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {isEditing && (
                  <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium text-sm transition-colors"
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="pt-16 p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                  <User className="w-5 h-5 text-green-600" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 text-slate-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Email cannot be changed directly.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bio / About Me</label>
                    <textarea
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Tell the community a little about yourself..."
                      className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Academic & Professional Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
                  <GraduationCap className="w-5 h-5 text-green-600" /> Academic & Professional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Course of Study</label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year</label>
                    <input
                      type="text"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Profession</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="currentProfession"
                        value={formData.currentProfession}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. Jos, Plateau State"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end pt-4 border-t"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-md shadow-green-600/20 disabled:opacity-70"
                  >
                    {loading ? 'Saving...' : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
