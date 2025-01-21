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
    <div className="flex flex-row relative w-[100vw] ">
      <div className="absolute left-5 h-[80vh] w-[45vw]">
        <form className="flex flex-col gap-3 items-center mt-20  max-w-[500px]" onSubmit={handleSubmit}>
          <div className="w-[80%] px-4 py-2 flex flex-col ">
            <Label htmlFor="name">Event Name:</Label>
            <Input type="text" id="name" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="w-[80%] px-4 py-2 flex flex-col ">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" className="mt-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="w-[80%] px-4 py-2 flex flex-col ">
            <Label htmlFor="time">Time</Label>
            <Input type="string" id="time" className="mt-2" value={time || ''} onChange={(e) => setTime(e.target.value.toString())} required />
          </div>
          <div className="w-[80%] px-4 py-2 flex flex-col ">
            <Label htmlFor="location">Location</Label>
            <Input type="string" className="mt-2" value={location || ''} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className="w-[80%] px-4 py-2 flex flex-col ">
            <Label htmlFor="eventDate">Event Date</Label>
            <Input type="date" id="eventDate" className="mt-2" value={eventDate} required onChange={(e) => setEventDate(e.target.value)} />
          </div>

          {eventMembers && eventMembers.length > 0 && (
            <div className="">
              <h1 className="text-yellow-600 font-semibold mt-3 text-2xl mb-3">Crew for the Event:</h1>

              {eventMembers?.map(member => (
                <div className="flex flex-col gap-10 text-black" key={member._id.toString()} >

                  <div className="flex border-2 w-fit gap-2 border-red-900 bg-red-300 items-center rounded-2xl px-2 py-1">
                    <span className="capitalize">{member.name}</span>
                    <button className="rounded-full text-red-800 font-bold" onClick={() => removeHandler(member._id.toString())}>X</button>
                    <button className={`text-green-700 font-bold`} onClick={() => addLeaders(member)}>Lead</button>
                  </div>

                </div>
              ))}
              {leaders && leaders.map((leader) => (
                <div key={leader._id.toString()}>
                  <h1>Leader:</h1>
                  <div>{leader.name} <span onClick={() => removeLeader(leader._id.toString())}>X</span></div>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" className="mt-3">Create Event</Button>
        </form>
      </div>
      <div className="w-[45%] overflow-y-scroll h-[80vh] rounded-[8px] border-[4px] absolute top-[10vh] right-5 left-[50%]">
        {members && members.length > 0 &&
          members.map(member => (
            <div className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer" key={member._id.toString()}>
              <div className="flex gap-4 flex-col md:flex-row">
                <div>
                  {member.image ? <img
                    width={100}
                    height={100}
                    src={member.image}
                    alt={member.name}
                  /> :
                    <Image
                      width={100}
                      height={100}
                      src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                      alt={"member did not provide image"}
                    />}
                </div>
                <div className="">
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left">
                    {member.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-center md:text-left">
                    {member.gradYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => addToEvent(member)}
                className="addButton px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black mt-4 md:mt-0"
              >
                Add To Event
              </button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default CreateEvent;
