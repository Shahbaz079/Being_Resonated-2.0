'use client';
import React, { useEffect, useState } from 'react';
//import Modal from 'react-modal';
import { MapPin, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ObjectId } from 'mongoose';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface Event {
  _id: ObjectId;
  title: string;
  image: string;
  location: string;
  date: string;
  time: string;
  description: string;
  team:string;
}

const EventsSidebar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participatedEvents, setParticipatedEvents] = useState<string[]>([]);
  

  const [events,setEvents]=useState<Event[]|null>(null);

  const {user,isLoaded}=useUser();

  const mongoId=user?.publicMetadata?.mongoId

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

    const fetchParticipatedEvents=async ()=>{
      const res=await fetch(`/api/participate?id=${mongoId}`,{
        method:'GET'
      })
      if(res.status==200){
        const data=await res.json();
         
        setParticipatedEvents(data.participations);
        console.log(data);
      }else{
        toast.error("participation fetching failed")
      }
    }
    fetchParticipatedEvents();
    fetchEvents();
  },[isLoaded])
  

  const handleParticipation=(id:ObjectId)=>{
   try {
    const participate=async ()=>{
      const res=await fetch(`/api/participate?id=${mongoId}&eid=${id}`,{
        method:'PUT',

      })
      const data=await res.json();
      if(res){
        toast.success("Participated successfully")
      }else{
        toast.error("participation failed")
      }
    }
    participate();

   } catch (error) {
    console.error(error);
   }
  }
  

  return (
    <div className="w-[100%] bg-transparent  p-4">
      
      
      <div className=" h-[calc(100vh-100px)] space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
        {events?.map((event) => (
          <div
            key={event?._id?.toString()}
            className="bg-[rgb(43,42,42)] rounded-lg p-3 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] hover:bg-gray-700"
            
          >
            <div className="flex gap-3">
              <img
                src={event.image}
                alt={event.title}
                className="w-[20px] h-[20px] object-cover rounded-lg"
                 
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">{event.title}</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <MapPin size={12} />
                    <span className="font-medium">Venue:</span>
                    <span className="truncate">{event.location}</span>
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
                handleParticipation(event._id);
                console.log(event._id)
              }}
              className={`w-full mt-2 flex items-center justify-center gap-2 text-xs ${participatedEvents?.includes(event?._id.toString())?'bg-purple-500':'bg-teal-600'}  
                
               text-white px-2 py-1.5 rounded-md transition-colors relative overflow-hidden`}
            >
              {participatedEvents?.includes(event?._id.toString()) ? 'Participated' : 'Participate'}
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