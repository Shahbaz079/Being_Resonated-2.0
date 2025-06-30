'use client'

import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, FormEvent } from "react";
import { IUser } from "@/components/expandableCards/card";
import ITeam, { Team } from "@/models/Team";
import { useEdgeStore } from "@/lib/edgeStoreRouter";
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

import "./event.css"

import { FaImage, FaInfoCircle } from "react-icons/fa";

import WhatsOnEventMind from "@/components/WhatsOnYourMInd/WhatsOnEventMind";
import { Suspense } from "react";
import LoadingAnimation from "@/components/loadingAnimation/loadingAnimation";
import Layout from "@/components/customLayouts/Layout";
import PostCard from "@/components/eventCard/PostCard";
import { useQuery,useMutation, useQueryClient } from "@tanstack/react-query";




export const getEventById = async (id: string):Promise<IEvent> => {
  const res = await fetch(`/api/events?id=${id}`);
  if (!res.ok) throw new Error("Failed to fetch event data");
  return res.json();
};

export const acceptParticipant = async ({
  eventId,
  userId,
}: { eventId: string; userId: string }) => {
  const res = await fetch(`/api/participate?eid=${eventId}&id=${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error("Failed to accept participant");
};

export const removeParticipant = async ({
  eventId,
  participantId,
}: { eventId: string; participantId: string }) => {
  const res = await fetch(`/api/events?id=${eventId}&type=remparticipant`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: participantId }),
  });
  if (!res.ok) throw new Error("Failed to remove participant");
};

export const removeRequests = async ({
  eventId,
  requestId,
}: { eventId: string; requestId:string }) => {
  const res = await fetch(`/api/events?id=${eventId}&type=remrequest`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: requestId }),
  });
  if (!res.ok) throw new Error("Failed to update requests");
};

export const sendParticipationRequest = async ({
  id,
  mongoId,
}: { id: string; mongoId: string }) => {
  const res = await fetch(`/api/events?type=participate&id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: mongoId }),
  });
  if (!res.ok) throw new Error("Failed to send participation request");
};

const EventPage = ({eventId}:{eventId:string}) => {
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [event, setEvent] = useState<IEvent | null>(null);

  

  //const [eventUpdateData, setEventUpdateData] = useState<EventUpdateType>(emptyEventUpdateData);


   const { user, isLoaded } = useUser();

const { data: eventData, isLoading, isError } = useQuery({
  queryKey: ['event', eventId],
  queryFn: () => getEventById(eventId),
  enabled: !!eventId && isLoaded, // ensures query runs only when eventId exists
  refetchOnWindowFocus: false, 
});

const [preview, setPreview] = useState<string | null>(null);

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

const queryClient = useQueryClient();

const uploadMutation = useMutation({
  mutationFn: async () => {
    if (!file) return;
    const res = await edgestore.mypublicImages.upload({ file});
    const uploadRes = await fetch(`/api/upload?id=${eventId}&source=event`, {
      method: "POST",
      body: JSON.stringify({ imgUrl: res.url, thumbUrl: res.thumbnailUrl }),
    });
    if (!uploadRes.ok) throw new Error("Upload failed");
    return uploadRes;
  },
  onSuccess: () => {
    setUploadStatus("Image uploaded successfully");
    queryClient.invalidateQueries({ queryKey: ['event', eventId] }); // refetch event data
  },
});

const handleUpload = () => {
  if (file) uploadMutation.mutate();
};






 
  const mongoId = user?.publicMetadata.mongoId as string;



  const isLeader = eventData?.leaders?.some((leader) => leader._id.toString() === mongoId);
  const isVolunteer = eventData?.members?.some((member) => member._id.toString() === mongoId);


   // setEventId(window.location.pathname.split('/')[2]);
    console.log(eventId, "eventid")

const acceptParticipantMutation = useMutation({
  mutationFn: acceptParticipant,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    toast.success("Participant added successfully");
  },
});

const removeParticipantMutation = useMutation({
  mutationFn: removeParticipant,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    toast.success("Participant removed successfully");
  },
});

const declineRequestMutation = useMutation({
  mutationFn: removeRequests,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    toast.success("Request declined");
  },
});

const participationRequestMutation = useMutation({
  mutationFn: sendParticipationRequest,
  onSuccess: () => toast.success("Request sent successfully"),
  onError: () => toast.error("Request failed"),
});

const acceptRequestHandler = (newParticipant: IUser) => {


  acceptParticipantMutation.mutate({ eventId, userId: newParticipant._id.toString() });
};

const removeParticipantHandler = (newParticipant: IUser) => {

  removeParticipantMutation.mutate({ eventId, participantId: newParticipant._id.toString() });
}


const removeRequestHandler = (newParticipant: IUser) => {
 
  declineRequestMutation.mutate({ eventId, requestId: newParticipant._id.toString() });
};



const handleParticipation = () => {
  participationRequestMutation.mutate({ id: eventId, mongoId });
};

const [eventUpdateData, setEventUpdateData] = useState({
  id: '', // make sure 'id' is available
  name: '',
  location: '',
  time: '',
  date: '',
})


const { mutate: updateEvent } = useMutation({
  mutationFn: async () => {
  
   const response= await fetch(`/api/events?id=${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: eventUpdateData.name, location: eventUpdateData.location, time: eventUpdateData.time, date: eventUpdateData.date }),})

    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({queryKey:['events',eventId]}) // Adjust to your query key
  }
})





  return (

    <Layout>
    <div className="bg min-h-screen flex flex-col gap-5 px-40 ctab:px-12 cphone:px-4">

      

      {isLoading && <div className="mt-44">
        <LoadingAnimation></LoadingAnimation></div>}

      {!isLoading && <Card className="glass mt-10 animate-slide-top">
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
              src={eventData?.image || 'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
              alt={eventData?.name || "user did'nt provide image"}
            />
          </div>
          <h1 className="text-7xl mt-4 cphone:text-5xl text-cyan-200">{eventData?.name}</h1>
          <Dialog>
            <DialogTrigger asChild><FaInfoCircle className="w-5 h-5 mt-4 cursor-pointer fill-cyan-200 hover:opacity-70"></FaInfoCircle></DialogTrigger>
            <DialogContent className="bg-slate-950 opacity-90">
              <DialogHeader>
                <DialogTitle>Description</DialogTitle>
              </DialogHeader>
              <p>{eventData?.description}</p>
            </DialogContent>
          </Dialog>

        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <SlCalender></SlCalender>
            <p className="text-xl">Date: {eventData?.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <IoTimeOutline></IoTimeOutline>
            <p className="text-xl">{eventData?.time}</p>
          </div>
          <div className="flex items-center gap-2">
            <FaLocationDot></FaLocationDot>
            <p className="text-xl">{eventData?.location}</p>
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
                  <Button
  onClick={() => updateEvent()}
  disabled={isLoading}
  className="bg-green-600 hover:bg-green-700 w-20 right-0 self-end"
>
  {isLoading ? 'Saving...' : 'Save'}
</Button>

                </div>
              </DialogContent>
            </Dialog>

           <Dialog>
  <DialogTrigger asChild>
    <Button className="ml-4">Manage Participants</Button>
  </DialogTrigger>
  <DialogContent className="max-w-5xl w-full">
    <DialogHeader>
      <DialogTitle className="text-2xl text-center">Participants & Requests</DialogTitle>
    </DialogHeader>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto px-2">
      {/* Requests Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Join Requests</h2>
        <div className="space-y-4">
          {eventData?.requests?.map((participant) => (
            <div
              key={participant._id.toString()}
              className="flex items-center justify-between p-4 bg-slate-800 rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={participant?.image}
                  alt={participant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{participant.name}</p>
                  <p className="text-xs text-gray-400">{participant.gradYear}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm"
                  onClick={() => acceptRequestHandler(participant)}
                >
                  Accept
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                  onClick={() => removeRequestHandler(participant)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {eventData?.requests?.length === 0 && (
            <p className="text-center text-gray-400 text-sm">No requests yet.</p>
          )}
        </div>
      </div>

      {/* Participants Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Participants</h2>
        <div className="space-y-4">
          {eventData?.participated?.map((participant) => (
            <div
              key={participant._id.toString()}
              className="flex items-center justify-between p-4 bg-slate-800 rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={participant?.image}
                  alt={participant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{participant.name}</p>
                  <p className="text-xs text-gray-400">{participant.gradYear}</p>
                </div>
              </div>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                onClick={() => removeParticipantHandler(participant)}
              >
                Remove
              </Button>
            </div>
          ))}
          {eventData?.participated?.length === 0 && (
            <p className="text-center text-gray-400 text-sm">No participants added yet.</p>
          )}
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

          </>
          }
          <Button onClick={() => handleParticipation()} variant={"default"} className="ml-4 bg-green-600 hover:bg-green-700 w-20 right-0 self-end">Participate</Button>
        </CardFooter>

      </Card>}


      {!isLoading && <Card className="glass animate-slide-top">
        <CardHeader>
          <Tabs defaultValue="Organisers">
            <TabsList className="flex items-center justify-center bg-transparent flex-wrap h-auto space-y-1">
              <TabsTrigger value="Organisers" className="text-lg">Organisers</TabsTrigger>
              <TabsTrigger value="Posts" className="text-lg">Posts</TabsTrigger>
              <TabsTrigger value="EventMembers" className="text-lg">Volunteeers</TabsTrigger>
            </TabsList>
            <TabsContent value="Organisers" className="mt-7">
              <div className="flex gap-3 flex-wrap">
                {eventData?.leaders?.map((leader) => (
                  <OrganiserCard key={leader.email.toString()} number="+91 7908529703" name={leader.name} email={leader.email}></OrganiserCard>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="Posts">
              {isLeader && eventData && <div>
                
                  <WhatsOnEventMind title={eventData.team.toString()!} name={eventData.name!} location={eventData.location!} time={eventData.time!} date={eventData.date!} eventId={eventId!} />
              </div>}
              {eventData?.posts?.map((userPost) => (
                    <div className="" key={userPost._id?.toString()}>
                      <PostCard post={userPost} />
                    </div>
                  ))}
              
            </TabsContent>
            <TabsContent value="Members"></TabsContent>
          </Tabs>
        </CardHeader>
      </Card>}

      {/**  !loading && <Card className="glass animate-slide-top">
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
      </Card> */}






    </div >
    </Layout>
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



const EventPagewithSuspense = (props: { params: Promise<{ id: string }> }) =>{
    const { id } = React.use(props.params)

  return (
  <Suspense fallback={<div>Loding</div>}> <EventPage eventId={id}/></Suspense>
)

}
export default EventPagewithSuspense;