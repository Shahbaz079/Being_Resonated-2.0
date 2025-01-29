'use client'
import { IUser } from "@/components/expandableCards/card";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import Link from "next/link";
import CreateEvent from "@/components/eventCreate/EventCreate";

import mongoose from "mongoose";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { toast } from "react-toastify";
import "./teams.css"

import WhatsOnTeamMind from "@/components/WhatsOnYourMInd/WhatsOnTeamMind";
import { Suspense } from "react";
import Layout from "@/components/customLayouts/Layout";


export interface IEvent {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  leaders?: mongoose.Schema.Types.ObjectId[];
  image: string;
  team: mongoose.Schema.Types.ObjectId;
  date: Date;
  members?: mongoose.Schema.Types.ObjectId[];
  description: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  participated?: mongoose.Schema.Types.ObjectId[];
  requests?: mongoose.Schema.Types.ObjectId[];
  location: string;
  time: string;
  createdAt?: Date;
  updatedAt?: Date;
}



const TeamPage = () => {

  const [members, setMembers] = useState<IUser[] | null>([])
  const [teamImg, setTeamImg] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>("");
  const [createdBy, setCreatedBy] = useState<IUser | null>();
  const [leaders, setLeaders] = useState<IUser[]>();
  const [teamName, setTeamName] = useState<string>("")
 
  const [events, setEvents] = useState<IEvent[] | null>([])

  const [requests, setRequests] = useState<IUser[] >([])

  

  

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  console.log(id, "team id")

  const { user, isLoaded } = useUser();
  const mongoId = user?.publicMetadata.mongoId as string



  useEffect(() => {
    const TeamHandler = async () => {
      await fetch(`/api/team?id=${id}`).then(res => res.json()).then(data => {
        setMembers(data.members);
        setTeamImg(data.timage);
        setDescription(data.description);
        setCreatedBy(data.createdBy);
        setLeaders(data.leaders);
        setTeamName(data.name);
        setEvents(data.events)
      })


    }

    TeamHandler();
  }, [])

  const joinHandler = async () => {
    const response = await fetch(`/api/join?id=${mongoId}&type=join`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json();
    if (response) {
              toast.success("Request sent successfully")
            } else {
              toast.error("Request failed")
            }
  }

  
  const isLeader = leaders?.some((leader) => leader._id.toString() === mongoId);
  const isVolunteer = members?.some((member) => member._id.toString() === mongoId);



  return (
    <Layout>
    <div className="bg min-h-screen">
   
      <div className="mt-4 p-5 px-4 gap-1 flex justify-between ctab:flex-col ctab:items-center">
        <div className="ctab:order-2 w-full">
          <Card className="p-3 py-5 glass items-center flex ctab:flex-col border-0 ctab:mx-auto w-full">
            <div className="flex gap-6 ctab:flex-col">
              <div className="h-40 w-40 mx-auto">
                {teamImg ? <Image
                  className="h-40 w-40 rounded-full"
                  src={teamImg}
                  alt={teamName}
                /> :
                  <img
                    className="h-40 w-40 rounded-full"
                    src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                    alt={"user did'nt provide image"}
                  />}
              </div>


              <div className="flex flex-col gap-3">
                <div className="gap-3 items-center">
                  <h1 className="text-5xl ctab:text-4xl ctab:text-center text-cyan-200 font-semibold">{teamName}</h1>
                  <Dialog>
                    <DialogTrigger asChild>
                      <IoMdInformationCircleOutline className="ctab:w-7 flex-wrap ctab:h-7 hover:opacity-80 h-10 w-10 cursor-pointer mt-3 ctab:mx-auto"></IoMdInformationCircleOutline>
                    </DialogTrigger>
                    <DialogContent className="border-2">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">About Team</DialogTitle>
                      </DialogHeader>
                      <p className="text-lg max-h-[600px] overflow-y-scroll scrollbar-thin scrollbar-track-black scrollbar-thumb-black">{description}</p>
                    </DialogContent>
                  </Dialog>

                </div>


                <div className="flex flex-col">
                  <div className="capitalize text-2xl text-yellow-600 ctab:text-center">Team Leader {leaders?.map((leader) => (
                    <h3 key={leader._id.toString()} className="ctab:mx-auto bg-red-300 w-fit mb-1 mt-1 text-black  px-2 border-2 border-red-900 rounded-xl text-lg">{leader.name}</h3>
                  ))}</div>
                  <h3 className="text-2xl mt-4 ctab:text-center">Created By: {createdBy?.name}</h3>
                </div>

                <div className="flex justify-center gap-4 flex-wrap">
{!isVolunteer &&
                  <Button className="w-fit text-md">Request to Join</Button>}
{ isLeader &&      <div className="">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Team</DialogTitle>
                        <div>
                          {/* give edit team form content here*/}
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Manage Team Members</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogContent>
                        <DialogHeader>
                          <DialogContent>Manage Team Members</DialogContent>
                        </DialogHeader>
                        <div>
                          {/* give manage team content here*/}
                        </div>
                      </DialogContent>
                    </DialogContent>
                  </Dialog>
                  </div>
}
                </div>

              </div>
            </div>

          </Card>

          <div className="w-full rounded-xl mt-5">
            <Tabs defaultValue="members">
              <TabsList className="flex items-center justify-center bg-transparent flex-wrap h-auto space-y-1">
                <TabsTrigger value="members" className="mt-1 text-lg">Members</TabsTrigger>
                <TabsTrigger value="posts" className="text-lg">Posts</TabsTrigger>
              </TabsList>
              <TabsContent value="members"><TeamMembersCard members={members}></TeamMembersCard></TabsContent>
              <TabsContent value="posts">
                <div>
                  <WhatsOnTeamMind title={teamName}
                  id={id!} 
                  ></WhatsOnTeamMind>
                </div>
              </TabsContent>
            </Tabs>
          </div>


        </div >

        <Accordion type="single" collapsible className="hidden ctab:flex w-full mb-10">
          <AccordionItem value="item-1" className="w-full">
            <AccordionTrigger className="text-2xl w-full border-2">Upcoming Events</AccordionTrigger>
            <AccordionContent className="w-full">
              <UpcomingEventsCard events={events} mongoId={mongoId}></UpcomingEventsCard>
            </AccordionContent>
          </AccordionItem>
        </Accordion>


        <div className="ctab:hidden">
          <UpcomingEventsCard events={events} mongoId={mongoId}>
          </UpcomingEventsCard>
        </div>



      </div >

      <div className="flex">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="ml-10 cphone:mx-auto">Create Event</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[600px] max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Event</DialogTitle>
            </DialogHeader>

            <div className="flex overflow-hidden h-[500px]">
              <CreateEvent teamId={id} members={members}></CreateEvent>
            </div>

          </DialogContent>
        </Dialog>

      </div>

    </div >
    </Layout>
  )
}

const UpcomingEventsCard = ({ events, mongoId }: { events: IEvent[] | null, mongoId: string }) => {
  return (
    <Card className="glass w-full">
      <CardHeader>
        <CardTitle className="text-xl text-cyan-200">Upcoming Events</CardTitle>
      </CardHeader>

      <CardContent>

        <div className="flex flex-col gap-2">
          {events?.map((event) => (
            <EventCard key={event._id.toString()} event={event} mongoId={mongoId}></EventCard>
          ))}
        </div>

      </CardContent>
    </Card >

  )
}

const EventCard = ({ event, mongoId }: { event: IEvent, mongoId: string }) => {
  return (
    <div className="bg-transparent w-full hover:bg-slate-700 hover:scale-[1.02] transition-all duration-200 min-w-[300px] cphone:w-[210px] rounded-xl p-3">
      <h1 className="text-purple-300 font-semibold text-2xl">{event.name}</h1>
      <p className="mt-3 text-lg">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
      <p>SNT Building</p>
      <Button className="mt-4">
        <Link href={`/event/${event._id.toString()}?uid=${mongoId}`} className="p-2 rounded-full transition-colors group-hover:rotate-45 transform duration-300">
          View Event
        </Link>
      </Button>
    </div>
  )
}



const TeamMembersCard = ({ members }: { members: IUser[] | null }) => {
  return (
    <Card className="mt-10 bg-transparent border-0">
      <CardContent className="">
        <div className="flex flex-wrap gap-7 justify-center">
          {members?.map((member) => <MemberCard member={member} key={member._id.toString()}></MemberCard>)}
        </div>
      </CardContent>
    </Card>
  )
}

const MemberCard = ({ member }: { member: IUser }) => {
  return (
    <Card className="w-fit hover:[glass] hover:bg-slate-700 border-0 cursor-pointer bg-transparent">
      <CardContent className="mt-7">
        <div className=" w-fit ctab:gap-5">
          <h1 className="text-2xl capitalize ctab:text-xl">{member.name}</h1>
          <p className="text-sm">{member.email}</p>
        </div>
      </CardContent>
    </Card>)
}

const teamPageWithSuspense = () => (
  <Suspense fallback={<div>Loading</div>}>
    <TeamPage></TeamPage>
  </Suspense>
)

export default teamPageWithSuspense;