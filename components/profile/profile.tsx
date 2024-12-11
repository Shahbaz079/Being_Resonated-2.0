'use client'
import Link from "next/link";
import { useState } from "react"
import { auth } from "@/auth";
import { useSession } from "next-auth/react";

const Profile = () => {
const [isHovered,setIsHovered]=useState(false);
 const {data:session}=useSession();

 const user=session?.user
 console.log(session)
 console.log(user?.id)
  return (
    <div className={`bg-[#3498db] mx-5 rounded-full transition-[width] ease duration-300 ${isHovered?"w-[120px]":"w-[40px] "} h-[40px]   `}  onMouseEnter={()=>{setIsHovered(true)}} onMouseLeave={()=>{setIsHovered(false)}}>
    {isHovered ? ( user ? ( <Link className="relative left-6 top-2 text-pretty " href={`/profile/${user.id}`}>{user.name} </Link> ) : ( <Link href="/login"> Login</Link> ) ) :null }
    </div>
  )
}

export default Profile
