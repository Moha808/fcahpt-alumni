import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Briefcase, GraduationCap } from 'lucide-react';

export default function Home() {
  const features = [
    {
      title: "Alumni Directory",
      description: "Connect with former classmates and expand your professional network across the globe.",
      icon: Users,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Career Support",
      description: "Access exclusive job postings, internships, and mentorship opportunities from alumni partners.",
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Continuous Learning",
      description: "Stay updated with workshops, seminars, and academic advancements at FCAHPT Vom.",
      icon: GraduationCap,
      color: "bg-amber-100 text-amber-600"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 pt-16 md:pt-24 pb-32">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-200/50 blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-200/50 blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-green-600"></span>
              Official Alumni Network
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight"
            >
              Empowering the <span className="text-gradient">FCAHPT Vom</span> Community
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed"
            >
              Join thousands of graduates in animal health, production, and applied sciences. Network, find career opportunities, and give back to your alma mater.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 group">
                Join the Network
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/directory" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-700 font-bold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center">
                Explore Directory
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Join the Network?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">Your connection to the college doesn't end at graduation. Discover the benefits of staying active in our community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-green-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to reconnect with your peers?</h2>
          <p className="text-green-100 mb-10 text-lg">Sign up today and become part of a growing professional community driving innovation in animal health and agriculture.</p>
          <Link to="/register" className="px-8 py-4 rounded-full bg-white text-green-900 font-bold text-lg hover:bg-green-50 transition-colors shadow-xl">
            Create Your Profile
          </Link>
        </div>
      </section>
    </div>
  );
}
