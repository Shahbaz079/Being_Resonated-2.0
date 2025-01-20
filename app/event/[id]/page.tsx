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
import { Textarea } from "@/components/ui/textarea";
import { MdOutlineModeEditOutline } from "react-icons/md";


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
  const [image, setImage] = useState('');
  const [createdBy, setCreatedBy] = useState<IUser | null>();
  const [team, setTeam] = useState<ITeam | null>();
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [showMembermodal, setShowMemberModal] = useState(false);
  const [showLeadermodal, setShowLeaderModal] = useState(false);
  const [edit, setEdit] = useState(false);
  const [preview, setPreview] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [event, setEvent] = useState<IEvent | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
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
        body: JSON.stringify({ imgUrl: res.url })
      })

      if (response.ok) {
        setUploadStatus("Image uploaded successfully")
        window.location.reload();
      }
    }

  }

  const closeMemberModal = () => {
    setShowMemberModal(false);
  }
  const closeLeaderModal = () => {
    setShowLeaderModal(false);
  }




  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  const { user, isLoaded } = useUser();
  const mongoId = user?.publicMetadata.mongoId as string;

  useEffect(() => {

    if (uid !== mongoId) {
      redirect('/');
    }
  }, [isLoaded]);


  useEffect(() => {

    const handleEventData = async () => {
      const res = await fetch(`/api/events?id=${eventId}`);

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
        setEvent(data)
        console.log(data);
        setEventUpdateData({ name: data.name, date: data.date, description: data.description, location: data.location, time: data.time });

      } else {
        toast.error("Failed to fetch event data");
      }
    };
    if (typeof window !== 'undefined') {
      setEventId(window.location.pathname.split('/')[2]);
      console.log(eventId, "eventid")
      if (eventId) {
        handleEventData();
      }

    }

  }, [isLoaded, user, eventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch(`/api/events?id=${eventId}`, {
      method: "PUT",
      body: JSON.stringify({ name, description, date, time, location, members, leaders })
    })
  }

  return (
    <div className="p-12 flex flex-col gap-5 px-40 ctab:px-12 cphone:px-4">
      <Card>
        <CardHeader>
          <div className="relative h-fit w-fit">
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
                    <Button variant={"default"} className="bg-green-600 hover:bg-green-700 w-20 right-0 self-end">Save</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <img
              className="w-32 h-32 rounded-lg"
              src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
              alt={"user did'nt provide image"}
            />
          </div>
          <h1 className="text-7xl mt-4 cphone:text-5xl">{name}</h1>
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
        </CardFooter>

      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Description</CardTitle>
        </CardHeader>

        <CardContent>{description}</CardContent>

        <CardFooter>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Edit</Button>
            </DialogTrigger>
            <DialogContent className="">
              <DialogHeader>
                <DialogTitle>Edit Event Description</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-8 mt-6">
                <div>
                  <Label>Edit Description</Label>
                  <Textarea className="mt-1 h-40" value={eventUpdateData.description} onChange={(e) => setEventUpdateData({ ...eventUpdateData, description: e.target.value })}></Textarea>
                </div>
                <Button variant={"default"} className="bg-green-600 hover:bg-green-700 w-20 right-0 self-end">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact the Organisers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
          {leaders?.map((leader)=>(
            <OrganiserCard key={leader.toString()} number="+91 7908529703" name={leader.name} email={leader.email}></OrganiserCard>
          ))}
          
           
          
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
    <p className="text-sm text-gray-400">{number}</p>
  </div>
)

const AttachmentCard = ({ name }: { name: string }) => (
  <div className="border-2 flex items-center text-lg gap-5 hover:bg-accent w-fit px-3 py-2 rounded-xl hover:cursor-pointer">
    <RiAttachment2 className="mt-[2px]"></RiAttachment2>
    <span>{name}</span>
  </div>
)

const PrizeCard = ({ position, content }: { position: string, content: string }) => (
  <div className="border-2 p-4 hover:bg-accent rounded-xl flex items-center w-fit max-w-[400px] gap-4">
    <div>
      <h1 className="text-2xl text-wrap">{position}</h1>
      <p className="mt-2 text-gray-400">{content}</p>
    </div>
    <HiMiniTrophy className="h-20 w-20"></HiMiniTrophy>
  </div>
)

export default EventPage;
