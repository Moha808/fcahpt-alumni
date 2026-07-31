import { Calendar, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Events() {
  const events = [
    {
      id: 1,
      title: 'FCAHPT Annual Alumni Reunion 2026',
      date: 'Oct 15, 2026',
      time: '10:00 AM - 4:00 PM',
      location: 'Main Auditorium, FCAHPT Vom',
      description: 'Join us for our biggest event of the year! Network with fellow alumni, meet current students, and see the new campus developments.',
      type: 'Reunion',
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 2,
      title: 'Modern Veterinary Practices Workshop',
      date: 'Nov 02, 2026',
      time: '9:00 AM - 2:00 PM',
      location: 'Virtual (Zoom)',
      description: 'An intensive workshop discussing the latest advancements in veterinary laboratory technology and animal health.',
      type: 'Workshop',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 3,
      title: 'Aquaculture Investment Seminar',
      date: 'Dec 10, 2026',
      time: '11:00 AM - 1:00 PM',
      location: 'Conference Hall, NVRI',
      description: 'Explore emerging investment opportunities in commercial fisheries and aquaculture in Nigeria.',
      type: 'Seminar',
      color: 'bg-amber-100 text-amber-700'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Upcoming Events</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Stay engaged with your alma mater. Register for upcoming workshops, reunions, and seminars.
          </p>
        </div>

        <div className="space-y-6">
          {events.map((event, index) => (
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
                    <span className="block text-sm font-bold text-green-600 uppercase tracking-wider">{event.date.split(' ')[0]}</span>
                    <span className="block text-4xl font-extrabold text-slate-900">{event.date.split(' ')[1].replace(',', '')}</span>
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
                    <button className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors shadow-sm">
                      Register Now
                    </button>
                    <button className="px-4 py-2.5 text-slate-600 font-medium hover:text-green-600 transition-colors flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Add to Calendar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
