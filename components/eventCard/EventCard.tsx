'use client';
import React, { useEffect, useState } from 'react';
//import Modal from 'react-modal';
import { MapPin, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ObjectId } from 'mongoose';

import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import { IEvent } from '@/app/team/[id]/page';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

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

type ParticipationData = {
  participations: string[];
  eventRequests: string[];
};


const EventCard = ({ uId }: { uId: string }) => {
  






  const { data: events, isLoading: loadingEvents } = useQuery({
  queryKey: ['allEvents'],
  queryFn: async ():Promise<IEvent[]> => {
    const res = await fetch("/api/events?type=all")
    if (!res.ok) throw new Error("Failed to fetch events")
    return res.json()
  },
  refetchOnWindowFocus: false, // optional: to avoid refetching on window focus
})


  const { data: participationData = { participations: [], eventRequests: [] } } = useQuery({
  queryKey: ['participatedEvents', uId],
  queryFn: async ():Promise<ParticipationData> => {
    const res = await fetch(`/api/participate?id=${uId}`,{
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error("Failed to fetch participated events")
    return res.json()
  },
  enabled: !!uId, // only run when uId is defined
  refetchOnWindowFocus: false, // optional: to avoid refetching on window focus
})


const queryClient = useQueryClient()

const { mutate: participateInEvent } = useMutation({
  mutationFn: async (eventId: ObjectId) => {
    const res = await fetch(`/api/events?type=addrequest&id=${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uId }),
    })
    if (!res.ok) throw new Error("Failed to send participation request")
    return res.json()
  },
  onSuccess: () => {
    toast.success("Request sent successfully")
    queryClient.invalidateQueries({ queryKey: ['participatedEvents', uId] })
  },
  onError: () => {
    toast.error("Request failed")
  },
})


  

  return (
    <div className="w-full p-4">

      <div className=" h-fit space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">

        {loadingEvents && <svg className="mx-auto mt-3 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}

        {events?.map((event) =>{
          const eventId = event._id.toString()
const isParticipated = participationData?.participations?.includes(eventId)
const isRequested = participationData?.eventRequests?.includes(eventId)

if (!event?.dateTime) {
  throw new Error("Missing event dateTime");
}

const date = new Date(event.dateTime);

// Format date and time safely
const readableDate = date.toLocaleDateString("en-IN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const readableTime = date.toLocaleTimeString("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});



          return(
          <div
            key={event?._id?.toString()}
            className="rounded-lg p-3 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] hover:bg-gray-700"

          >
            <div className="flex gap-3">
              <img onClick={() => redirect(`/event/${event._id.toString()}`)}
                src={event.image}
                alt={event.name}
                className="w-[60px] h-[60px] object-cover rounded-lg"

              />
              <div className="flex-1 min-w-0">
                <button className="text-white font-semibold text-sm mb-1"
                  onClick={() => redirect(`/event/${event._id.toString()}`)}
                >{event?.name}</button>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <MapPin size={12} />
                    <span className="font-medium">Venue:</span>
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock size={12} />
                    <span className="font-medium">Date:</span>
                    <span>{readableDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock size={12} />
                    <span className="font-medium">Time:</span>
                    <span>{readableTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
  onClick={(e) => {
    e.stopPropagation()
    participateInEvent(event._id)
  }}
  disabled={isParticipated || isRequested}
  className={`disabled:cursor-not-allowed w-full mt-2 flex items-center justify-center gap-2 text-xs ${
    isParticipated ? 'bg-purple-500' : 'bg-teal-600'
  } text-white px-2 py-1.5 rounded-md transition-colors relative overflow-hidden`}
>
  {isParticipated
    ? 'Participated'
    : isRequested
    ? 'Requested'
    : 'Participate'}
</button>

          </div>
        )})}

        {!loadingEvents && events?.length === 0 ? <h1 className='mt-3 text-gray-400 text-center'>There are no Upcoming Events.</h1> : null}
      </div>
    </div>
  );
};

export default EventCard;