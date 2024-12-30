'use client'
import React from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useState,useEffect } from 'react'
import ITeam from '@/models/Team'
import Modal from '../Modal/Modal'
import { IUser } from '../expandableCards/card'
import { IEvent } from '@/app/team/[id]/page'
const SubHeader = () => {
  const {user,isLoaded}=useUser();
  const mongoId=user?.publicMetadata.mongoId as string
  const [teamIds,setTeamIds]=useState<string[] |null>(null);
  const [teams,setTeams]=useState<ITeam[]>([]);
  const [events,setEvents]=useState<IEvent[]>([]);

  useEffect(() => { 
    // Access localStorage only on the client side
     if (typeof window !== 'undefined') { 
      const storedTeamIds = localStorage.getItem('teamIds');
          if(storedTeamIds){
       setTeamIds(JSON.parse
        (storedTeamIds)); }
       }
      },

        [isLoaded]); 


 
  const [teamModal,setTeamModal]=useState(false);
  const [eventModal,setEventModal]=useState(false);
  const [workModal,setWorkModal]=useState(false);

  const handleCloseEventModal=()=>{setEventModal(false)}
  const handleOpenEventModal=()=>{setEventModal(true)}

  const handleOpenTeamModal=()=>{
    setTeamModal(true)
  }
  const handleCloseTeamModal=()=>{
    setTeamModal(false)
  }
  
  useEffect(() => {
     
 const handleTeamsData=()=>{const fetchData = async () => {
  if (isLoaded && user && mongoId) {
    try {
      const result = await fetch(`/api/currentperson?id=${mongoId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
       
      });
      const data = await result.json();
      setTeams(data.teams);
      setEvents(data.events);
      localStorage.setItem("teams",JSON.stringify(data.teams));
     localStorage.setItem('currentUser', JSON.stringify(data));
      if (result.ok) {
        console.log('teams retrieved successfully');
      } else {
       console.error('Failed to retrieve teams');
      }
    } catch (error) {
      console.error('Error:', error);
      
    }
  }
}
fetchData();
}

    handleTeamsData();
  }, [isLoaded, user, mongoId]);
 
 
  console.log("teams",teams)

  return (
    <div className='absolute  top-0 left-[5vw]  right-[8vw] w-[50vw] bg-[#555a4a] h-[8vh] my-4 rounded-full items-center text-white flex flex-row justify-between'>
      <Link href={'/'}>Home</Link>
      <div className="mx-[5%]">
        
      <button onClick={()=>handleOpenTeamModal()}>Affliated Teams</button>
    <Modal isOpen={teamModal} onClose={handleCloseTeamModal}>
      {teams?.length > 0 && (teams?.map((team) => (
        team._id && <div className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer" key={team._id.toString()}>

<div className="flex gap-4 flex-col  md:flex-row ">
              <div>
              { team.timage ? <img
                  
                  width={100}
                  height={100}
                  src={team.timage}
                  alt={team.name}
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
                  {team.name}
                </h3>
                <p
        
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                >
                  {team.description}
                </p>
              </div>
            </div>
         
            <Link
              onClick={()=>setTeamModal(false)}
              href={`/team/${team._id}?id=${team._id}`}
              className="addButton px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0" 
            
            >
              View Team
            </Link>

        </div>
      )))}
    </Modal></div>

    <div className="mx-[5%]">
        
      <button onClick={()=>handleOpenEventModal()}>Affliated Events</button>
    <Modal isOpen={eventModal} onClose={handleCloseEventModal}>
      {events?.length > 0 && (events?.map((event) => (
        event._id && <div className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer" key={event._id.toString()}>

<div className="flex gap-4 flex-col  md:flex-row ">
              <div>
              { event.image ? <img
                  
                  width={100}
                  height={100}
                  src={event.image}
                  alt={event.name}
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
                  {event.name}
                </h3>
                <p
        
                  className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                >
                  {event.description}
                </p>
              </div>
            </div>
         
            <Link
              onClick={()=>setEventModal(false)}
              href={`/event/${event._id}?uid=${mongoId}`}
              className="addButton px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0" 
            
            >
              View Event
            </Link>

        </div>
      )))}
    </Modal></div>

      
      {/*<Link href={'/academics'}>Assigned Works</Link> */ } 
         </div>
  )
}

export default SubHeader
