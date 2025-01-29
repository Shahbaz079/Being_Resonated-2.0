'use client';
import React, { useEffect, useState } from 'react';
//import Modal from 'react-modal';
import { MapPin, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ObjectId } from 'mongoose';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import { IEvent } from '@/app/team/[id]/page';

interface Event {
  _id: ObjectId;
  name: string;
  image: string;
  location: string;
  date: string;
  time: string;
  description: string;
  team: string;
}

const EventCard = ({ uId }: { uId: string }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participatedEvents, setParticipatedEvents] = useState<string[]>([]);
  const [requestedEvents, setRequestedEvents] = useState<string[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);


  const [events, setEvents] = useState<IEvent[] | null>(null);

  const { user, isLoaded } = useUser();

  useEffect(() => {

    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);
        const res = await fetch("/api/events?type=all",
          {
            method: "GET",
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await res.json();

        setEvents(data);
        setLoadingEvents(false);

      } catch (error) {
        console.error("failed to fetch events");
      }
    }

    const fetchParticipatedEvents = async () => {
      const res = await fetch(`/api/participate?id=${uId}`, {
        method: 'GET',

      })
      if (res.ok) {
        const data = await res.json();

        setParticipatedEvents(data.participations);
        setRequestedEvents(data.eventRequests);

      } else {
        toast.error("participation fetching failed")
      }
    }
    fetchParticipatedEvents();
    fetchEvents();
  }, [isLoaded])


  const handleParticipation = (id: ObjectId) => {
    try {
      const updatedRequestedEvents = requestedEvents ? [...requestedEvents, id.toString()] : [id.toString()];
      setRequestedEvents(updatedRequestedEvents);
      const participate = async () => {
        const res = await fetch(`/api/events?type=participate&id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: uId }),

        })
        const data = await res.json();
        if (res) {
          toast.success("Request sent successfully")
        } else {
          toast.error("Request failed")
        }
      }
      participate();

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="w-full p-4">

      <div className=" h-fit space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">

        {loadingEvents && <svg className="mx-auto mt-3 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}

        {events?.map((event) => (
          <div
            key={event?._id?.toString()}
            className="rounded-lg p-3 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] hover:bg-gray-700"

          >
            <div className="flex gap-3">
              <img onClick={() => redirect(`/event/${event._id.toString()}?uid=${uId}`)}
                src={event.image}
                alt={event.name}
                className="w-[60px] h-[60px] object-cover rounded-lg"

              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1"
                  onClick={() => redirect(`/event/${event._id.toString()}?uid=${uId}`)}
                >{event?.name}</h3>
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
              className={`w-full mt-2 flex items-center justify-center gap-2 text-xs ${participatedEvents?.includes(event?._id.toString()) ? 'bg-purple-500' : 'bg-teal-600'}  
                
               text-white px-2 py-1.5 rounded-md transition-colors relative overflow-hidden`}
            >
              {participatedEvents?.includes(event?._id.toString()) ? 'Participated' : requestedEvents?.includes(event?._id.toString()) ? 'Requested' : 'Participate'}
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

export default EventCard;