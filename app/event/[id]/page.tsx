'use client'

import { redirect, useSearchParams } from "next/navigation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, FormEvent } from "react";
import { IUser } from "@/components/expandableCards/card";
import ITeam, { Team } from "@/models/Team";
import { useEdgeStore } from "@/lib/edgestore";
import { IEvent } from "@/app/team/[id]/page";
import { FaLocationDot, FaMarkdown } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { IoTimeOutline } from "react-icons/io5";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RiAttachment2 } from "react-icons/ri";
import { HiMiniTrophy } from "react-icons/hi2";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectId } from "mongoose";
import "./event.css"
import SubHeader from "@/components/SubHeader/SubHeader";
import { FaImage, FaInfoCircle } from "react-icons/fa";

import WhatsOnEventMind from "@/components/WhatsOnYourMInd/WhatsOnEventMind";
import { Suspense } from "react";

interface EventUpdateType {
  date: string;
  description: string;
  name: string;
  time: string;
  location: string;
}

const emptyEventUpdateData = {
  date: "",
  description: "",
  name: "",
  time: "",
  location: "",
}

const EventPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [members, setMembers] = useState<IUser[] | null>([]);
  const [leaders, setLeaders] = useState<IUser[] | null>([]);
  const [participants, setParticipants] = useState<IUser[] | null>([]);
  const [requests, setRequests] = useState<IUser[] | null>();
  const [image, setImage] = useState('');
  const [createdBy, setCreatedBy] = useState<IUser | null>();
  const [team, setTeam] = useState<ITeam | null>();
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  const [edit, setEdit] = useState(false);
  const [preview, setPreview] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [event, setEvent] = useState<IEvent | null>(null);
  const [eventId, setEventId] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const [live, setLive] = useState<boolean>(false);
  const [editEvent, setEditEvent] = useState<boolean>(false);

  const [eventUpdateData, setEventUpdateData] = useState<EventUpdateType>(emptyEventUpdateData);



  const { edgestore } = useEdgeStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const file = files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);


    }
  };

  const handleUpload = async () => {

    if (file) {

      const res = await edgestore.mypublicImages.upload({
        file,
        onProgressChange: (progress) => {
          setProgress(progress);
        }
      })



      const response = await fetch(`/api/upload?id=${eventId}&source=event`, {
        method: "POST",
        body: JSON.stringify({ imgUrl: res.url,thumbUrl:res.thumbnailUrl })
      })

      if (response.ok) {
        setUploadStatus("Image uploaded successfully")
        window.location.reload();
      }
    }

  }



  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  const { user, isLoaded } = useUser();
  const mongoId = user?.publicMetadata.mongoId as string;



  const isLeader = leaders?.some((leader) => leader._id.toString() === mongoId);
  const isVolunteer = members?.some((member) => member._id.toString() === mongoId);




  

  useEffect(() => {
    
      setEventId(window.location.pathname.split('/')[2]);
      console.log(eventId, "eventid")


    
  }, [isLoaded])


  useEffect(() => {

    const handleEventData = async () => {
      const res = await fetch(`/api/events?id=${eventId}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        }

      });

      if (res.ok) {
        const data = await res.json();
        setName(data.name);
        setDescription(data.description);
        setDate(data.date);
        setImage(data.image);
        setMembers(data.members);
        setLeaders(data.leaders);
        setCreatedBy(data.createdBy);
        setTime(data.time);
        setLocation(data.location);
        setTeam(data.team);
        setLive(data.isLive);
        setRequests(data.requests);
        setParticipants(data.participated);
        setEvent(data)
        console.log(data);
        setEventUpdateData({ name: data.name, date: data.date, description: data.description, location: data.location, time: data.time });

      } else {
        toast.error("Failed to fetch event data");
      }
    };

    if (eventId) {
      handleEventData();
    }


  }, [isLoaded, user, eventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`/api/events?id=${eventId}`, {
      method: "PUT",
      body: JSON.stringify({ name, description, date, time, location, members, leaders })
    })
  }

  const acceptRequestHandler = (newParticipant: IUser) => {

    const updatedParticipants = participants ? [...participants, newParticipant] : [newParticipant];
    setParticipants(updatedParticipants);

    const updatedRequests = requests?.filter((request) => request._id.toString() !== newParticipant._id.toString())
    setRequests(updatedRequests);

    const updateParticipants = async () => {
      const res = await fetch(`/api/participate?eid=${eventId}&id=${mongoId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },

      })

      const data = res.json();
      if (res.ok) {
        toast.success("Participant added successfully");
      }
    }
    updateParticipants();
  }

  const removeParticipantHandler = (newParticipant: IUser) => {



    const updatedParticipants = participants?.filter((participant) => participant._id.toString() !== newParticipant._id.toString())
    setParticipants(updatedParticipants || []);

    const updateParticipants = async () => {
      const res = await fetch(`/api/events?id=${eventId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participated: updatedParticipants })
      })

      const data = res.json();
      if (res.ok) {
        toast.success("Participant Removed successfully");
      }
    }
    updateParticipants();
  }


  const removeAcceptHandler = (newParticipant: IUser) => {



    const updatedRequests = requests?.filter((request) => request._id.toString() !== newParticipant._id.toString())
    setRequests(updatedRequests || []);

    const updateParticipants = async () => {
      const res = await fetch(`/api/events?id=${eventId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests: updatedRequests })
      })

      const data = res.json();
      if (res.ok) {
        toast.success("Participant Removed successfully");
      }
    }
    updateParticipants();
  }


  const handleParticipation = (id: string) => {
    try {

      const participate = async () => {
        const res = await fetch(`/api/events?type=participate&id=${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: mongoId }),

        })
        const data = await res.json();
        if (res) {
          toast.success("Request sent successfully")
        } else {
          toast.error("Request failed")
        }
      }
      participate();

    } catch (error) {
      console.error(error);
    }
  }


  return (
    <div className="bg min-h-screen flex flex-col gap-5 px-40 ctab:px-12 cphone:px-4">

      <SubHeader></SubHeader>
      <Card className="glass mt-10">
        <CardHeader>
          <div className="relative h-fit w-fit">
            {isLeader &&
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="opacity-0 text-2xl font-bold hover:opacity-80 absolute bg-black top-0 left-0 h-full w-full flex items-center justify-center cursor-pointer">
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Event Details</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-8 mt-6">
                    <div className="flex flex-col">
                      <Label>Upload Image</Label>
                      <input type="file" className="mt-4" onChange={handleFileChange}></input>
                      <Button onClick={() => handleUpload()} variant={"default"} className="bg-green-600 hover:bg-green-700 w-20 right-0 self-end">Save</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            }
            <img
              className="w-32 h-32 rounded-lg"
              src={image || 'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
              alt={name || "user did'nt provide image"}
            />
          </div>
          <h1 className="text-7xl mt-4 cphone:text-5xl text-cyan-200">{name}</h1>
          <Dialog>
            <DialogTrigger asChild><FaInfoCircle className="w-5 h-5 mt-4 cursor-pointer fill-cyan-200 hover:opacity-70"></FaInfoCircle></DialogTrigger>
            <DialogContent className="bg-slate-950 opacity-90">
              <DialogHeader>
                <DialogTitle>Description</DialogTitle>
              </DialogHeader>
              <p>{description}</p>
            </DialogContent>
          </Dialog>

        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <SlCalender></SlCalender>
            <p className="text-xl">Date: {date}</p>
          </div>
          <div className="flex items-center gap-2">
            <IoTimeOutline></IoTimeOutline>
            <p className="text-xl">{time}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaLocationDot></FaLocationDot>
            <p className="text-xl">{location}</p>
          </div>
        </CardContent>

        <CardFooter>
          {isLeader && <>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Edit</Button>
              </DialogTrigger>
              <DialogContent className="">
                <DialogHeader>
                  <DialogTitle>Edit Event Details</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-8 mt-6">
                  <div>
                    <Label>Event Name</Label>
                    <Input value={eventUpdateData.name} onChange={(e) => setEventUpdateData({ ...eventUpdateData, name: e.target.value })}></Input>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={eventUpdateData.location} onChange={(e) => setEventUpdateData({ ...eventUpdateData, location: e.target.value })}></Input>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input value={eventUpdateData.time} onChange={(e) => setEventUpdateData({ ...eventUpdateData, time: e.target.value })}></Input>
                  </div>
                  <div className="flex flex-col">
                    <Label>Date</Label>
                    <input className="p-1 border-2 bg-black rounded-md mt-1" value={eventUpdateData.date} onChange={(e) => setEventUpdateData({ ...eventUpdateData, date: e.target.value })} type="date" />
                  </div>
                  <Button variant={"default"} className="bg-green-600 hover:bg-green-700 w-20 right-0 self-end">Save</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="ml-4">Manage Participants</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Participants and Requests</DialogTitle></DialogHeader>
                <DialogFooter>
                  <div className="max-h-[80vh] ">
                    <div className="flex flex-col w-[40vw] max-h-[60vh]">
                      <h2>Requests</h2>
                      <div className="w-[100%] height-[100px] max-h-[50vh] overflow-y-scroll ">
                        {requests?.map((participant) => (
                          <div className="flex flex-row justify-start items-center" key={participant._id.toString()}>
                            <div className="px-2 mx-2">
                              <img src={participant?.image} alt={participant.name} className="object-cover w-[60px] h-[60px]" /></div>

                            <div className="flex flex-col px-2 mx-2">
                              <div className="">{participant.name}</div>
                              <div className="">{participant?.gradYear}</div>
                            </div>

                            <button onClick={() => acceptRequestHandler(participant)} className="px-2 mx-2 bg-[#3bc249] py-1 rounded-md">Accept</button>
                            <button onClick={() => removeAcceptHandler(participant)} className="px-2 mx-2 bg-red-500 py-2 rounded-full">X</button>
                          </div>
                        ))}
                      </div>
                    </div>


                    <div className="flex flex-col w-[40vw] h-[60vh]">
                      <h2>Participants</h2>
                      <div className="w-[100%] height-[100px] max-h-[50vh] overflow-y-scroll ">
                        {participants?.map((participant) => (
                          <div className="flex flex-row justify-start items-center" key={participant._id.toString()}>
                            <div className="px-2 mx-2">
                              <img src={participant?.image} alt={participant.name} className="object-cover w-[60px] h-[60px]" /></div>

                            <div className="flex flex-col px-2 mx-2">
                              <div className="">{participant.name}</div>
                              <div className="">{participant?.gradYear}</div>
                            </div>

                            <button className="px-2 mx-2 bg-red-500 py-2 rounded-full" onClick={() => removeParticipantHandler(participant)}>X</button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </DialogFooter>

              </DialogContent>
            </Dialog>
          </>
          }
          <Button onClick={() => handleParticipation(eventId!)} variant={"default"} className="ml-4 bg-green-600 hover:bg-green-700 w-20 right-0 self-end">Participate</Button>
        </CardFooter>

      </Card>

      <Card className="glass">
        <CardHeader>
          <Tabs defaultValue="Organisers">
            <TabsList className="flex items-center justify-center bg-transparent flex-wrap h-auto space-y-1">
              <TabsTrigger value="Organisers" className="text-lg">Organisers</TabsTrigger>
              <TabsTrigger value="Posts" className="text-lg">Posts</TabsTrigger>
              <TabsTrigger value="EventMembers" className="text-lg">Volunteeers</TabsTrigger>
            </TabsList>
            <TabsContent value="Organisers" className="mt-7">
              <div className="flex gap-3 flex-wrap">
                {leaders?.map((leader) => (
                  <OrganiserCard key={leader.email.toString()} number="+91 7908529703" name={leader.name} email={leader.email}></OrganiserCard>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="Posts">
             {isLeader && <div>
              {team?._id &&
                <WhatsOnEventMind title={team?._id?.toString()} name={team?.name} location={location} time={time} date={date} eventId={eventId}    />  }
              </div>    }
            </TabsContent>
            <TabsContent value="Members"></TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-2xl text-cyan-200">Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <PrizeCard position="Winner" content="Asus Keyboard + Mouse + 5000 Rs"></PrizeCard>
            <PrizeCard position="First Runner Up" content="Asus Keyboard + Mouse"></PrizeCard>
            <PrizeCard position="Second Runner Up" content="2 month Leetcode Prime"></PrizeCard>
            <PrizeCard position="Fastest Coding Team" content="Headphones"></PrizeCard>
          </div>
        </CardContent>
      </Card>



    </div >
  );
}

const OrganiserCard = ({ name, email, number }: { name: string, email: string, number: string }) => (
  <div className="h-fit hover:bg-accent w-fit p-3 rounded-xl">
    <h1 className="text-xl">{name}</h1>
    <p className="mt-1 text-sm text-gray-400">{email}</p>
  </div>
)

const AttachmentCard = ({ name }: { name: string }) => (
  <div className="border-2 flex items-center text-lg gap-5 hover:bg-accent w-fit px-3 py-2 rounded-xl hover:cursor-pointer">
    <RiAttachment2 className="mt-[2px]"></RiAttachment2>
    <span>{name}</span>
  </div>
)

const PrizeCard = ({ position, content }: { position: string, content: string }) => (
  <div className="hover:bg-slate-700 border-2 border-cyan-700 p-4 cursor-pointer rounded-xl flex items-center w-fit max-w-[400px] gap-4">
    <div>
      <h1 className="text-2xl text-wrap">{position}</h1>
      <p className="mt-2 text-gray-400">{content}</p>
    </div>
    <HiMiniTrophy className="h-20 w-20"></HiMiniTrophy>
  </div>
)



const EventPagewithSuspense = () =>  (
  <Suspense fallback={<div>Loding</div>}> <EventPage /></Suspense>
)

export default EventPagewithSuspense;