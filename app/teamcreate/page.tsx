'use client'

import { FormEvent, useEffect, useState,Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import SimPeopleWithSuspense from "@/components/commonPeople/SimPeople";
import { newMember } from "@/components/expandableCards/card";
import { toast } from "react-toastify";
import { IUser } from "@/components/expandableCards/card";
import Image from "next/image";


const CreateTeam = () => {
     const [name, setName] = useState(''); 
     const [description, setDescription] = useState(''); 
     const [deadline, setDeadline] = useState('');
      const [members, setMembers] = useState<IUser[]>([]);
       const [leader, setLeader] = useState<IUser>(); 
       const [currentPerson,setCurrentPerson]=useState<IUser>()

       const [similarPeople,setSimilarPeople]=useState<IUser[]>([]);
     //  const [timage, setTimage] = useState('');
     // const [choosed, setChoosed] = useState(false);

      const searchParams = useSearchParams();
      const id = searchParams.get('id') as string;

       




          useEffect(() => { 
            const fetchPeople = async () => {
    
             try { 
                const response = await fetch(`/api/people?id=${id}`); 
    
                const data = await response.json();
                 setSimilarPeople(Array.isArray(data) ? data : []);
                 } catch (error) { console.error('Error fetching people:', error); } };

                 const fetchCurrentPerson = async () => { 
                  try { const response = await fetch(`/api/currentperson?id=${id}`); 
                      const data = await response.json();
                       setCurrentPerson(data);
                       
                       
                       
                      } catch (error) { 
                          console.error('Error fetching current person:', error); 
                      }
                  }

               fetchCurrentPerson();
    
                 fetchPeople();
    
         
    
                 
                  }, [id]);
                  
                  useEffect(() => {
                     if (currentPerson && members.length === 0) {
                       setMembers([currentPerson]); } }, [currentPerson, members])
            
           

        const handleSubmit = async (event:FormEvent) => { 
            event.preventDefault(); // Prepare data

            
    if (!name || !description || !deadline || !members ||!leader || !id ) {
       toast.error('Please fill in all required fields.'); 

      return;}

              const data = { name, description, deadline, members, leader, createdBy: id }; 
              // Send data to the API

              try {
                const response = await fetch(`/api/team`, { method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify(data), });
                  const resData:IUser |null=await response.json(); 
                  // Handle response
                  if (response.ok) { 
                    
                    toast.success('Team created successfully!');
                    localStorage.removeItem('members');

                    window.location.href = `/`;
                    } else { 
                      toast.error('Failed to create team!');
                        redirect(`/`);
                        }
              } catch (error) {
                console.error('Error creating team:', error);
              
                
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
           <form  className="create-team-form w-[100%] my-[20%] flex flex-col " onSubmit={handleSubmit}>

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
                              {(member._id.toString()!==currentPerson?._id.toString())&&<button className="mx-10 bg-red-500 rounded-full w-7 h-7" onClick={()=>removeHandler(member._id.toString())}>X</button>}
                            
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
          {
            similarPeople.map((user)=>(
              <div className="w-[80%] h-20 flex flex-row justify-evenly items-center" key={user._id.toString()}>
                <div className="overflow-hidden w-20 h-20">
                 <Image src={user.image || " "} className=""  width={200} height={200} alt={user.name} />

                </div>
                <div className="flex flex-col">
                  <div className="">{user.name}</div>
                  <div className="">{user.gradYear}</div>
                </div>
                <button className="" onClick={()=>{const newMembers=[...members,user]
                  setMembers(newMembers);
                }}>Add to Team</button>
              </div>
            ))
          }
            </div>
           
        </div>
    );
}





const CreateTeamWithSuspense = () => (
   <Suspense fallback={<div>Loading...</div>}>
     <CreateTeam /> 
     </Suspense> )

export default CreateTeamWithSuspense;
