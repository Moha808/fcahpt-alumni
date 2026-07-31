import { Link, useNavigate } from 'react-router-dom';
import { Users, Briefcase, Calendar, Menu, X, LogOut, User as UserIcon, MessageSquare, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  let navLinks = [
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Events', path: '/events', icon: Calendar },
  ];

  // Show directory for unauthenticated users, or authenticated users who are not students
  if (!currentUser || currentUser.role !== 'student') {
    navLinks.unshift({ name: 'Directory', path: '/directory', icon: Users });
  }
  
  if (currentUser) {
    navLinks.push({ name: 'Messages', path: '/messages', icon: MessageSquare });
  }

  // Only show Admin Panel if user is strictly marked as an admin
  if (currentUser?.isAdmin) {
    navLinks.push({ name: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-emerald-400 flex items-center justify-center text-white font-bold">
                F
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">FCAHPT<span className="text-green-600">Alumni</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-green-600 font-medium flex items-center gap-1 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
              {currentUser ? (
                <>
                  <Link to="/profile" className="text-slate-600 hover:text-green-600 font-medium flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium">Log In</Link>
                  <Link to="/register" className="px-4 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors shadow-md shadow-green-600/20">
                    Join Network
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-green-600 hover:bg-green-50 flex items-center gap-2"
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              ))}
              
              <div className="border-t border-slate-100 my-2 pt-2">
                {currentUser ? (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)} className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-green-600 hover:bg-green-50 flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      Profile
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-green-600 hover:bg-green-50">Log In</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-green-600 hover:bg-green-50">Join Network</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
