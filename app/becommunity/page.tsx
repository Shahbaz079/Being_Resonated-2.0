'use client'

import SimPeople from "@/components/commonPeople/SimPeople"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

const beCommunity = () => {
const {data:session,status}=useSession();
  if(!session?.user?.id){
    redirect('/login');
 }
  return (
    <div className="w-[100vw] h-auto relative">
           <div className="absolute left-[10%] right-[10%] top-5  h-[15vh] w-[80%] bg-[#484444] rounded-2xl">
            <h1>Evnets and updates</h1>
           </div>

            <div className="absolute left-[10%] right-[40%] top-[20vh] h-[70vh]  bg-[#484444] rounded-2xl">
              <h1>Community Posts</h1> 
              </div>

              <div className="absolute left-[65%] right-[10%] overflow-y-scroll top-[20vh] h-[70vh] bg-[#484444] rounded-2xl">
              <SimPeople/>

              </div>
    </div>
  )
}

export default beCommunity