'use client'

import { FormEvent, useEffect, useState, Suspense } from "react";

import { newMember } from "@/components/expandableCards/card";
import { toast } from "react-toastify";
import { IUser } from "@/components/expandableCards/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { Mongoose } from "mongoose";
import Image from "next/image";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const CreateEvent = ({ members, teamId }: { members: IUser[] | null, teamId: string | null }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
 
  const [eventMembers, setEventMembers] = useState<IUser[] | null>(members);
  const [leaders, setLeaders] = useState<newMember[] | null>([]);
  const [currentPerson, setCurrentPerson] = useState<IUser | string | null>();

  const [location, setLocation] = useState<string | null>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const now = new Date();
const [eventDate, setEventDate] = useState(now.toISOString().split('T')[0]); // "YYYY-MM-DD"
const [eventTime, setEventTime] = useState(now.toTimeString().slice(0, 5));   // "HH:MM"





  const handleSubmit = async (event: FormEvent) => {
    console.log(teamId, "teamId")

    if (!currentPerson) {
      setCurrentPerson(user?._id as string
      )
    }
    event.preventDefault(); // Prepare data
    setSubmitted(true);
    // Combine into full ISO string


    if (!name || !description || !eventDate || !eventMembers || !leaders || !currentPerson || !teamId || !eventTime || !location) {
      toast.error('Please fill in all required fields.');
      setSubmitted(false);
      return;
    }


  const combinedDateTime = new Date(`${eventDate}T${eventTime}:00`);


    const data = { name, description, date: eventDate, members: eventMembers, leaders, createdBy: currentPerson, team: teamId, eventTime, location ,  dateTime: combinedDateTime.toISOString(), };

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
    setSubmitted(false);
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
    <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-600 px-4 py-6 space-y-6">

  {/* Team Members Section */}
  <div className="bg-slate-900 rounded-xl p-4 shadow-md">
    <h1 className="text-lg font-semibold text-center text-cyan-300 mb-2">Available Team Members</h1>
    <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-black flex flex-wrap gap-4 justify-center">
      {members?.map((member) => (
        <MemberCard addToEvent={addToEvent} member={member} key={member._id.toString()} />
      ))}
    </div>
  </div>

  {/* Event Crew Section */}
  {eventMembers && eventMembers?.length > 0 && (
    <div className="bg-slate-900 rounded-xl p-4 shadow-md space-y-4">
      <h1 className="text-rose-500 font-bold text-lg">Crew for the Event:</h1>
      <div className="flex flex-wrap gap-3">
        {eventMembers?.map((member) => (
          <div
            key={member._id.toString()}
            className="bg-red-300 border-2 border-red-900 px-3 py-2 rounded-2xl flex items-center gap-2 text-black"
          >
            <span className="capitalize font-medium">{member.name}</span>
            <button
              onClick={() => removeHandler(member._id.toString())}
              className="text-red-700 font-bold hover:text-red-900"
            >
              ✕
            </button>
            <button
              onClick={() => addLeaders(member)}
              className="text-green-700 font-bold hover:text-green-900"
            >
              Lead
            </button>
          </div>
        ))}
      </div>

      {leaders && leaders?.length > 0 && (
        <div>
          <h2 className="text-yellow-500 text-md font-semibold mt-3">Leaders for the Event:</h2>
          <div className="flex flex-wrap gap-3 mt-2">
            {leaders?.map((leader) => (
              <div
                key={leader._id.toString()}
                className="bg-orange-400 border-2 border-red-600 px-3 py-2 rounded-2xl flex items-center gap-2 text-black"
              >
                <span className="capitalize font-medium">{leader.name}</span>
                <span
                  onClick={() => removeLeader(leader._id.toString())}
                  className="cursor-pointer text-red-700 font-bold hover:text-red-900"
                >
                  ✕
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}

  {/* Event Form Section */}
  <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl p-6 shadow-lg space-y-5 max-w-3xl mx-auto">
    <h1 className="text-xl text-center text-cyan-200 font-bold">Create New Event</h1>

    <div>
      <Label htmlFor="name" className="text-cyan-100">Event Name</Label>
      <Input
        id="name"
        disabled={submitted}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="mt-2"
      />
    </div>

    <div>
      <Label htmlFor="description" className="text-cyan-100">Description</Label>
      <Textarea
        id="description"
        disabled={submitted}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        className="mt-2"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="w-full px-4 py-2 flex flex-col">
  <label htmlFor="eventTime">Event Time</label>
  <input
    type="time"
    id="eventTime"
    className="mt-2"
    value={eventTime}
    onChange={(e) => setEventTime(e.target.value)}
    required
  />
</div>

      <div>
        <Label htmlFor="location" className="text-cyan-100">Location</Label>
        <Input
          id="location"
          type="text"
          disabled={submitted}
          value={location || ''}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="mt-2"
        />
      </div>

      <div className="w-full px-4 py-2 flex flex-col">
  <label htmlFor="eventDate">Event Date</label>
  <input
    type="date"
    id="eventDate"
    className="mt-2"
    value={eventDate}
    onChange={(e) => setEventDate(e.target.value)}
    required
  />
</div>
    </div>

    <Button
      type="submit"
      disabled={submitted}
      className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700"
    >
      {submitted ? "Creating..." : "Create Event"}
    </Button>
  </form>
</div>




  );
}

const MemberCard = ({ member, addToEvent }: { member: IUser, addToEvent: (member: IUser) => void }) => {
  return <div onClick={() => addToEvent(member)} className="flex w-full mb-1 items-center gap-3 hover:scale-[1.02] transition-all duration-200 hover:bg-slate-700 hover:[glass] cursor-pointer p-2 rounded-lg">
    <img className="w-10 h-10 rounded-full" src={member.image} alt="profile picture of member" />
    <span className="capitalize">{member.name}</span>
  </div>
}

export default CreateEvent;
