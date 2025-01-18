'use client'
import { IUser } from "@/components/expandableCards/card";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal/Modal";
import Link from "next/link";
import CreateEvent from "@/components/eventCreate/EventCreate";
import EventModal from "@/components/Modal/EventModal";
import { Calendar, Users, Award, ChevronRight, ArrowUpRight, Sparkles, Star, MessageCircle, Share2 } from 'lucide-react';
import mongoose from "mongoose";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { TeamPostModal } from "@/components/Modal/TeamPostModal";

export interface IEvent { 
  _id: mongoose.Schema.Types.ObjectId; 
  name: string;
   leaders?: mongoose.Schema.Types.ObjectId[];
    image: string;
     team: mongoose.Schema.Types.ObjectId; 
     date: Date;
      members?: mongoose.Schema.Types.ObjectId[];
       description: string; 
       createdBy: mongoose.Schema.Types.ObjectId; 
       participated?: mongoose.Schema.Types.ObjectId[]; 
       location: string;
        time: string; 
        createdAt?: Date; 
        updatedAt?: Date; 
      } 
      


const TeamPage = () => {
  
  const [members,setMembers]=useState<IUser[]|null>([])
  const [teamImg,setTeamImg]=useState<string|null>(null);
  const [description,setDescription]=useState<string|null>("");
const [createdBy,setCreatedBy]=useState<IUser|null>();
const [leader,setLeader]=useState<IUser>();
const [teamName,setTeamName]=useState<string>("")
const [modal,setModal]=useState(false);
const [events,setEvents]=useState<IEvent[] |null>([])

const modalCloseHandler=()=>{
  setModal(false);
}

const [eventModal,setEventModal]=useState(false);
const eventModalCloseHandler=()=>{
  setEventModal(false);
}

  const searchParams=useSearchParams();
  const id=searchParams.get("id");
  console.log(id,"team id")

  const {user,isLoaded}=useUser();
  const mongoId=user?.publicMetadata.mongoId as string



  useEffect(()=>{
    const TeamHandler=async()=>{
      await fetch(`/api/team?id=${id}`).then(res=>res.json()).then(data=>{
        setMembers(data.members);
        setTeamImg(data.timage);
        setDescription(data.description);
        setCreatedBy(data.createdBy);
        setLeader(data.leader);
        setTeamName(data.name);
        setEvents(data.events)
      })


    }

    TeamHandler();
  },[])
  
    
   
  

  

  return (
    <div className="w-[90vw] h-[80vh] flex flex-row ">
      
      <div className="w-[50%] h-[100%]">
        <div className="flex w-[100%] h-[30%] flex-row">
        <div className="w-[30%] h-[100%]">
          { teamImg ? <Image 
                            
                            width={200}
                            height={200}
                            src={teamImg}
                            alt={teamName}
                           // className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                           />:
                          <img
                            
                            width={200}
                            height={200}
                            src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                            alt={"user did'nt provide image"}
                          //  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                          />}
        </div>
        <div className="flex flex-col">
          <div className="">{teamName}</div>
          <div className="">{description}...</div>
          <button onClick={()=>setModal(true)}>MORE</button>
          <Modal isOpen={modal} onClose={modalCloseHandler}>
            
          <div className="flex flex-col">
            <h3>Team Leader:{leader?.name}</h3>
            <h3>Created By:{createdBy?.name}</h3>
            <h1>Team Members</h1>
            {members?.map((member)=>{
              return <div className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer" key={member._id.toString()}>

              <div className="flex gap-4 flex-col  md:flex-row ">
                            <div>
                            { member.image ? <img
                                
                                width={100}
                                height={100}
                                src={member.image}
                                alt={member.name}
                               // className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                               />:
                              <img
                                
                                width={100}
                                height={100}
                                src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                                alt={"team did'nt provide image"}
                              //  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                              />}
                            </div>
                            <div className="">
                              <h3
                                
                                className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                              >
                                {member.name}
                              </h3>
                              <p
                      
                                className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                              >
                                {member.gradYear}
                              </p>
                            </div>
                          </div>
                       
                          <Link
                            
                            href={`/user/${member._id}?id=${member._id}`}
                            className="addButton px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0" 
                          
                          >
                            View Profile
                          </Link>
              
                      </div> 
            }
         
            )}
            </div>
          </Modal>


        </div>

        </div>
        <div className="w-[100%] h-[50%]  flex flex-col justify-center items-center">
         
         <div className="">
         <button onClick={()=>setEventModal(true)}>Create Event</button>
         <EventModal isOpen={eventModal} onClose={eventModalCloseHandler}>
          <CreateEvent teamId={id} members={members} />
         </EventModal>
         </div>
         
          <TeamPostModal teamName={teamName} teamId={id}/>
          
        </div>
       
      </div>



      <div className="w-[45%] h-[100%] border-white bg-lime-950 rounded-2xl overflow-y-scroll ">
             <h1 className="w-[90%] text-center">Upcoming Events</h1>

             {events?.map((event) => (
            <div 
              key={event._id.toString()}
              className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-purple-100 group w-[90%] mt-4 mx-[4.5%]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-purple-800 group-hover:text-purple-600 transition-colors">{event.name}</h3>
                  <p className="text-purple-600 text-sm mt-1 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </p>
                  <p className="text-purple-500 text-sm">{event.location}</p>
                </div>
                <Link href={`/event/${event._id.toString()}?uid=${mongoId}`} className="text-pink-600 hover:bg-pink-50 p-2 rounded-full transition-colors group-hover:rotate-45 transform duration-300">
                  <ArrowUpRight />
                </Link>
              </div>
              <p className="mt-2 text-purple-700">{event.description}</p>
              <div className="mt-3 flex items-center gap-2 text-purple-500">
                <Users size={16} />
                <span>{event.participated?.length==0?"0":event?.participated?.length} attending</span>
              </div>
            </div>
          ))}
      </div>
      
    </div>
  )
}

export default TeamPage;
