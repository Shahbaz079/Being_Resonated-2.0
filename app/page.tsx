'use client'

import Link from "next/link";

import { useSession } from "@clerk/nextjs";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";



const Home = () => {

  const { isLoaded } = useSession();
  const { userId } = useAuth();
  const { user } = useUser();

  //console.log(sessionId,getToken)
  const [mongoId, setMongoId] = useState(user?.publicMetadata?.mongoId as string)

  useEffect(() => {
    setMongoId(user?.publicMetadata?.mongoId as string)
  }, [isLoaded, userId, user])



  console.log("userId", userId)
  console.log("mongoId", mongoId)

  useEffect(() => {
    if (!isLoaded) {
      return
    }
    const fetchData = async () => {



      if (userId && (!mongoId || mongoId === '' || mongoId === undefined)) {
        try {
          const result = await fetch('/api/createuser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user?.firstName,
              email: user?.primaryEmailAddress?.emailAddress,

            })
          });
          if (result.ok) {

            toast.success('User created successfully');
            console.log("Done")
          } else if (result.status === 400) {
            const res = await fetch('/api/retrieve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user?.primaryEmailAddress?.emailAddress,
                userId: userId,
                image: user?.imageUrl,

              })
            });

            if (res.ok) {

              console.log('User retrieved successfully');
            }
          }

          else {

            console.error('Error:', result);
          }
        } catch (error) {

          console.error('Error:', error);
        }
      }
    };
    if (mongoId == null || mongoId === '' || mongoId === undefined) {
      fetchData();
    }

  }, [isLoaded, userId, mongoId, user]);

  useEffect(() => {
    if (isLoaded && user?.imageUrl) {
      // Function to be triggered when profileImageUrl changes
      const handleProfileImageChange = () => {
        // Add your additional logic here 

        const fetchData = async () => {
          try {
            const result = await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user?.primaryEmailAddress?.emailAddress,
                image: user?.imageUrl,

              })
            });
            if (result.ok) {


              console.log("Done")
            }
            else {
              console.error('Error:', result);
            }
          } catch (error) {

            console.error('Error:', error);
          }
        }
        fetchData();
      };


      handleProfileImageChange();

    }
  }, [user?.imageUrl, isLoaded]);

  if (!isLoaded) return <div>Loading...</div>

  return (
    <div className="py-4 w-full">
      <div className="w-[80vw] h-[2%] flex flex-row justify-around mx-[10vw]">

        <Link href={`/becommunity?id=${mongoId}`} className="shadow-[inset_0_0_0_2px_#616467] text-gray-400 px-[5%] py-[2%] rounded-full tracking-widest  font-bold bg-transparent 
        
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