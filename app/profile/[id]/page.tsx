"use client"
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
   const [firstName, setFirstName] = useState<string>(""); const [lastName, setLastName] = useState<string>(""); const [email, setEmail] = useState<string>(""); const [interests, setInterests] = useState<string[]>([]); const [teams, setTeams] = useState<string[]>([]);

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
      }) 
      .catch(error => console.error('Error fetching user:', error)); } },
       [status, session, id]);
  
  

 

  if(status=="loading"){
    return <>
    <div className="">Loading....</div>
    </>
  }
 


  return (
    <div>
      {firstName}{lastName}
      {email}
  
    </div>
  )
}

export default ProfilePage
