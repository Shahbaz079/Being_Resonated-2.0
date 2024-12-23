"use client"
import Ring from "@/components/ring/ring";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import  {useEffect} from "react";
import { useState } from "react";
import { use } from "react";
import { ObjectId } from "mongoose";
import Link from "next/link";
import { MdOutlineModeEditOutline } from "react-icons/md";


interface Team { 
  _id:ObjectId;
  name: string; 
  motive: string; 
  deadline: Date;
   members: ObjectId[]; 
   leader: ObjectId; 
   createdAt?: Date; 
   updatedAt?: Date;}

const ProfilePage = ({params}:{ params: { id: Promise<string> }}) => {
  const unwrappedParams = use(params)  // Unwrap the promise 
  const { id } = unwrappedParams;

  const {data:session,status}=useSession();

 // const [user, setUser] = useState<any>(null); // Type appropriately
   const [name, setName] = useState<string>(""); 
   
   const [email, setEmail] = useState<string>("");
    const [interests, setInterests] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    //const [assignedWorks, setAssignedWorks] = useState<string[]>([]);
    const [birthDate, setBirthDate] = useState<Date>(); 
    const [gradYear, setGradYear] = useState<number>(); 


    const [edit,setEdit]=useState<boolean>(false);

    const redirectIfUnauthenticated = () =>
       { if (status === 'authenticated' && session?.user?.id !== id) { 
        redirect('/'); } };

        const fetchTeamData = async (teamId: string) => {
            try { 
              const response = await fetch(`/api/team/${teamId}`);
                const data = await response.json(); 
                setTeams(data); 
                console.log(data);
              } catch (error) { 
                console.error('Error fetching team:', error); } };
        
        
        const fetchUserData = async (userId: string) => { 
          try { const response = await fetch(`/api/user/${userId}`);
             const data = await response.json(); 
            // setUser(data);
              setName(data.name || ""); 
              setEmail(data.email || ""); 
              setInterests(data.interests || []); 
              setTeams(data.teams || []); 
             // setAssignedWorks(data.assignedWorks || []); 
              setBirthDate(data.dob || "");
               setGradYear(data.gradYear || ""); 
              } catch (error) { 
                console.error('Error fetching user:', error); } };
                
                useEffect(() => {
                   redirectIfUnauthenticated(); 
                   if (id) { fetchUserData(id);
                    fetchTeamData(id);
                    }
                  
                  },
                    [status, session, id]); 
  
  

       
        const [inputValue, setInputValue] = useState<string>('');

        const predefinedOptions = [ 'Web Dev', 'Poetry', 'Dance', 'Chess', 'Competitive Programming', 'Video Editing', 'Painting', 'T-shirt Design', 'Photography', 'LLM models',"coding","Music","Travel","Content Creation","Social Media Influencing","Enterprenuership","Socail Activity","Body Building","Robotics","Cooking" ]; 
        const handleAddOption = (option: string) => {
           if (!interests.includes(option)) { 
            setInterests([...interests, option]); } };


             const handleRemoveOption = (option: string) => {
               setInterests(interests.filter(item => item !== option)); }; 

               const filteredOptions = predefinedOptions.filter(option =>
                 option.toLowerCase().includes(inputValue.toLowerCase()) );
  
 

         const handleUpdate=()=>{
          setEdit(false);
           fetch(`/api/user/${id}`,{
            method:'POST',
            headers:{
              "content-Type":'application/json',
            },
            body:JSON.stringify({
              gradYear:gradYear, //edit it carefully
              interests:interests,
              dob:birthDate,
            })
          }).then(response=>response.json())
          .then(data=>{
           // setUser(data)
            
            setInterests(data.interests || []);
             setTeams(data.teams || []);
             
             setBirthDate(data.dob || "")
             setGradYear(data.gradyr || "")
             
          }).catch(error=>console.error('Error:',error))  
         }        
  
  if(status=="loading"){
    return <>
    <div className="">Loading....</div>
    </>
  } 
 


  return (<div className="mainContainer">
    
    <div className=" text-gray-300 cardContainer" style={{"--quantity":3}} >
     
      <div style={{"--position":3}} className="cards pCard w-[60%]  mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-[#527ff1] to-[#102438] rounded-xl  flex flex-col justify-center z-20">


      <button onClick={()=>setEdit(true)} className={`${edit?"hidden":""} absolute top-1 right-2 w-8 h-8 bg-slate-500 rounded-full`}>
      <MdOutlineModeEditOutline className="w-6 h-6"/>
        </button>       

        <div className=" h-[90%] flex flex-col justify-start align-middle text-lg">

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Name: {name} </div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Email: {email}</div>

          

             {edit?(<div className="flex flex-row">
          <label htmlFor="gradYear">Graduation Year:</label>
          <input type="number" className="w-[50%]" onChange={(e)=>setGradYear(Number(e.target.value))} />
          </div>):
          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6] flex flex-row">
          <div className="">Graduation Year:</div>
          <div className="">{gradYear?gradYear:<div>Not Provided </div>}</div></div>
            
        }



          {edit?(<div className="flex flex-row">
          <label htmlFor="birthDate">Birth date:</label>
          <input type="date" className="w-[50%]" onChange={(e)=>setBirthDate(new Date(e.target.value))} />
          </div>):
          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6] flex flex-row">
          <div className="">Birth Date:</div>
          <div className="">{birthDate?birthDate.toString():<div>Not Provided </div>}</div></div>
            
        }


          {
            edit?(<>
            <div>
               <label htmlFor="custom-dropdown">Choose your interests:</label> 
               <input id="custom-dropdown" value={inputValue}
                onChange={(e) => setInputValue(e.target.value)} placeholder="Type to search..." /> 
                {inputValue && ( <div className="dropdown">
                   {filteredOptions.map((option, index) => (
                     <div key={index} 
                     onClick={() => { handleAddOption(option); setInputValue('');
                       // Clear input after adding 
                        }} className="dropdown-item" > 

                        {option} </div> ))} </div> )} 

                        <div> <h3>Selected Interests:</h3>
                         <ul> {interests.map((option, index) => ( <li key={index}> {option} <button onClick={() => handleRemoveOption(option)}>Remove</button> </li> ))} </ul> </div> </div>

            </>):<div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6] flex flex-row">
            <div className="">Interests:</div>
            <div className="">
              {interests.length?(<div>
                {interests.map((intrest)=>(
                  <div className="flex w-auto h-[15px] " key={intrest}>#{intrest}</div>
                ))}
              </div>):"   Not Provided"}
            </div>
            </div>
          }

         {
          edit?<button onClick={()=>handleUpdate()}>Update</button>:(<></>)
         }



        </div>
        
       
      </div>

      <div style={{"--position":2}} className="cards tCard  w-[60%] mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-[#f2a4a4] to-[#848383] rounded-xl  flex flex-col justify-center z-10">
       {teams.length?(
        <div className="w-[90%] h-[90%] p-3 flex flex-col ">
         {
          teams.map((team)=>(
            <div className="w-[100%] h-8 rounded-[5px] text-center bg-neutral-500 rounded-full py-2 my-2" key={team.name}>{team.name}</div>
          ))
         }
         <Link href={`/becommunity`} className="w-[100%] h-8 rounded-[5px] bg-[#179883]">Join Teams</Link>
         <Link href={`/teamcreate?id=${id}`} className="w-[100%] h-8 rounded-[5px] bg-[#179883]">Create Team</Link>
        </div>
       ):(<>
         <Link href={`/becommunity`} className="w-[100%] h-8 rounded-[5px] bg-[#179883]">Join Teams</Link>
         <Link href={`/teamcreate?id=${id}`} className="w-[100%] h-8 rounded-[5px] bg-[#179883]">Create Team</Link>
       </>)}
        

      </div>

      <div style={{"--position":1}} className="cards wCard w-[60%] mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-[#09b9b6] to-[#2f4a4b] rounded-xl  flex flex-col justify-center z-0">
        <h1 className="text-center text-[#9e8e9af8] text-2xl font-semibold italic">Assigned Works</h1>

        <div className="h-[75%] flex flex-col justify-start align-middle text-lg">

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Name:    {name}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Email: {email}</div>

          <div className="w-[100%] rounded-full px-2 py-2 my-4  bg-gradient-to-bl from-[#525050] to-[#262752c6]">Graduation Year:{gradYear?`${gradYear}`:"Not Provided"}</div>

         <div className="">
          {

          }
         </div>

        </div>
        

      </div>
    </div>



  <Ring/>




    
    </div>
  )
}

export default ProfilePage
