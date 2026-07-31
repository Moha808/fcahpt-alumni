import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, MapPin, Clock, DollarSign, Building } from 'lucide-react';

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Mock jobs data
  const jobs = [
    {
      id: 1,
      title: 'Senior Veterinary Doctor',
      company: 'Plateau State Vet Clinic',
      location: 'Jos, Plateau State',
      type: 'Full-time',
      salary: '₦200,000 - ₦350,000 / month',
      postedAt: '2 days ago',
      logo: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      title: 'Farm Manager',
      company: 'AgriCorp Nigeria',
      location: 'Kaduna',
      type: 'Full-time',
      salary: 'Competitive',
      postedAt: '5 days ago',
      logo: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      title: 'Fisheries Extension Officer',
      company: 'Federal Ministry of Agriculture',
      location: 'Abuja',
      type: 'Contract',
      salary: '₦150,000 / month',
      postedAt: '1 week ago',
      logo: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 4,
      title: 'Laboratory Assistant',
      company: 'NVRI Vom',
      location: 'Vom, Plateau State',
      type: 'Internship',
      salary: 'Stipend provided',
      postedAt: '2 weeks ago',
      logo: 'bg-amber-100 text-amber-600'
    }
  ];

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
          <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-md flex items-center gap-2">
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
                  <button className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-slate-50 text-green-700 font-medium border border-green-200 hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors">
                    View & Apply
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
