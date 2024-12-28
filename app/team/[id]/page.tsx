'use client'
import { IUser } from "@/components/expandableCards/card";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal/Modal";
import Link from "next/link";
const TeamPage = () => {
  
  const [members,setMembers]=useState<IUser[]|null>([])
  const [teamImg,setTeamImg]=useState<string|null>(null);
  const [description,setDescription]=useState<string|null>("");
const [createdBy,setCreatedBy]=useState<IUser|null>();
const [leader,setLeader]=useState<IUser>();
const [teamName,setTeamName]=useState<string>("")
const [modal,setModal]=useState(false);

const modalCloseHandler=()=>{
  setModal(false);
}

  const searchParams=useSearchParams();
  const id=searchParams.get("id");
  console.log(id)


  useEffect(()=>{
    const TeamHandler=async()=>{
      await fetch(`/api/team?id=${id}`).then(res=>res.json()).then(data=>{
        setMembers(data.members);
        setTeamImg(data.timage);
        setDescription(data.description);
        setCreatedBy(data.createdBy);
        setLeader(data.leader);
        setTeamName(data.name);
      })


    }

    TeamHandler();
  },[])
  
    
   
  

  

  return (
    <div className="w-[90vw] h-[80vh] flex flex-row ">
      
      <div className="w-[50%] h-[100%]">
        <div className="flex w-[100%] h-[30%] flex-row">
        <div className="w-[30%] h-[100%]">
          { teamImg ? <img
                            
                            width={200}
                            height={200}
                            src={teamImg}
                            alt={teamName}
                           // className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                           />:
                          <img
                            
                            width={200}
                            height={200}
                            src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                            alt={"user did'nt provide image"}
                          //  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                          />}
        </div>
        <div className="flex flex-col">
          <div className="">{teamName}</div>
          <div className="">{description}...</div>
          <button>MORE</button>
          <Modal isOpen={modal} onClose={modalCloseHandler}>
            
          <div className="flex flex-col">
            <h3>Team Leader:{leader?.name}</h3>
            <h3>Created By:{createdBy?.name}</h3>
            <h1>Team Members</h1>
            {members?.map((member)=>{
              return <div className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer" key={member._id.toString()}>

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
                       
                          <Link
                            
                            href={`/user/${member._id}?id=${member._id}`}
                            className="addButton px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0" 
                          
                          >
                            View Profile
                          </Link>
              
                      </div>
            }
         
            )}
            </div>
          </Modal>
        </div>

        </div>
       
      </div>



      <div className="w-[45%] h-[100%] border-white bg-lime-950 rounded-2xl">
             <h1 className="w-[90%] text-center">Upcoming Events</h1>
      </div>
      
    </div>
  );
}

export default TeamPage;
