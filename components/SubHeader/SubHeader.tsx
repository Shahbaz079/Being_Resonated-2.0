'use client'
import React from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { Home, Users, Calendar, Search } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ITeam from '@/models/Team'

import { IEvent } from '@/app/team/[id]/page'
import Image from 'next/image'
import SearchPage from '../search/Search'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { useQuery } from '@tanstack/react-query'

const fetchTeamsAndEvents = async (id: string):Promise<{ teams: ITeam[]; events: IEvent[]}> => {
  const res = await fetch(`/api/currentperson?id=${id}&type=eandt`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}

const SubHeader = () => {
  const { user, isLoaded } = useUser();
  const mongoId = user?.publicMetadata.mongoId as string


  const [teamModal, setTeamModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);

  
  const handleOpenEventModal = () => { setEventModal(true) }

  const handleOpenTeamModal = () => {
    setTeamModal(true)
  }
  
  const { data:userData={teams:[],events:[]}, isLoading, error } = useQuery({
  queryKey: ['teamsAndEvents', mongoId],
  queryFn: () => fetchTeamsAndEvents(mongoId),
  enabled: isLoaded && !!mongoId,
  refetchOnWindowFocus: false, // optional: to avoid refetching on window focus
  staleTime:1000*60*1 // optional: data will be considered fresh for 1 minute
})



  return (
    <div className='fixed z-[990] top-2 left-[4%] right-[4%] pr-[35vw] bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg h-[8vh] mb-4 rounded-xl items-center text-white flex flex-row justify-between px-4'>

      <Link href={'/'}>
        <Home className="w-6 h-6" />
      </Link>





      <div className="mx-[5%]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleOpenTeamModal}>
                <Users className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Affiliated Teams</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dialog open={teamModal} onOpenChange={setTeamModal}>
          <DialogContent className="bg-slate-950 opacity-75">
            <DialogHeader>
            <DialogTitle>Affiliated Teams</DialogTitle>
          </DialogHeader>

          <div className='mt-5'>
            {userData?.teams?.length > 0 && (userData?.teams?.map((team) => (
            team._id && <div className="flex cursor-pointer p-2 rounded-xl justify-between items-center hover:bg-gray-700" key={team._id.toString()}>
              <div className="flex gap-4">
                <div>
                  {team.image ? <Image
                    width={100}
                    height={100}
                    src={team.image}
                    alt={team.name}
                    className='h-12 w-12 rounded-full'
                  /> :
                    <img
                      width={100}
                      height={100}
                      className='h-12 w-12 rounded-full'
                      src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                      alt={"team didn't provide image"}
                    />}
                </div>
                <div>
                  <h3 className="text-center text-cyan-300 text-md">
                    {team.name}
                  </h3>
                 
                </div>
              </div>
              <div><Link href={`/team/${team._id}?id=${team._id}`} className="border-2 border-cyan-500 text-cyan-500 w-fit px-2 py-1 mt-5 hover:opacity-70">View</Link></div>
               
              
            </div>
          )))}
          </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mx-[5%]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
                <button onClick={handleOpenEventModal}>
                  <Calendar className="w-6 h-6" />
                </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Affiliated Events</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dialog open={eventModal} onOpenChange={setEventModal}>
          <DialogContent className="bg-slate-950 opacity-75">
              <DialogHeader>
                <DialogTitle>Affiliated Events</DialogTitle>
            </DialogHeader>

            <div>
              {userData?.events?.length > 0 && (userData?.events?.map((event) => (
            event._id && <div className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer" key={event._id.toString()}>
              <div className="flex gap-4 flex-col  md:flex-row ">
                <div>
                  {event.image ? <img
                    width={100}
                    height={100}
                    src={event.image}
                    alt={event.name}
                    className='h-12 w-12 rounded-full'
                  /> :
                    <img
                      width={100}
                      height={100}
                      src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                      alt={"event didn't provide image"}
                      className='h-12 w-12 rounded-full'
                    />}
                </div>
                <div className="">
                  <h3 className="text-center text-cyan-300 text-md">
                    {event.name}
                  </h3>
                </div>
              </div>
              <Link
                onClick={() => setEventModal(false)}
                href={`/event/${event._id}`}
                className="border-2 border-cyan-500 text-cyan-500 w-fit px-2 py-1 mt-5 hover:opacity-70"
              >
                View
              </Link>
            </div>
          )))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <SearchPage type={'all'} click={null} />
    </div>
  )
}

export default SubHeader;
