'use client'

import { FormEvent, useEffect, useState,Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import SimPeopleWithSuspense from "@/components/commonPeople/SimPeople";
import { newMember } from "@/components/expandableCards/card";
import { toast } from "react-toastify";
import { IUser } from "@/components/expandableCards/card";


const CreateEvent = ({members, teamId}: {members: IUser[] |null, teamId: string|null}) => {
     const [name, setName] = useState(''); 
     const [description, setDescription] = useState(''); 
     const [eventDate, setEventDate] = useState('');
     const [eventMembers,setEventMembers]=useState<IUser[] |null>(members);
     
       const [leaders, setLeaders] = useState<newMember[]>(); 
       const [newMembers,setNewMembers]=useState<IUser[]|null>(null);
     //  const [timage, setTimage] = useState('');
     // const [choosed, setChoosed] = useState(false);

     

      const currentPerson=localStorage.getItem('currentUser')?JSON.parse(localStorage.getItem('currentUser') as string):null;

      if(members){
        const newMembers=[...members,currentPerson];
        setNewMembers(newMembers);
      }else{
        const newMembers=[currentPerson];
        setNewMembers(newMembers);
      }
      

           

        const handleSubmit = async (event:FormEvent) => { 
            event.preventDefault(); // Prepare data
              const data = { name, description, date:eventDate, members:eventMembers, leaders, createdBy: currentPerson?currentPerson._id:null, teamId };
        
              // Send data to the API

              try {
                const response = await fetch(`/api/events`, { method: 'POST', 
                  headers: { 'Content-Type': 'application/json' }, 
                  body: JSON.stringify(data), });
                  const resData:IUser |null=await response.json(); 
                  // Handle response
                  if (response.ok) { 
                    
                    toast.success('Event created successfully!');
                   

                    window.location.href = `/team/${teamId}?id=${teamId}`;
                    } else { 
                      toast.error('Failed to create Event!');
                        redirect(`/`);
                        }
              } catch (error) {
                console.error('Error creating Event:', error);
              
                
              }
             

           };

                              const removeHandler=(id:string)=>{
                                const newMembers=eventMembers?.filter(member=>member._id.toString()!==id);
                                if(newMembers){
                                setEventMembers(newMembers);
                                }else{
                                  setEventMembers([]);
                                }
                              }

                              const removeLeader=(id:string)=>{
                                if(leaders){
                                 const newLeaders=leaders.filter(leader=>leader._id.toString()!==id);
                                  setLeaders(newLeaders);
                                }else{
                                  setLeaders([]);
                                }
                                
                              }

                const addLeaders=(member:newMember)=>{
                  if(leaders){
                    setLeaders([...leaders,member]);
                  }else{
                    setLeaders([member]);
                  }
                }  
                
                const addToEvent=(member:IUser)=>{
                  if(eventMembers){
                    setEventMembers([...eventMembers,member]);
                  }else{
                    setEventMembers([member]);
                  }
                }


    return (
        <div className="flex flex-row relative w-[100vw] ">

          <div className="absolute left-5  h-[80vh] w-[45vw]">
           <form  className="create-team-form w-[100%] my-[20%] flex flex-col " onSubmit={handleSubmit}>

             <div className="w-[80%] px-4 py-2 flex flex-col ">
               <label htmlFor="name">Event Name:</label>
              <input type="text" id="name"  className="bg-[#484444] rounded-full h-[35px] px-5" value={name} onChange={(e) =>
                 setName(e.target.value)} required /> 
                 </div>


                  <div className="w-[80%] px-4 py-2 flex flex-col "> 
                    <label htmlFor="description">Description</label>
                   <textarea id="description" value={description} className="bg-[#484444] rounded-full h-[6%] px-5"
                   onChange={(e) => setDescription(e.target.value)} required /> 
                   </div> 

                  {
                    eventMembers && eventMembers.length > 0 && (
                      <div className="">Crew for the Event:
                        {eventMembers?.map(member=>(
                            <div className="flex flex-row" key={member._id.toString()} >
                                <div className="">
                              {member.name  }  
                              { member.gradYear}</div>
                              <button className="mx-10 bg-red-500 rounded-full w-7 h-7" onClick={()=>removeHandler(member._id.toString())}>X</button>
                            
                              <button  className= {`$ mx-10 bg-lime-600  rounded-full w-12 h-7`} onClick={()=>{
                                addLeaders(member);
                              
                              }}>Lead</button>
                              </div>
                            
                        ))}

                        {
                          leaders && (leaders.map((leader)=>(
                            <div key={leader._id.toString()}>
                              <h1>Leader:</h1>
                              <div>{leader.name}    <span onClick={()=>removeLeader(leader._id.toString())}>X</span> </div>   
                            </div>)
                          ))
                        }
                      </div>
                    )
                  }

                   <div className="w-[80%] px-4 py-2 flex flex-col "> 
                    <label htmlFor="eventDate">eventDate</label> 
                   <input type="date" id="eventDate" value={eventDate} className="bg-[#484444] rounded-full h-[6%] px-5" required
                   onChange={(e) => setEventDate(e.target.value)} /> 
                   </div>


                   
                     
                     


                       
                          <button type="submit" className="mx-[20%] h-8 w-[40%] bg-slate-600 rounded-full">Create Team</button> </form>
          </div>
          
          <div className="w-[45%] overflow-y-scroll h-[80vh] rounded-[8px] border-[4px] absolute  top-[10vh] right-5 left-[50%]">
          {newMembers && newMembers?.length>0 && 
          newMembers.map(member=>(
            <div className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer" key={member._id.toString()}>

              <div className="flex gap-4 flex-col  md:flex-row ">
                            <div>
                            { member.image ? <img
                                
                                width={100}
                                height={100}
                                src={member.image}
                                alt={member.name}
                               // className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                               />:
                              <img
                                
                                width={100}
                                height={100}
                                src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                                alt={"team did'nt provide image"}
                              //  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                              />}
                            </div>
                            <div className="">
                              <h3
                                
                                className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                              >
                                {member.name}
                              </h3>
                              <p
                      
                                className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                              >
                                {member.gradYear}
                              </p>
                            </div>
                          </div>
                       
                          <button
                            
                            onClick={()=>addToEvent(member)}
                            className="addButton px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0" 
                          
                          >
                            Add To Event
                          </button>
              
                      </div> 
          ))
          }
            </div>
           
        </div>
    );
}




export default CreateEvent;
