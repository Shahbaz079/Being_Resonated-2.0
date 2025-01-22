'use client'

import { FormEvent, useEffect, useState, Suspense } from "react";

import { newMember } from "@/components/expandableCards/card";
import { toast } from "react-toastify";
import { IUser } from "@/components/expandableCards/card";
import { useUser } from "@clerk/nextjs";
import { Mongoose } from "mongoose";
import Image from "next/image";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CreateEvent = ({ members, teamId }: { members: IUser[] | null, teamId: string | null }) => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventMembers, setEventMembers] = useState<IUser[] | null>(members);
  const [leaders, setLeaders] = useState<newMember[] | null>([]);
  const [currentPerson, setCurrentPerson] = useState<IUser | string | null>();
  const [time, setTime] = useState<string | null>();
  const [location, setLocation] = useState<string | null>("");





  const handleSubmit = async (event: FormEvent) => {
    console.log(teamId, "teamId")

    if (!currentPerson) {
      setCurrentPerson(user?.publicMetadata.mongoId as string
      )
    }
    event.preventDefault(); // Prepare data

    if (!name || !description || !eventDate || !eventMembers || !leaders || !currentPerson || !teamId || !time || !location) {
      toast.error('Please fill in all required fields.');
      return;
    }





    const data = { name, description, date: eventDate, members: eventMembers, leaders, createdBy: currentPerson, team: teamId, time, location };

    // Send data to the API
    try {
      const response = await fetch(`/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData: IUser | null = await response.json();
      // Handle response
      if (response.ok) {
        toast.success('Event created successfully!');
        window.location.href = `/team/${teamId}?id=${teamId}`;
      } else {
        toast.error('Failed to create Event!');
        window.location.href = `/`;
      }
    } catch (error) {
      console.error('Error creating Event:', error);
    }
  };

  const removeHandler = (id: string) => {
    const newMembers = eventMembers?.filter(member => member._id.toString() !== id);
    if (newMembers) {
      setEventMembers(newMembers);
    } else {
      setEventMembers([]);
    }
  };

  const removeLeader = (id: string) => {
    if (leaders) {
      const newLeaders = leaders.filter(leader => leader._id.toString() !== id);
      setLeaders(newLeaders);
    } else {
      setLeaders([]);
    }
  };

  const addLeaders = (member: newMember) => {
    if (leaders) {
      setLeaders([...leaders, member]);
    } else {
      setLeaders([member]);
    }
  };

  const addToEvent = (member: IUser) => {
    if (eventMembers) {
      setEventMembers([...eventMembers, member]);
    } else {
      setEventMembers([member]);
    }
  };

  return (
    <div className="h-full w-full overflow-y-scroll scrollbar-thin scrollbar-track-black scrollbar-thumb-blue-600 px-4 py-2">

      <div className="mt-4 flex flex-col items-center rounded-xl px-4 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-track-black scrollbar-thumb-black">
        {members?.map((member) => <MemberCard addToEvent={addToEvent} member={member} key={member._id.toString()}></MemberCard>)}
      </div>

      <form className="flex flex-col gap-3 items-center w-full" onSubmit={handleSubmit}>

        {eventMembers && eventMembers.length > 0 && (
          <div className="mt-5 w-full p-2 px-4">
            <h1 className="text-rose-600 font-semibold text-lg mb-3">Crew for the Event:</h1>

            <div className="flex gap-3 flex-start">
              {eventMembers?.map(member => (
                <div className="flex flex-col gap-10 text-black" key={member._id.toString()} >

                  <div className="flex border-2 w-fit gap-2 border-red-900 bg-red-300 items-center rounded-2xl px-2 py-1">
                    <span className="capitalize">{member.name}</span>
                    <button className="rounded-full text-red-800 font-bold" onClick={() => removeHandler(member._id.toString())}>X</button>
                    <button className={`text-green-700 font-bold`} onClick={() => addLeaders(member)}>Lead</button>
                  </div>

                </div>
              ))}
            </div>



            {leaders?.length !== 0 &&
              <div className="mt-5">
                <h1 className="text-yellow-600 text-lg">Leaders for the Event:</h1>
                <div className="flex gap-3 flex-wrap">
                  {leaders?.map((leader) => (
                    <div key={leader._id.toString()} className="mt-3 w-fit">
                      <div className="bg-orange-400 text-black px-2 py-1 w-fit rounded-2xl flex gap-2 items-center border-2 border-red-600">
                        <span className="capitalize">{leader.name} </span>
                        <span className="cursor-pointer text-red-700 font-bold" onClick={() => removeLeader(leader._id.toString())}>X</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            }


          </div>
        )}
        <div className="w-full px-4 py-2 flex flex-col mt-5">
          <Label htmlFor="name">Event Name:</Label>
          <Input type="text" id="name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="w-full px-4 py-2 flex flex-col ">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" className="mt-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="w-full px-4 py-2 flex flex-col ">
          <Label htmlFor="time">Time</Label>
          <Input type="string" id="time" className="mt-2" value={time || ''} onChange={(e) => setTime(e.target.value.toString())} required />
        </div>
        <div className="w-full px-4 py-2 flex flex-col ">
          <Label htmlFor="location">Location</Label>
          <Input type="string" className="mt-2" value={location || ''} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div className="w-full px-4 py-2 flex flex-col ">
          <Label htmlFor="eventDate">Event Date</Label>
          <Input type="date" id="eventDate" className="mt-2" value={eventDate} required onChange={(e) => setEventDate(e.target.value)} />
        </div>



        <Button type="submit" className="mt-3">Create Event</Button>
      </form>

    </div>



  );
}

const MemberCard = ({ member, addToEvent }: { member: IUser, addToEvent: (member: IUser) => void }) => {
  return <div onClick={() => addToEvent(member)} className="flex w-full mb-1 items-center gap-3 hover:bg-accent cursor-pointer p-2 rounded-lg">
    <img className="w-10 h-10 rounded-full" src={member.image} alt="profile picture of member" />
    <span className="capitalize">{member.name}</span>
  </div>
}

export default CreateEvent;
