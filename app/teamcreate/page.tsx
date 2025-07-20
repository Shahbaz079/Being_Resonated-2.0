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
import { useQuery } from "@tanstack/react-query";
import LoadingAnimation from "@/components/loadingAnimation/loadingAnimation";

const fetchCurrentPerson = async (id: string): Promise<IUser> => {
  const res = await fetch(`/api/currentperson?id=${id}`);
  if (!res.ok) throw new Error('Failed to fetch current person');
  return res.json();
};

const fetchSimilarPeople = async (id: string): Promise<IUser[]> => {
  const res = await fetch(`/api/people?id=${id}`);
  if (!res.ok) throw new Error('Failed to fetch people');
  return res.json();
};

const CreateTeam = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<IUser[]>([]);
  const [leaders, setLeaders] = useState<IUser[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get('id') as string;

  // ✅ Fetch Current Person
  const {
    data: currentPerson,
    isLoading: loadingCurrent,
    error: errorCurrent,
  } = useQuery({
    queryKey: ['currentPerson', id],
    queryFn: () => fetchCurrentPerson(id),
    enabled: !!id, // only run if id is present
  });

  // ✅ Fetch Similar People
  const {
    data: similarPeople = [],
    isLoading: loadingSimilar,
    error: errorSimilar,
  } = useQuery({
    queryKey: ['similarPeople', id],
    queryFn: () => fetchSimilarPeople(id),
    enabled: !!id,
  });

  // ✅ Add current person as default member once fetched
  useEffect(() => {
    if (currentPerson && members.length === 0) {
      setMembers([currentPerson]);
    }
  }, [currentPerson]);

  const click = (user: IUser) => {
    if (!members.find(m => m._id === user._id)) {
      setMembers(prev => [...prev, user]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (!name || !description || members.length === 0 || leaders.length === 0 || !id) {
      toast.error('Please fill in all required fields.');
      setSubmitted(false);
      return;
    }

    const data = {
      name,
      description,
      members,
      leaders,
      createdBy: id,
    };

    try {
      const response = await fetch(`/api/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success('Team created successfully!');
        setSubmitted(false);
        window.location.href = `/becommunity?id=${id}`;
      } else {
        toast.error('Failed to create team!');
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Unexpected error occurred.');
      setSubmitted(false);
    }
  };

  const removeHandler = (id: string) => {
    setMembers(prev => prev.filter(member => member._id.toString() !== id));
  };

  const removeLeader = (id: string) => {
    setLeaders(prev => prev.filter(leader => leader._id.toString() !== id));
  };

  // ✅ You can conditionally render loaders/errors
  if (loadingCurrent || loadingSimilar) {
    return (<div className="min-h-screen mt-44">
        <LoadingAnimation />
      </div> );
  }

  if (errorCurrent || errorSimilar) {
    return <div className="text-center mt-10 text-red-400">Error loading data</div>;
  }


  return (
    <div className="w-full mt-8 px-4 sm:px-8">
  <h1 className="text-4xl font-bold text-center text-cyan-300 mb-6">Create Your Team</h1>

  {/* Step 1: Search Users */}
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-md p-6 max-w-2xl mx-auto relative z-50 min-h-20">
    <h2 className="text-xl font-semibold text-cyan-200 mb-3 absolute top-0 ">Step 1: Find Teammates</h2>
    <SearchPage type="user" click={click} />
  </div>

  {/* Step 2: Suggested Users */}
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-6 -z-30">
    <h2 className="text-lg font-semibold text-blue-300 text-center">Suggested Team members</h2>
    <div className="mt-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent space-y-3">
      {similarPeople.map((user) => (
        <div
          key={user._id.toString()}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/10 transition cursor-pointer"
          onClick={() => click(user)}
        >
          <Image
            src={user.image || ""}
            alt={user.name}
            className="rounded-full"
            width={40}
            height={40}
          />
          <div>
            <div className="capitalize font-medium text-lg text-white">{user.name}</div>
            <div className="text-sm text-gray-400">{user.gradYear}</div>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* Step 3: Team Members */}
  {members.length > 0 && (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-6">
      <h2 className="text-lg font-semibold text-rose-300 mb-4">Selected Team Members</h2>
      <div className="flex flex-wrap gap-3">
        {members.map((member) => (
          <div
            key={member._id.toString()}
            className="bg-red-300 text-black border border-red-700 rounded-2xl px-3 py-2 flex items-center gap-2"
          >
            <span className="capitalize">{member.name}</span>
            <button
              type="button"
              onClick={() => setLeaders([...leaders, member])}
              className="text-green-800 font-bold"
            >
              Lead
            </button>
            {member._id.toString() !== currentPerson?._id.toString() && (
              <button
                type="button"
                onClick={() => removeHandler(member._id.toString())}
                className="text-red-800 font-bold"
              >
                X
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Step 4: Leaders */}

  {leaders.length > 0 ? (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-6">
      <h2 className="text-lg font-semibold text-yellow-300 mb-4">Team Leaders</h2>
      <div className="flex flex-wrap gap-3">
        {leaders.map((leader) => (
          <div
            key={leader._id.toString()}
            className="bg-orange-300 text-black border border-red-600 rounded-2xl px-3 py-2 flex items-center gap-2"
          >
            <span className="capitalize">{leader.name}</span>
            
              <button
                type="button"
                onClick={() => removeLeader(leader._id.toString())}
                className="text-red-800 font-bold"
              >
                X
              </button>
           
          </div>
        ))}
      </div>
    </div>
  ):(
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-6">
      <h2 className="text-lg font-semibold text-yellow-300 mb-4">No Leaders Selected</h2>
      <p className="text-gray-400">You can select leaders from the team members by clicking on lead button.</p>
    </div>
  )}

  {/* Step 5: Team Details Form */}
  <form
    onSubmit={handleSubmit}
    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-6 flex flex-col gap-5"
  >
    <h2 className="text-xl font-semibold text-cyan-200">Step 5: Finalize Your Team</h2>

    <div>
      <Label htmlFor="name" className="text-cyan-100">Team Name</Label>
      <Input
        disabled={submitted}
        className="mt-1 w-full bg-white/10 border border-white/20 text-white"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
    </div>

    <div>
      <Label htmlFor="description" className="text-cyan-100">Description</Label>
      <Textarea
        disabled={submitted}
        className="mt-1 w-full bg-white/10 border border-white/20 text-white"
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
    </div>

    <Button
      disabled={submitted}
      type="submit"
      className="mx-auto mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-full shadow-lg"
    >
      Create Team
    </Button>
  </form>
</div>

  );
}





const CreateTeamWithSuspense = () => (
  <Suspense fallback={<LoadingAnimation/>}>
    <CreateTeam />
  </Suspense>)

export default CreateTeamWithSuspense;
