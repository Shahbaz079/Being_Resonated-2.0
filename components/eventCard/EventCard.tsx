'use client';
import React, { useEffect, useState } from 'react';
//import Modal from 'react-modal';
import { MapPin, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface Event {
  id: number;
  title: string;
  image: string;
  venue: string;
  date: string;
  time: string;
  description: string;
  team:string;
}

const EventsSidebar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participatedEvents, setParticipatedEvents] = useState<Set<number>>(new Set());

  const [events,setEvents]=useState<Event[]|null>(null);

  const {isLoaded}=useUser();

  // Sample events data - replace with your actual data

  useEffect(()=>{

    const fetchEvents=async ()=>{
  try {
    const res=await fetch("/api/events?type=all",
      {method:"GET"}
      
    );

    const data=await res.json();

    setEvents(data);

  } catch (error) {
    console.error("failed to fetch events");
  }
    }

    fetchEvents();
  },[isLoaded])
  

  const participateInEvent = (event: Event) => {
    setParticipatedEvents(new Set([...participatedEvents, event.id]));
  };

  return (
    <div className="w-80 bg-gray-900 h-screen p-4">
      <h2 className="text-xl font-bold mb-6 text-white">Upcoming Events</h2>
      
      <div className="overflow-y-auto h-[calc(100vh-100px)] pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {events?.map((event) => (
          <div
            key={event.id}
            className="bg-[rgb(43,42,42)] rounded-lg p-3 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] hover:bg-gray-700"
            onClick={() => setSelectedEvent(event)}
          >
            <div className="flex gap-3">
              <img
                src={event.image}
                alt={event.title}
                className="w-16 h-16 object-cover rounded-lg"
                style={{ width: '2rem', height: '2rem' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">{event.title}</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <MapPin size={12} />
                    <span className="font-medium">Venue:</span>
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock size={12} />
                    <span className="font-medium">Date:</span>
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock size={12} />
                    <span className="font-medium">Time:</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                participateInEvent(event);
              }}
              className={`w-full mt-2 flex items-center justify-center gap-2 text-xs ${participatedEvents.has(event.id) ? 'bg-purple-600' : 'bg-teal-600'} text-white px-2 py-1.5 rounded-md transition-colors relative overflow-hidden`}
            >
              {participatedEvents.has(event.id) ? 'Participated' : 'Participate'}
            </button>
          </div>
        ))}
      </div>

      {/* Event Modal */}
    {/**  <Modal
        isOpen={!!selectedEvent}
        onRequestClose={() => setSelectedEvent(null)}
        className="bg-[rgb(72,68,68)] text-white p-4 rounded-md max-w-2xl mx-auto my-8 transition-transform duration-300"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
            selectedEvent && (
          <>
            <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
            <div className="mt-4 flex gap-4">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-semibold">Venue:</span> {selectedEvent.venue}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </p>
                <p className="text-gray-300">
                  <span className="font-semibold">Time:</span> {selectedEvent.time}
                </p>
              </div>
            </div>
            <p className="text-gray-300 mt-4">{selectedEvent.description}</p>
            <button
              onClick={() => participateInEvent(selectedEvent)}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors mt-4"
            >
              Participate
            </button>
          </>
        )}
      </Modal>  */ }
    </div>
  );
};

export default EventsSidebar;