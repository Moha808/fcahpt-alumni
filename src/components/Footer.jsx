import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                F
              </div>
              <span className="font-bold text-xl text-white tracking-tight">FCAHPT<span className="text-green-500">Alumni</span></span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              The official alumni network for the Federal College of Animal Health and Production Technology, Vom, Plateau State, Nigeria.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-green-400 transition-colors">Home</Link></li>
              <li><Link to="/directory" className="hover:text-green-400 transition-colors">Directory</Link></li>
              <li><Link to="/jobs" className="hover:text-green-400 transition-colors">Jobs Board</Link></li>
              <li><Link to="/events" className="hover:text-green-400 transition-colors">Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-green-400 transition-colors">Log In</Link></li>
              <li><Link to="/register" className="hover:text-green-400 transition-colors">Register</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} FCAHPT Vom Alumni Network. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
