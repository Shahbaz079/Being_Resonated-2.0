'use client'

import { FormEvent, useEffect, useState, Suspense } from "react";

import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";
import { IUser } from "@/components/expandableCards/card";
import Image from "next/image";
import SearchPage from "@/components/search/Search";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";


const CreateTeam = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [members, setMembers] = useState<IUser[]>([]);
  const [leaders, setLeaders] = useState<IUser[]>([]);
  const [currentPerson, setCurrentPerson] = useState<IUser>();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [similarPeople, setSimilarPeople] = useState<IUser[]>([]);
  //  const [timage, setTimage] = useState('');
  // const [choosed, setChoosed] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;






  useEffect(() => {
    const fetchPeople = async () => {

      try {
        const response = await fetch(`/api/people?id=${id}`);

        const data = await response.json();
        setSimilarPeople(Array.isArray(data) ? data : []);
      } catch (error) { console.error('Error fetching people:', error); }
    };

    const fetchCurrentPerson = async () => {
      try {
        const response = await fetch(`/api/currentperson?id=${id}`);
        const data = await response.json();
        setCurrentPerson(data);



      } catch (error) {
        console.error('Error fetching current person:', error);
      }
    }

    fetchCurrentPerson();

    fetchPeople();




  }, [id]);

  useEffect(() => {
    if (currentPerson && members.length === 0) {
      setMembers([currentPerson]);
    }
  }, [currentPerson, members])

  const click = (user: IUser) => {
    const newMembers = [...members, user]
    setMembers(newMembers);
  }



  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // Prepare data

    setSubmitted(true);


    if (!name || !description || !members || !leaders || !id) {
      toast.error('Please fill in all required fields.');

      return;
    }

    const data = { name, description, members, leaders, createdBy: id };
    // Send data to the API

    try {
      const response = await fetch(`/api/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData: IUser | null = await response.json();
      // Handle response
      if (response.ok) {

        toast.success('Team created successfully!');
        setSubmitted(false);

        window.location.href = `/becommunity?id=${id}}`;

      } else {
        toast.error('Failed to create team!');
        redirect(`/`);
      }
    } catch (error) {
      console.error('Error creating team:', error);


    }


  };

  const removeHandler = (id: string) => {
    const newMembers = members.filter(member => member._id.toString() !== id);
    setMembers(newMembers);

  }
  const removeLeader = (id: string) => {
    const newLeaders = leaders.filter(leader => leader._id.toString() !== id)
    setLeaders(newLeaders)
  }


  return (
    <div className="w-full mt-8 p-3">
      <h1 className="text-3xl text-center">Create Team</h1>

      <div className="mt-10 max-w-[500px] mx-auto">
        <SearchPage type="user" click={click} />
      </div>


      <div className="mt-10 flex flex-col max-w-[500px] mx-auto relative">


        <div className="border-2 rounded-xl p-2 max-h-48 overflow-hidden max-w-[500px]">
          <h1 className="text-lg text-center">Users with similar interests</h1>
          <div className="flex flex-col p-3 max-h-48 overflow-y-scroll scrollbar-thin scrollbar-track-black scrollbar-thumb-blue-500">
            {
              similarPeople.map((user) => (
                <div className="p-2 w-full flex items-center gap-5 hover:bg-accent cursor-pointer" key={user._id.toString()} onClick={() => click(user)}>
                  <div className="w-10 h-10 rounded-full">
                    <Image src={user.image || " "} alt={user.name} className="w-10 h-10 rounded-full" width={200} height={200} />
                  </div>
                  <div className="flex flex-col">
                    <div className="capitalize text-xl">{user.name}</div>
                    <div className="">{user.gradYear}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>



      </div>

      <div className="mx-auto mt-8 h-fit max-w-[500px]">

        <form className="w-full flex flex-col gap-5 p-2" onSubmit={handleSubmit}>

          {
            members.length > 0 && (
              <div className="">
                <h1 className="text-rose-600 font-semibold text-lg mb-3">Crew for the Team:</h1>
                <div className="flex gap-3 flex-wrap">
                  {members.map(member => (
                    <div className="flex w-fit gap-2 border-2 text-black bg-red-300 border-red-900 items-center rounded-2xl px-2 py-1" key={member._id.toString()} >
                      <span className="capitalize"> {member.name}</span>
                      <button onClick={() => {
                        const newLeaders = [...leaders, member]
                        setLeaders(newLeaders);
                      }} className="text-green-700 font-bold">Lead</button>
                      {(member._id.toString() !== currentPerson?._id.toString()) && <button className="text-red-700 font-bold w-fit" onClick={() => removeHandler(member._id.toString())}>X</button>}
                    </div>
                  ))}
                </div>

              </div>
            )
          }

          {
            leaders.length !== 0 && (
              <div className="">
                <h1 className="text-yellow-600 text-lg">Leaders:</h1>
                <div className="flex gap-3 flex-wrap">
                  {leaders.map(leader => (
                    <div className="flex gap-2 w-full" key={leader._id.toString()} >
                      <div className="mt-3 bg-orange-400 text-black px-2 py-1 w-fit rounded-2xl flex gap-2 items-center border-2 border-red-600">
                        <span className="capitalize">{leader.name}</span>
                        {(leader._id.toString() !== currentPerson?._id.toString()) && <button className="text-red-700 font-bold w-fit" onClick={() => removeLeader(leader._id.toString())}>X</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          <div className="mt-5">
            <Label htmlFor="name">Team Name:</Label>
            <Input disabled={submitted} className="mt-1 disabled:opacity-70 disabled:cursor-not-allowed" type="text" id="name" value={name} onChange={(e) =>
              setName(e.target.value)} required />
          </div>


          <div className="">
            <Label htmlFor="description">Description</Label>
            <Textarea disabled={submitted} className="mt-1 disabled:opacity-70 disabled:cursor-not-allowed" id="description" value={description}
              onChange={(e) => setDescription(e.target.value)} required />
          </div>





          <Button disabled={submitted} type="submit" className="mx-auto disabled:opacity-70 disabled:cursor-not-allowed mt-5 w-fit">Create Team</Button> </form>
      </div >



    </div >
  );
}





const CreateTeamWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <CreateTeam />
  </Suspense>)

export default CreateTeamWithSuspense;
