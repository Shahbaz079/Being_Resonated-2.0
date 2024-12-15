"use client"
import Ring from "@/components/ring/ring";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import  {useEffect} from "react";
import { useState } from "react";
import { use } from "react";

const ProfilePage = ({params}:{ params: { id: Promise<string> }}) => {
  const unwrappedParams = use(params)  // Unwrap the promise 
  const { id } = unwrappedParams;

  const {data:session,status}=useSession();

  const [user, setUser] = useState<any>(null); // Type appropriately
   const [firstName, setFirstName] = useState<string>(""); const [lastName, setLastName] = useState<string>(""); const [email, setEmail] = useState<string>(""); const [interests, setInterests] = useState<string[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [assignedWorks, setAssignedWorks] = useState<string[]>([]);
    const [birthDate, setBirthDate] = useState<Date>(); 
    const [gradYear, setGradYear] = useState<string>(""); 

 useEffect(() => { if (status === 'authenticated' && session?.user?.id !== id) {
     redirect('/'); 
    
    } else if (id) { 


      fetch(`/api/user/${id}`)  
      .then(response => response.json()) 
      .then(data => {setUser(data)
            setFirstName(data.firstName || ""); 
            setLastName(data.lastName || ""); 
            setEmail(data.email || ""); 
            setInterests(data.interests || []);
             setTeams(data.teams || []);
             setAssignedWorks(data.assignedWorks || []);
             setBirthDate(data.dob || "")
             setGradYear(data.gradyr || "")
             

      }) 
      .catch(error => console.error('Error fetching user:', error)); } },
       [status, session, id]);
  
  

 

  if(status=="loading"){
    return <>
    <div className="">Loading....</div>
    </>
  }
 


  return (<div className="mainContainer">
    
    <div className=" text-gray-300 cardContainer" style={{"--quantity":3}} >
      <div style={{"--position":1}} className="cards w-[60%]  mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-gradient-start to-gradient-end rounded-xl  flex flex-col justify-center">
        <h1 className="text-center text-[#9e8e9af8] text-2xl font-semibold italic">Personal Details</h1>

        <div className="h-[75%] flex flex-col justify-start align-middle text-lg">

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Name:    {firstName} {lastName}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Email: {email}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Graduation Year:{gradYear?gradYear:"Not Provided"}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Date Of Birth: {birthDate?birthDate.toLocaleDateString():"Not Provided"}</div>

        </div>
        

      </div>

      <div style={{"--position":2}} className="cards w-[60%] mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-[#f2a4a4] to-[#848383] rounded-xl  flex flex-col justify-center">
        <h1 className="text-center text-[#9e8e9af8] text-2xl font-semibold italic">Teams</h1>

        <div className="h-[75%] flex flex-col justify-start align-middle text-lg">

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Name:    {firstName} {lastName}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Email: {email}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Graduation Year:{gradYear?gradYear:"Not Provided"}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Date Of Birth: {birthDate?birthDate.toLocaleDateString():"Not Provided"}</div>

        </div>
        

      </div>

      <div style={{"--position":3}} className="cards w-[60%] mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-[#09b9b6] to-[#2f4a4b] rounded-xl  flex flex-col justify-center">
        <h1 className="text-center text-[#9e8e9af8] text-2xl font-semibold italic">Assigned Works</h1>

        <div className="h-[75%] flex flex-col justify-start align-middle text-lg">

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Name:    {firstName} {lastName}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Email: {email}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Graduation Year:{gradYear?gradYear:"Not Provided"}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Date Of Birth: {birthDate?birthDate.toLocaleDateString():"Not Provided"}</div>

        </div>
        

      </div>
    </div>



  <Ring/>




    
    </div>
  )
}

export default ProfilePage
