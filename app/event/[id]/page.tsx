'use client'

import { redirect, useSearchParams } from "next/navigation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from "@clerk/nextjs";
import { useState,useEffect } from "react";
import { IUser } from "@/components/expandableCards/card";
import ITeam from "@/models/Team";
const EventPage = () => {

  const [name,setName]=useState('');
  const [description,setDescription]=useState('');
  const [date,setDate]=useState('');
  const [members,setMembers]=useState<IUser[] | null>([]);
  const [leaders,setLeaders]=useState<IUser[] | null>([]);
  const [image,setImage]=useState('');
  const [createdBy,setCreatedBy]=useState<IUser | null>();
  const [team,setTeam]=useState<ITeam | null>();
 const [time,setTime]=useState('');
 const [location,setLocation]=useState('');

const searchParams=useSearchParams();
const uid=searchParams.get("uid");

const {user,isLoaded}=useUser();
const mongoId=user?.publicMetadata.mongoId as string
useEffect(()=>{
if(uid!==mongoId){
  redirect('/')
}
},[isLoaded])

useEffect(()=>{
  const pathname = window.location.pathname;
   const eventId = pathname.split("/")[2];
   const handleEventData=async()=>{
      const res=await fetch(`/api/events?id=${eventId}`)
      const data=await res.json();
      if(res.ok){
        setName(data.name);
        setDescription(data.description);
        setDate(data.date);
        setImage(data.image);
        setMembers(data.members);
        setLeaders(data.leaders);
        setCreatedBy(data.createdBy);
        setTime(data.time);
        setLocation(data.location);
        console.log(data)
      }else{
        toast.error("failed to fetch event data")
      }

   }
    handleEventData();
},[])

  return (
    <div className='w-[90vw] h-auto '>
      <div className="h-[50vh] mx-[20%] bg-[#1d4339e3]">img</div>
      
      <div className="h-[50vh] mx-[20%] bg-[#1d4339e3]">
        <h1>{name}</h1>
        <p>{description}</p>
        <p>{date}</p>
        <p>{time}</p>
        <p>{location}</p>
        <p>{createdBy?.name}</p>
        <p>{team?.name}</p>
        <p>Members</p>
        {members?.map(member=><p>{member.name}</p>)}
        <p>Leaders</p>
        {leaders?.map(leader=><p>{leader.name}</p>)}
        </div>
    </div>
  )
}
 
export default EventPage
