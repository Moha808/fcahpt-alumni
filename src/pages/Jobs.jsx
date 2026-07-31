import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, MapPin, Clock, DollarSign, Building, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    link: ''
  });

  // Fetch jobs from Firestore
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setJobs([]);
        } else {
          const fetched = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Format Timestamp to a friendly readable string
            let postedText = 'Recently';
            if (data.createdAt) {
              const date = data.createdAt.toDate();
              const diffTime = Math.abs(new Date() - date);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays === 1) postedText = 'Today';
              else if (diffDays <= 7) postedText = `${diffDays} days ago`;
              else postedText = date.toLocaleDateString();
            }
            
            return {
              id: doc.id,
              title: data.title,
              company: data.company,
              location: data.location,
              type: data.type,
              salary: data.salary || 'Competitive',
              postedAt: postedText,
              logo: 'bg-green-100 text-green-600',
              link: data.link || '#'
            };
          });
          setJobs(fetched);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]); // fallback on error
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setFormError('');
      setFormLoading(true);

      const jobRef = collection(db, 'jobs');
      await addDoc(jobRef, {
        ...formData,
        postedBy: currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Refresh list (add new job optimistically to top of list)
      const newJobItem = {
        id: Math.random().toString(), // temp ID
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: formData.salary || 'Competitive',
        postedAt: 'Today',
        logo: 'bg-green-100 text-green-600',
        link: formData.link || '#'
      };

      setJobs([newJobItem, ...jobs]);
      setIsModalOpen(false);
      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        link: ''
      });
    } catch (error) {
      console.error("Error posting job:", error);
      setFormError("Failed to post job. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Job Board</h1>
            <p className="text-lg text-slate-600">
              Discover career opportunities curated for FCAHPT alumni.
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            Post a Job
          </button>
        </div>

        {/* Search & Filter */}
        <div className="glass-panel p-6 rounded-2xl mb-10 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white"
              />
            </div>
            <div className="relative sm:w-64">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-white appearance-none"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
                <p className="text-slate-500">We couldn't find any jobs matching your criteria.</p>
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all group flex flex-col md:flex-row gap-6 items-start md:items-center"
                >
                  {/* Company Logo / Initials */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 ${job.logo}`}>
                    <Building className="w-8 h-8 opacity-50" />
                  </div>
                  
                  {/* Job Info */}
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                        {job.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 self-start sm:self-auto">
                        {job.type}
                      </span>
                    </div>
                    
                    <div className="text-slate-600 font-medium mb-3">{job.company}</div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {job.postedAt}
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="w-full md:w-auto shrink-0 mt-4 md:mt-0">
                    <a 
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-center w-full md:w-auto px-6 py-2.5 rounded-xl bg-slate-50 text-green-700 font-medium border border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
                    >
                      View & Apply
                    </a>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

      </div>

      {/* Post Job Modal */}
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
                <Briefcase className="text-green-600 w-6 h-6" /> Post a Job Opportunity
              </h2>
              <p className="text-slate-500 mb-6">Fill in the details below to share this role with the alumni community.</p>

              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Farm Operations Manager"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Livestock Farms Ltd"
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Vom, Plateau State"
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range (Optional)</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g. ₦150k - ₦250k / month"
                      className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a summary of the responsibilities, qualifications, and how to apply..."
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50 resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Application URL or Contact Email (Optional)</label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="e.g. https://company.com/apply or mailto:hr@company.com"
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-green-500 focus:border-green-500 bg-slate-50"
                  />
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
                        Posting...
                      </>
                    ) : 'Post Job'}
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
