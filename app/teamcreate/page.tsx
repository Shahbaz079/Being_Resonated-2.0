'use client'

import { FormEvent, useEffect, useState,Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import SimPeopleWithSuspense from "@/components/commonPeople/SimPeople";
import { newMember } from "@/components/expandableCards/card";
import { toast } from "react-toastify";
import { IUser } from "@/components/expandableCards/card";

const CreateTeam = () => {
     const [name, setName] = useState(''); 
     const [description, setDescription] = useState(''); 
     const [deadline, setDeadline] = useState('');
      const [members, setMembers] = useState<newMember[]>([]);
       const [leader, setLeader] = useState<newMember>(); 
       const [currentperson,setCurrentPerson]=useState<IUser>()
     //  const [timage, setTimage] = useState('');
     // const [choosed, setChoosed] = useState(false);

      const searchParams = useSearchParams();
      const id = searchParams.get('id') as string;

       const loadMembers = () => { 
        const storedUser = localStorage.getItem('currentUser');
          const storedMembersString = localStorage.getItem('members');
           if (storedMembersString) { 
            const storedMembers: newMember[] = JSON.parse(storedMembersString); 
            setMembers(storedMembers); 
          if(storedUser){
            setCurrentPerson(JSON.parse(storedUser));
            const totalMembers=[...storedMembers,JSON.parse(storedUser)]
            setMembers(totalMembers);
          } 
          } };
            
            useEffect(() => {
               loadMembers(); 
               // Initial load
                const handleStorageChange = () => { 
                  loadMembers();
                 };
                 
                 window.addEventListener('local-storage-update', handleStorageChange);
                  return () => {
                     window.removeEventListener('local-storage-update', handleStorageChange);
                     }; }, [])
           

        const handleSubmit = async (event:FormEvent) => { 
            event.preventDefault(); // Prepare data
              const data = { name, description, deadline, members, leader, createdBy: id }; 
              // Send data to the API

              try {
                const response = await fetch(`/api/team/${id}`, { method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify(data), });
                  const resData:IUser |null=await response.json(); 
                  // Handle response
                  if (response.ok) { 
                    
                    toast.success('Team created successfully!');
                    localStorage.removeItem('members');

                    redirect(`/team/${resData?._id}?id=${resData?._id}`);
                    } else { 
                      toast.error('Failed to create team!');  }
              } catch (error) {
                console.error('Error creating team:', error);
                redirect(`/`);
                
              }
             

           };

                              const removeHandler=(id:string)=>{
                                const newMembers=members.filter(member=>member._id.toString()!==id);
                                setMembers(newMembers);
                                localStorage.setItem('members',JSON.stringify(newMembers));
                              }


    return (
        <div className="flex flex-row relative w-[100vw] ">

          <div className="absolute left-5  h-[80vh] w-[45vw]">
           <form  className="create-team-form w-[100%] my-[20%] flex flex-col " onSubmit={()=>handleSubmit}>

             <div className="w-[80%] px-4 py-2 flex flex-col ">
               <label htmlFor="name">Team Name:</label>
              <input type="text" id="name" className="bg-[#484444] rounded-full h-[35px] px-5" value={name} onChange={(e) =>
                 setName(e.target.value)} required /> 
                 </div>


                  <div className="w-[80%] px-4 py-2 flex flex-col "> 
                    <label htmlFor="description">Description</label>
                   <textarea id="description" value={description} className="bg-[#484444] rounded-full h-[6%] px-5"
                   onChange={(e) => setDescription(e.target.value)} required /> 
                   </div> 

                  {
                    members.length>0 && (
                      <div className="">Your Crew:
                        {members.map(member=>(
                            <div className="flex flex-row" key={member._id.toString()} >
                                <div className="">
                              {member.name    }  
                              {    member.gradYear}</div>
                              {(member._id.toString()!==currentperson?._id.toString())&&<button className="mx-10 bg-red-500 rounded-full w-7 h-7" onClick={()=>removeHandler(member._id.toString())}>X</button>}
                            
                              <button  className= {`$ mx-10 bg-lime-600  rounded-full w-12 h-7`} onClick={()=>{
                                setLeader(member);
                              
                              }}>Lead</button>
                              </div>
                            
                        ))}

                        {
                          leader && (
                            <div>
                              <h1>Leader:</h1>
                              <div>{leader.name}</div>
                            </div>
                          )
                        }
                      </div>
                    )
                  }

                   <div className="w-[80%] px-4 py-2 flex flex-col "> 
                    <label htmlFor="deadline">Deadline</label> 
                   <input type="date" id="deadline" value={deadline} className="bg-[#484444] rounded-full h-[6%] px-5"
                   onChange={(e) => setDeadline(e.target.value)} /> 
                   </div>


                   
                     
                     


                       
                          <button type="submit" className="mx-[20%] h-8 w-[40%] bg-slate-600 rounded-full">Create Team</button> </form>
          </div>
          
          <div className="w-[45%] overflow-y-scroll h-[80vh] rounded-[8px] border-[4px] absolute  top-[10vh] right-5 left-[50%]">
          <SimPeopleWithSuspense/>
            </div>
           
        </div>
    );
}





const CreateTeamWithSuspense = () => (
   <Suspense fallback={<div>Loading...</div>}>
     <CreateTeam /> 
     </Suspense> )

export default CreateTeamWithSuspense;
