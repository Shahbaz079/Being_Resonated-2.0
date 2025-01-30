"use client"

import { useSession, useUser } from "@clerk/nextjs";
import { useEffect, Suspense, Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { ObjectId } from "mongoose";
import Link from "next/link";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import { SlOptions } from "react-icons/sl"
import Image from "next/image";
import Form from "./form";
import AllInterests from "./allInterests";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WhatsOnYourMind from "@/components/WhatsOnYourMInd/WhatsOnUserMind";
import Layout from "@/components/customLayouts/Layout";
import PostCard from "@/components/eventCard/PostCard";
import "./user.css"
import LoadingAnimation from "@/components/loadingAnimation/loadingAnimation";

interface Team {
  _id: ObjectId;
  name: string;
  motive: string;
  deadline: Date;
  members: ObjectId[];
  leader: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProfilePage = () => {


  const params = useSearchParams();
  const id = params.get("id") as string;


  const { isLoaded } = useSession();
  const mId = id as string;
  // console.log(`mongoId:${mId} and id:${id}`);
  // const [user, setUser] = useState<any>(null); // Type appropriately
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  // const [teams, setTeams] = useState<Team[]>([]);
  //const [assignedWorks, setAssignedWorks] = useState<string[]>([]);
  const [birthDate, setBirthDate] = useState<Date>();
  const [gradYear, setGradYear] = useState<number>();
  const [image, setimage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true);
  const [description, setDescription] = useState<string>("");
  const [edit, setEdit] = useState<boolean>(false);
  const [showAllInterests, setShowAllInterests] = useState<boolean>(false);
  const [owner, setOwner] = useState<boolean>(true);
  const [posts, setPosts] = useState<any[]>([]);





  const fetchTeamData = async () => {
    try {
      const res = await fetch(`/api/team/${mId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      {/* if (res.ok) {
        const data = await res.json();
        setTeams(data);

      } */}
    } catch (error) { console.error('Error fetching team:', error); }

  }


  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user?id=${mId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      setLoading(false);
      console.log(data);
      // setUser(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setInterests(data.interests || []);
      // setTeams(data.teams || []);
      // setAssignedWorks(data.assignedWorks || []); 
      setBirthDate(data.dob || "");
      setGradYear(data.gradYear || "");
      setimage(data.image || "");
      setDescription(data.description);
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };





  useEffect(() => {
    console.log("fetching data");
    fetchUserData();
    fetchTeamData();
  },
    [isLoaded, mId]);



  useEffect(() => {
    if (isLoaded && mId) {
      const ownerId = user?.publicMetadata.mongoId;
      setOwner(ownerId === mId);

    }


  }, [isLoaded]);




  const [inputValue, setInputValue] = useState<string>('');

  const predefinedOptions = ['Web Dev', 'Poetry', 'Dance', 'Chess', 'Competitive Programming', 'Video Editing', 'Painting', 'T-shirt Design', 'Photography', 'LLM models', "coding", "Music", "Travel", "Content Creation", "Social Media Influencing", "Enterprenuership", "Socail Activity", "Body Building", "Robotics", "Cooking", "Blogging", "Writing", "Reading", "Gaming", "Sports", "Drama", "Dance", "Singing", "Crafting", "Drawing", "Painting", "Photography", "Videography", "Editing", "Designing", "Fashion", "Modelling", "Acting", "Anchoring", "Public Speaking", "Debating", "MUN", "Hackathons", "Competitive Coding", "Web Development", "App Development", "Game Development", "Graphic Designing", "UI/UX Designing", "Digital Marketing", "Content Writing", "Blogging", "Vlogging", "Social Media Influencing", "Entrepreneurship", "Startup", "Finance", "Investment", "Trading", "Economics", "Marketing", "Management", "HR", "Law", "Legal", "Politics", "Public Policy", "International Relations", "History", "Geography", "Psychology", "Sociology", "Philosophy", "Literature", "Languages", "Science", "Mathematics", "Physics", "Chemistry", "Biology", "Astronomy", "Astrophysics", "Medicine", "Engineering", "Computer Science", "Artificial Intelligence", "Machine Learning", "Data Science", "Cyber Security", "Blockchain", "Cloud Computing", "IoT", "Robotics", "Automation", "Ethical Hacking", "Game Development", "Web Development", "App Development", "Software Development", "Hardware Development", "Network Security", "Database Management", "System Administration", "DevOps", "Full Stack Development", "Frontend Development", "Backend Development", "Mobile Development", "Desktop Development", "Embedded Development", "Cloud Development", "AI Development", "ML Development", "Data Analysis", "Data Engineering", "Data Mining", "Data Visualization", "Big Data", "Business Intelligence", "Business Analysis", "Business Development", "Product Management", "Project Management", "Quality Assurance", "Quality Control", "Testing", "Technical Support", "Customer Support", "Customer Success", "Sales", "Marketing", "Advertising", "Public Relations", "Content Marketing", "Email Marketing", "Social Media Marketing", "SEO", "SEM", "SMM"];

  const { user } = useUser();

  const filteredOptions = predefinedOptions.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase()));

  const handleUpdate = (changedInterests: string[],changedDiscription:string) => {
    setEdit(false);

    const res = fetch(`/api/user?id=${mId}`, {
      method: 'PUT',
      headers: {
        "content-Type": 'application/json',
      },
      body: JSON.stringify({
        email: email,
        interests: changedInterests,
        dob: birthDate,
        image: user?.imageUrl,
        description:changedDiscription,
      })
    }).then(response => response.json())
      .then(data => {
        setInterests(data.interests || []);
        setBirthDate(data.dob || "")
        setGradYear(data.gradYear || "")
        setDescription(data.description || "")
      }).catch(error => console.error('Error:', error))
  }




  return (
    <Layout>
      <div className="min-h-screen bg flex flex-col items-center p-2">

        {loading && <div className="mt-44"><LoadingAnimation></LoadingAnimation></div>}

        {!loading && owner && !edit ? <button onClick={() => setEdit(!edit)} className={` absolute top-[15vh] right-[10vw] w-8 h-8 bg-trasparent rounded-full`}>
          <MdOutlineModeEditOutline className="w-6 h-6" />
        </button> : null}

        {!loading && <div className="animate-slide-top glass rounded-xl w-full text-gray-300 h-fit mt-[10vh] flex flex-col max-w-[600px] items-center py-2">

          <div className="w-[120px] h-[120px] mt-3 relative">
            {image ? <Image className="rounded-full" alt={name} src={image} layout="fill" /> : null}
          </div>

          <div className="w-fit flex flex-col">

            <div className="cphone:text-4xl text-5xl capitalize text-center text-cyan-200 font-semibold mt-3">{name}</div>

            <p className="mt-3 text-lg text-center">{gradYear ? gradYear : null}</p>


            <div className="w-[100%] flex p-2">
              {interests.length ? (<div className="gap-3 flex mt-7 flex-wrap justify-center w-full">
                {interests.length >= 1 ? <InterestTag interest={interests[0]}></InterestTag> : null}
                {interests.length >= 2 ? <InterestTag interest={interests[1]}></InterestTag> : null}
                {interests.length >= 3 ? <InterestTag interest={interests[2]}></InterestTag> : null}
                {interests.length >= 4 ? <InterestTag interest={interests[3]}></InterestTag> : null}
                {interests.length >= 5 ? <ShowMoreInterestTag setShowAllInterests={setShowAllInterests}></ShowMoreInterestTag> : null}
              </div>) : <p className="mt-5 text-gray-400">You have not selected any interests yet !</p>}
            </div>

            <p className="mt-5 text-center">{description}</p>

            {owner && <Link href={`/teamcreate?id=${mId}`} className="bg-green-700 px-4 py-2 w-fit mx-auto rounded-lg my-3 mt-5">Create Team</Link>}
          </div>

          <div style={{ "--position": 3 } as React.CSSProperties} className="hidden cards pCard w-[60%]  mx-10 my-10 px-5 h-[100%] bg-gradient-to-bl from-[#527ff1] to-[#102438] rounded-xl   flex-col justify-center z-20">
            <div className=" h-[90%] flex flex-col justify-start align-middle text-lg">
            </div>
          </div>
        </div>}


        {!loading && <Card className="animate-slide-top bg-transparent border-0 w-full mt-7 p-0">
          <CardHeader className="p-0">
            <Tabs defaultValue="Posts">
              <TabsList className="flex items-center justify-center bg-transparent flex-wrap h-auto space-y-1">
                <TabsTrigger value="Posts" className="text-lg">Posts</TabsTrigger>
                {owner && <TabsTrigger value="Participations" className="text-lg">Participations</TabsTrigger>}
              </TabsList>
              <TabsContent value="Posts">
                <div>
                  <WhatsOnYourMind></WhatsOnYourMind>
                  {posts?.map((userPost) => (
                    <div className="" key={userPost._id?.toString()}>
                      <PostCard post={userPost} />
                    </div>
                  ))}
                </div>
              </TabsContent>
              {owner && <TabsContent value="Members">
                <div>
                  {/* render participations here */}
                </div>
              </TabsContent>}
            </Tabs>
          </CardHeader>

        </Card>}


        {edit ? <Form currentUserDescription={description} setEdit={setEdit} handleUpdate={handleUpdate} currentInterests={interests}></Form> : null}
        {showAllInterests ? <AllInterests interests={interests} name={name} setShowAllInterests={setShowAllInterests}></AllInterests> : null}
      </div>
    </Layout>
  )
}

const ProfilePageWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ProfilePage />
  </Suspense>
)

// const LoadSkeleton = () => (
//   <div className="h-fit mt-[10vh] flex ctab:flex-col ctab:items-center justify-center p-5 gap-20 ctab:gap-0 ctab:p-0 relative overflow-hidden">
//     <div className="Shine absolute h-full w-full bg-black mix-blend-screen animate-skeleton"></div>
//     <div className="rounded-full h-[230px] w-[230px] bg-[#252424]"></div>
//     <div className="ctab:w-full max-w-[60%] w-[60%] h-[100%] ctab:max-w-full ctab:flex ctab:flex-col ctab:items-center ctab:mt-5">
//       <div className="bg-[#252424] h-16 rounded-xl w-full"></div>
//       <div className="bg-[#252424] h-7 mt-4 rounded-xl w-full"></div>

//       <div className="h-40 w-full ctab:mt-7 mt-12 bg-[#252424] rounded-xl"></div>
//     </div>
//   </div>
// );

const InterestTag = ({ interest }: { interest: string }) => (
  <div className="border-2 w-fit py-1 px-2 rounded-2xl text-sm bg-[#332A2A] border-red-400 cphone:text-[12px]">
    <span>{interest}</span>
  </div>
)

const ShowMoreInterestTag = ({ setShowAllInterests }: { setShowAllInterests: Dispatch<SetStateAction<boolean>> }) => (
  <div onClick={() => setShowAllInterests(true)} className="border-2 bg-[#332A2A] hover:scale-110 hover:cursor-pointer transition-transform duration-200 border-red-400 font-extrabold px-2 cphone:text-[12px]  rounded-2xl w-fit ">
    <SlOptions className="mt-[7px]"></SlOptions>
  </div>
)








export default ProfilePageWithSuspense;