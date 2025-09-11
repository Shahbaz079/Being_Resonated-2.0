'use client'
import Link from "next/link";
import { useState } from "react"


import { useAuth } from "@/lib/hooks/useAuth";

const Profile = () => {
const [isHovered,setIsHovered]=useState(false);
 

 const {user}=useAuth();

  return (
    <div className={`bg-[#3498db] mx-5 rounded-full transition-[width] ease duration-300 ${isHovered?"w-[120px]":"w-[40px] "} h-[40px]   `}  onMouseEnter={()=>{setIsHovered(true)}} onMouseLeave={()=>{setIsHovered(false)}}>
    {isHovered ? ( user ? ( <Link className="relative left-6 top-2 text-pretty " href={`/profile?id=${user._id}`}>{user.name} </Link> ) : ( <Link href="/login"> Login</Link> ) ) :null }
    </div>
  )
}

export default Profile
