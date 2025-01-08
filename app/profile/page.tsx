"use client"
import Ring from "@/components/ring/ring";
import { useSession, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import  {useEffect,Suspense} from "react";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { ObjectId } from "mongoose";
import Link from "next/link";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { useSearchParams } from "next/navigation";

import Image from "next/image";

interface Team { 
  _id:ObjectId;
  name: string; 
  motive: string; 
  deadline: Date;
   members: ObjectId[]; 
   leader: ObjectId; 
   createdAt?: Date; 
   updatedAt?: Date;}

const ProfilePage = () => {
 

  const params=useSearchParams();
  const id=params.get("id") as string;

 const {user}=useUser();
  const {isLoaded}=useSession();
  const mId=user?.publicMetadata.mongoId as string || id as string;
  console.log(`mongoId:${mId} and id:${id}`);
 // const [user, setUser] = useState<any>(null); // Type appropriately
   const [name, setName] = useState<string>(""); 
   
   const [email, setEmail] = useState<string>("");
    const [interests, setInterests] = useState<string[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    //const [assignedWorks, setAssignedWorks] = useState<string[]>([]);
    const [birthDate, setBirthDate] = useState<Date>(); 
    const [gradYear, setGradYear] = useState<number>(); 
    const [image,setimage]=useState<string>("")

  
    const [edit,setEdit]=useState<boolean>(false);
    

    
       

        const fetchTeamData = async () => {
            try { 
              const res = await fetch(`/api/team/${mId}`);

              if (!res.ok) { throw new Error('Network response was not ok');
            }



            const contentType = res.headers.get('content-type'); 
            if (contentType && contentType.indexOf('application/json') !== -1) { 
              const data = await res.json();
              setTeams(data);
              
              
            
            } else {
               const text = await res.text(); 
               
               console.error('Received non-JSON response:', text); } 
              } catch (error) { console.error('Error fetching team:', error); }

          }







                
              
              
              
        
        
        const fetchUserData = async () => { 
          try { const response = await fetch(`/api/currentperson?id=${mId}`);
             const data = await response.json(); 
            // setUser(data);
              setName(data.name || ""); 
              setEmail(data.email || ""); 
              setInterests(data.interests || []); 
              setTeams(data.teams || []); 
             // setAssignedWorks(data.assignedWorks || []); 
              setBirthDate(data.dob || "");
               setGradYear(data.gradYear || ""); 
               setimage(data.image|| "");
              } catch (error) { 
                console.error('Error fetching user:', error); } };


                
                useEffect(() => {
                   console.log("fetching data");
                   fetchUserData();
                    fetchTeamData();
                    
                  
                  },
                    [isLoaded, user, mId]); 
  
  

       
        const [inputValue, setInputValue] = useState<string>('');

        const predefinedOptions = [ 'Web Dev', 'Poetry', 'Dance', 'Chess', 'Competitive Programming', 'Video Editing', 'Painting', 'T-shirt Design', 'Photography', 'LLM models',"coding","Music","Travel","Content Creation","Social Media Influencing","Enterprenuership","Socail Activity","Body Building","Robotics","Cooking","Blogging","Writing","Reading","Gaming","Sports","Drama","Dance","Singing","Crafting","Drawing","Painting","Photography","Videography","Editing","Designing","Fashion","Modelling","Acting","Anchoring","Public Speaking","Debating","MUN","Hackathons","Competitive Coding","Web Development","App Development","Game Development","Graphic Designing","UI/UX Designing","Digital Marketing","Content Writing","Blogging","Vlogging","Social Media Influencing","Entrepreneurship","Startup","Finance","Investment","Trading","Economics","Marketing","Management","HR","Law","Legal","Politics","Public Policy","International Relations","History","Geography","Psychology","Sociology","Philosophy","Literature","Languages","Science","Mathematics","Physics","Chemistry","Biology","Astronomy","Astrophysics","Medicine","Engineering","Computer Science","Artificial Intelligence","Machine Learning","Data Science","Cyber Security","Blockchain","Cloud Computing","IoT","Robotics","Automation","Ethical Hacking","Game Development","Web Development","App Development","Software Development","Hardware Development","Network Security","Database Management","System Administration","DevOps","Full Stack Development","Frontend Development","Backend Development","Mobile Development","Desktop Development","Embedded Development","Cloud Development","AI Development","ML Development","Data Analysis","Data Engineering","Data Mining","Data Visualization","Big Data","Business Intelligence","Business Analysis","Business Development","Product Management","Project Management","Quality Assurance","Quality Control","Testing","Technical Support","Customer Support","Customer Success","Sales","Marketing","Advertising","Public Relations","Content Marketing","Email Marketing","Social Media Marketing","SEO","SEM","SMM"]; 


        const handleAddOption = (option: string) => {
           if (!interests.includes(option)) { 
            setInterests([...interests, option]); } };


             const handleRemoveOption = (option: string) => {
               setInterests(interests.filter(item => item !== option)); }; 

               const filteredOptions = predefinedOptions.filter(option =>
                 option.toLowerCase().includes(inputValue.toLowerCase()) );
  
 

         const handleUpdate=()=>{
          setEdit(false);
          
          const res=  fetch(`/api/user?id=${mId}`,{
            method:'POST',
            headers:{
              "content-Type":'application/json',
            },
            body:JSON.stringify({
              email:email,
              gradYear:gradYear, //edit it carefully
              interests:interests,
              dob:birthDate,
              image:user?.imageUrl
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

 


  return (<div className=" w-[90vw] h-[90vh] mx-[5vw] " >

<button onClick={()=>setEdit(!edit)} className={` absolute top-[15vh] right-[10vw] w-8 h-8 bg-slate-500 rounded-full`}>
     {!edit? <MdOutlineModeEditOutline className="w-6 h-6"/>:<div className="p-1 rounded-lg ">X</div>}
        </button>  
    
    <div className=" bg-slate-500 text-gray-300 w-[100%] h-[30%] mt-[10vh] flex flex-row justify-around  items-center  "  >
    

      <div className="w-[30%] mr-[10vw]  ">
        <Image className="object-fill rounded-xl "  alt={name} src={image} width={300} height={300}/>
      </div>

      <div className="w-[70%] h-[100%] flex  flex-col">
      <div className=" my-4">{name} </div>





   {edit?(<div className="flex flex-row">
<label htmlFor="gradYear">Graduation Year:</label>
<input type="number" className="w-[50%]" onChange={(e)=>setGradYear(Number(e.target.value))} />
</div>):
<div className="  flex flex-row">
<div className="">Graduation Year:</div>
<div className="">{gradYear?gradYear:<div>Not Provided </div>}</div></div>
  
}

{edit?(<div className="flex flex-row">
          <label htmlFor="birthDate">Birth date:</label>
          <input type="date" className="w-[50%]" onChange={(e)=>setBirthDate(new Date(e.target.value))} />
          </div>):
          <div className="w-[100%] flex flex-row">
          <div className="">Birth Date:</div>
          <div className="">{birthDate?birthDate.toString():<div>Not Provided </div>}</div></div>
            
        }


          {
            edit?(<>
            <div className="relative">
               <label htmlFor="custom-dropdown">Choose your interests:</label> 
               <input id="custom-dropdown" className="border-2 rounded-lg" value={inputValue}
                onChange={(e) => setInputValue(e.target.value)} placeholder="Type to search..." /> 
                {inputValue && ( <div className="dropdown absolute top-10 left-[250px] h-[15vh] overflow-y-scroll">
                   {filteredOptions.map((option, index) => (
                     <div key={index} 
                     onClick={() => { handleAddOption(option); setInputValue('');
                       // Clear input after adding 
                        }} className="dropdown-item" > 

                        {option} </div> ))} </div> )} 

                        <div > <h3>Selected Interests:</h3>
                         <ul> {interests.map((option, index) => ( <li key={index}> {option} <button className="ml-10 p-1 rounded-lg bg-slate-500" onClick={() => handleRemoveOption(option)}>X</button> </li> ))} </ul> </div> </div>

            </>):<div className="w-[100%]  flex flex-row">
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
          edit?<button onClick={()=>handleUpdate()} className="bg-pink-600 px-4 py-1 rounded-lg my-[5vh]">Update</button>:(<></>)
         }



      </div>

      
      
     
      <div style={{"--position":3} as React.CSSProperties} className="hidden cards pCard w-[60%]  mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-[#527ff1] to-[#102438] rounded-xl   flex-col justify-center z-20">


           

        <div className=" h-[90%] flex flex-col justify-start align-middle text-lg">

         

         



        </div>
        
       
      </div>

 
    
    </div>



  




    
    </div>
  )
}





const ProfilePageWithSuspense = () => ( 
<Suspense fallback={<div>Loading...</div>}>
 <ProfilePage />
  </Suspense> )






export default ProfilePageWithSuspense;
