'use client'

import { redirect, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState,useEffect } from "react";
const EventPage = () => {
const searchParams=useSearchParams();
const uid=searchParams.get("uid");

const {user,isLoaded}=useUser();
const mongoId=user?.publicMetadata.mongoId as string
useEffect(()=>{
if(uid!==mongoId){
  redirect('/')
}
},[isLoaded])

  return (
    <div className='w-[90vw] h-auto '>
      <div className="h-[50vh] mx-[20%] bg-[#1d4339e3]">img</div>
      
      
    </div>
  )
}
 
export default EventPage
