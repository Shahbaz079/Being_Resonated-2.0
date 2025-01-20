'use client'
import { IUser } from "@/components/expandableCards/card";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Modal from "@/components/Modal/Modal";
import Link from "next/link";
import CreateEvent from "@/components/eventCreate/EventCreate";
import EventModal from "@/components/Modal/EventModal";
import { Calendar, Users, Award, ChevronRight, ArrowUpRight, Sparkles, Star, MessageCircle, Share2 } from 'lucide-react';
import mongoose from "mongoose";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { TeamPostModal } from "@/components/Modal/TeamPostModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { string } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
  const [leader, setLeader] = useState<IUser>();
  const [teamName, setTeamName] = useState<string>("")
  const [modal, setModal] = useState(false);
  const [events, setEvents] = useState<IEvent[] | null>([])

  const modalCloseHandler = () => {
    setModal(false);
  }

  const [eventModal, setEventModal] = useState(false);
  const eventModalCloseHandler = () => {
    setEventModal(false);
  }

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
        setLeader(data.leader);
        setTeamName(data.name);
        setEvents(data.events)
      })


    }

    TeamHandler();
  }, [])







  return (
    <div>
      <div className="p-5 px-10 gap-7 flex justify-between ctab:flex-col ctab:items-center">
        <div className="ctab:order-2">
          <Card className="p-3 w-fit border-0">
            <div className="flex gap-3">
              <div className="h-40 w-40">
                {teamImg ? <Image
                  className="h-40 w-40"
                  src={teamImg}
                  alt={teamName}
                /> :
                  <img
                    className="h-40 w-40"
                    src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                    alt={"user did'nt provide image"}
                  />}
              </div>


              <div className="flex flex-col gap-3">
                <h1 className="text-5xl ctab:text-3xl">{teamName}</h1>
                <p className="text-xl">{description}</p>
                <div className="flex flex-col">
                  <h3 className="capitalize">Team Leader: {leader?.name}</h3>
                  <h3>Created By:{createdBy?.name}</h3>
                </div>
              </div>
            </div>


          </Card>
          <TeamMembersCard members={members}></TeamMembersCard>
        </div>

        <Accordion type="single" collapsible className="hidden ctab:flex mb-10">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-2xl w-[300px] ctab:w-[250px]">Upcoming Events</AccordionTrigger>
            <AccordionContent>
              <UpcomingEventsCard events={events} mongoId={mongoId}></UpcomingEventsCard>
            </AccordionContent>
          </AccordionItem>
        </Accordion>


        <div className="ctab:hidden">
          <UpcomingEventsCard events={events} mongoId={mongoId}>
          </UpcomingEventsCard>
        </div>









      </div>

      <div className="flex">
        <Button onClick={() => setEventModal(true)} className="ml-10 cphone:mx-auto">Create Event</Button>
        <EventModal isOpen={eventModal} onClose={eventModalCloseHandler}>
          <CreateEvent teamId={id} members={members} />
        </EventModal>
      </div>

    </div>
  )
}

const UpcomingEventsCard = ({ events, mongoId }: { events: IEvent[] | null, mongoId: string }) => {
  return (
    <Card className="max-w-[500px] ctab:p-0 w-fit max-h-[800px]">
      <CardHeader>
        <CardTitle className="text-xl">Upcoming Events</CardTitle>
      </CardHeader>

      <CardContent className="">

        <Card className="border-0 overflow-y-scroll scrollbar-thin flex flex-col gap-3">
          <CardContent>
            {events?.map((event) => (
              <EventCard key={event._id.toString()} event={event} mongoId={mongoId}></EventCard>
            ))}
          </CardContent>
        </Card>



      </CardContent>
    </Card >

  )
}

const EventCard = ({ event, mongoId }: { event: IEvent, mongoId: string }) => {
  return (
    <div className="border-2 w-[300px] cphone:w-[210px] rounded-xl p-3">
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
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl ctab:text-center">Team Members</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="flex flex-wrap gap-7 ctab:justify-center">
          {members?.map((member) => <MemberCard member={member} key={member._id.toString()}></MemberCard>)}
        </div>

      </CardContent>
    </Card>
  )
}

const MemberCard = ({ member }: { member: IUser }) => {
  return (<Card className="w-fit hover:bg-accent cursor-pointer">
    <CardContent className="mt-7">
      <div className="flex gap-10 w-fit ctab:gap-5">
        <img src={member.image} className="rounded-lg h-32 w-32" alt="Profile picture of member" />
        <h1 className="text-2xl capitalize ctab:text-xl">{member.name}</h1>
      </div>
    </CardContent>
  </Card>)
}


export default TeamPage;
