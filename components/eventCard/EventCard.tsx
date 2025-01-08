import React from 'react'
import { EventPost } from '@/app/becommunity/page'
import { Calendar, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface EventCardProps {

  eventPosts: EventPost[];

}


const EventCard = ({ eventPosts = [] }: EventCardProps) => {
  const [participatedEvents, setParticipatedEvents] = useState<number[]>([]);

  
  const generateGoogleCalendarLink = (event: any) => {
    const { name, startDate, endDate, description, location } = event;
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      name
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      description
    )}&location=${encodeURIComponent(location)}`;
  };

  
  const handleParticipate = (eventIndex: number) => {
    if (!participatedEvents.includes(eventIndex)) {
      setParticipatedEvents([...participatedEvents, eventIndex]);
    }
  };
  return (
    <div>
      <div className="w-[90%] flex flex-col justify-center items-start ">
            {eventPosts?.map((event, index) => (
        <div
          key={index}
          className="group bg-gradient-to-r from-white to-purple-50  rounded-xl 
                     shadow-md hover:shadow-xl transition-all duration-500 
                     transform hover:translate-y-[-4px] hover:scale-[1.02]
                     border-2 border-purple-100 max-w-md mx-auto
                     border-animate
                     w-[95%] h-[30vh]
                     relative
                     "
        >
          {/* Animated background gradients */}
          <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-gradient-to-br 
                         from-purple-200 to-pink-200 rounded-full filter blur-2xl 
                         opacity-20 group-hover:opacity-40 transition-all duration-700
                         animate-pulse transform translate-x-16 -translate-y-8" />

          <div className="relative">
            <div className="w-[100%] flex flex-row">
              <div className=" w-[40%]  h-[100%]">
                <Image src={event?.image} alt={event?.title}
               width={200}
               height={200}
                className=' object-contain '/>
              </div>
              <div className="">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 
                          bg-clip-text text-transparent group-hover:from-purple-800 
                          group-hover:to-pink-700 transition-all duration-300
                          transform group-hover:translate-x-2">
              {event.title}
            </h3>

            <p className=" text-gray-800 group-hover:text-gray-900 
                         transition-colors duration-300 leading-relaxed
                         transform group-hover:translate-x-2 max-h-24 overflow-hidden">
              {event.caption}
              <MapPin size={16} className="group-hover:animate-bounce" />
              <span>{event.location}</span>
            </p>
              </div>
            </div>

            <div className="w-[100%]">
              <div className="flex items-center  text-purple-600 
                            transform transition-all duration-300 group-hover:translate-x-2">
               
              </div>

            </div>

            <div className="flex flex-row">
             
             
            <div className="flex items-center  text-purple-600
                            transform transition-all duration-300 group-hover:translate-x-2">
                <Clock size={16} className="group-hover:animate-bounce" />
                <span>{event.date.toString()}</span>
              </div>
              <button
                onClick={() => handleParticipate(index)}
                className={`px-4 py-2 rounded-lg text-white font-semibold ${
                  participatedEvents.includes(index)
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-colors"
                }`}
                disabled={participatedEvents.includes(index)}
              >
                {participatedEvents.includes(index) ? "Participated" : "Participate"}
              </button>
            </div>
          </div>

          {/* Hover border effect */}
          <div className="absolute inset-0 border-2 border-transparent 
                         group-hover:border-purple-200 rounded-xl 
                         transition-all duration-500 pointer-events-none" />
        </div>
      ))}
            </div>
    </div>
  )
}

export default EventCard
