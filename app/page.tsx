'use client'

import Link from "next/link";

import { useSession } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";


const Home = () => {

  const {isLoaded}=useSession();
 const {userId}=useAuth();
 const {user}=useUser();
const {signUp}=useSignUp();
 //console.log(sessionId,getToken)

 const mongoId=user?.publicMetadata?.mId as string
  
useEffect(() => {
  const fetchData = async () => {

  console.log("happening")
 
  if(signUp?.status==='complete'){ 
    try {
      const result=await fetch('/api/createuser',{
          method: 'POST',
           headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name:user?.firstName,
            email:user?.primaryEmailAddress?.emailAddress,
            
             }) });
      if(result.ok){

        toast.success('User created successfully');
        console.log("Done")
      }else{
        toast.error('Failed to transfer user data');
        console.error('Error:', result);
      }
    } catch (error) {
      toast.error('Failed to create user');
      console.error('Error:', error);
    }}
  };

  fetchData();

 
}, [signUp?.status]);

  if(!isLoaded) return <div>Loading...</div>
  
  return (
    <div className='py-4 w-full'>
      <div className="w-[80vw] h-[2%] flex flex-row justify-around mx-[10vw]">
      
        <Link  href={`/becommunity?id=${mongoId}`} className="shadow-[inset_0_0_0_2px_#616467] text-gray-400 px-[5%] py-[2%] rounded-full tracking-widest  font-bold bg-transparent 
        
        hover:bg-[#616467] hover:text-white  transition duration-200">BeCommunity</Link>
        <Link href="/" className="shadow-[inset_0_0_0_2px_#616467]  px-[5%] py-[2%]  rounded-full tracking-widest text-gray-400  font-bold bg-transparent hover:bg-[#616467] hover:text-white  transition duration-200">Home</Link>
        <Link href="/academics" className="shadow-[inset_0_0_0_2px_#616467] text-gray-400 px-[5%] py-[2%]  rounded-full tracking-widest  font-bold bg-transparent hover:bg-[#616467] hover:text-white  transition duration-200">Academics</Link>
      </div>

     
  
      
           
           <div className=" bg-slate-500 text-right text-white p-4">
            {mongoId}
           </div>
    </div>
  )
}

export default Home;