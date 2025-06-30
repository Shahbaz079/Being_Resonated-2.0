// Full optimized TeamPage with TanStack Query and all Dialogs restored
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useEdgeStore } from '@/lib/edgeStoreRouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import Layout from '@/components/customLayouts/Layout';
import WhatsOnTeamMind from '@/components/WhatsOnYourMInd/WhatsOnTeamMind';
import PostCard from '@/components/eventCard/PostCard';
import CreateEvent from '@/components/eventCreate/EventCreate';
import LoadingAnimation from '@/components/loadingAnimation/loadingAnimation';

import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label";
import { IoMdInformationCircleOutline } from 'react-icons/io';
import './teams.css';

import { IUser } from '@/components/expandableCards/card';
import mongoose from 'mongoose';
import { EventPost } from '@/app/becommunity/page';

export interface IEvent {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  leaders?: IUser[];
  image: string;
  team: mongoose.Schema.Types.ObjectId;
  date: string;
  members?: IUser[];
  description: string;
  createdBy: IUser;
  participated?: IUser[];
  requests?: IUser[];
  location: string;
  time: string;
  createdAt?: Date;
  updatedAt?: Date;
  posts?:EventPost[];
  dateTime?: Date
}



interface Team {
  members: IUser[];
  image: string;
  description: string;
  createdBy: IUser;
  leaders: IUser[];
  name: string;
  events: IEvent[];
  requests: IUser[];
  posts: any[];
}

const fetchTeamData = async (id: string): Promise<Team> => {
  const res = await fetch(`/api/team?id=${id}`);
  if (!res.ok) throw new Error('Failed to fetch team');
  return res.json();
};

const TeamPage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { user } = useUser();
  const mongoId = user?.publicMetadata.mongoId as string;

  const queryClient = useQueryClient();
  const { edgestore } = useEdgeStore();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  if(!id){
    throw new Error("Team ID is required");
  }

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => fetchTeamData(id!),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const joinMutation = useMutation({
    mutationFn: () => fetch(`/api/team?type=join&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: mongoId })
    }),
    onSuccess: () => {
      toast.success('Request sent successfully');
      queryClient.invalidateQueries({ queryKey: ["team", id] });
    },
    onError: () => toast.error('Request failed')
  });

  const handleUpload = async () => {
    if (file) {
      const res = await edgestore.mypublicImages.upload({
        file,
        onProgressChange: setProgress
      });
      await fetch(`/api/upload?id=${id}&source=team`, {
        method: 'POST',
        body: JSON.stringify({ imgUrl: res.url, thumbUrl: res.thumbnailUrl })
      });
      toast.success('Image uploaded');
      queryClient.invalidateQueries({ queryKey: ["team", id] });
      
    }
  };

  const isLeader = team?.leaders?.some(l => l._id.toString() === mongoId);
  const isVolunteer = team?.members?.some(m => m._id.toString() === mongoId);

  

  return (
    <Layout>
      <div className="bg min-h-screen pt-[100px]">
        {isLoading ? <div className="pt-44"><LoadingAnimation /></div> : (
          <div className="animate-slide-top mt-4 p-5 px-4 gap-1 flex justify-between ctab:flex-col ctab:items-center">
            <div className="ctab:order-2 w-full">
              <Card className="p-3 py-5 glass flex ctab:flex-col border-0">
                <div className="flex gap-6 ctab:flex-col">
                  <div className="h-40 w-40 relative rounded-full">
                    <Dialog >
                      <DialogTrigger asChild>
                        <Button className="opacity-0 absolute bg-black top-0 left-0 w-full h-full z-10">Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team Image</DialogTitle>
                          <Label>Upload Image</Label>
                          <input type="file" onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFile(f);
                          }} />
                          <Button onClick={handleUpload} className="mt-4">Save</Button>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                    {team && <Image
                      className="rounded-full h-40 w-40"
                      width={160}
                      height={160}
                      src={team?.image || '/default-image-path.jpg'}
                      alt={team.name}
                    />}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h1 className="text-5xl ctab:text-center text-cyan-200 font-semibold">{team?.name}</h1>
                    <Dialog>
                      <DialogTrigger asChild>
                        <IoMdInformationCircleOutline className="h-10 w-10 cursor-pointer mt-3" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>About Team</DialogTitle>
                          <p>{team?.description}</p>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>

                    <div>
                      <h3 className="text-2xl text-yellow-600">Team Leader(s):</h3>
                      {team?.leaders.map(leader => (
                        <p key={leader._id.toString()} className="text-lg">{leader.name}</p>
                      ))}
                      <h3 className="text-2xl mt-4">Created By: {team?.createdBy?.name}</h3>
                    </div>

                    {!isVolunteer && (
                      <Button onClick={() => joinMutation.mutate()}>Request to Join</Button>
                    )}
                    <div className='flex flex-row items-start justify-center'>

                    {isLeader && (
                      <Dialog>
  <DialogTrigger asChild>
    <Button>Manage Team Members</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Requests</DialogTitle>
    </DialogHeader>

    <div className="w-full max-h-[50vh] overflow-y-auto space-y-4">
      {team?.requests?.length === 0 && (
        <p className="text-muted-foreground">No pending requests</p>
      )}

      {team?.requests?.map((participant) => (
        <div
          key={participant._id.toString()}
          className="flex items-center justify-between gap-3 border-b pb-2"
        >
          <div className="flex items-center gap-4">
            <img
              src={participant.image}
              alt={participant.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{participant.name}</p>
              <p className="text-sm text-muted-foreground">{participant.gradYear}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={async () => {
                // Accept Request Handler
                const res = await fetch(
                  `/api/join?tid=${id}&id=${participant._id.toString()}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                if (res.ok) {
                  toast.success("Participant added successfully");
                  queryClient.invalidateQueries({queryKey:["team", id]}); // Refetch team data
                }
              }}
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                // Decline/Remove Handler
                const updated = team?.requests?.filter(
                  (r) => r._id !== participant._id
                );

                const res = await fetch(`/api/team?id=${id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ requests: updated }),
                });

                if (res.ok) {
                  toast.success("Request declined");
                  queryClient.invalidateQueries({queryKey:["team", id]}); // Refetch team data
                }
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  </DialogContent>
</Dialog>
                    )}

                    {isLeader && (
  <div className="flex justify-center md:justify-end mt-6">
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg shadow-md">
          Create Event
        </Button>
      </DialogTrigger>

      <DialogContent className="mt-[5vh] max-h-[90vh] w-[90vw] sm:w-[600px] md:w-[700px] overflow-y-auto rounded-2xl p-6 shadow-lg bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl text-cyan-200 font-semibold mb-4">
            Create Event
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-slate-300 mb-4">
          Fill out the details below to organize a new event for your team.
        </div>

        <CreateEvent teamId={id!} members={team?.members || []} />
      </DialogContent>
    </Dialog>
  </div>
)}

        </div>
                  </div>
                </div>
              </Card>

              <Tabs defaultValue="posts" className="mt-5">
                <TabsList>
                  {isVolunteer && <TabsTrigger value="members">Members</TabsTrigger>}
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>
                <TabsContent value="members">
                  <TeamMembersCard members={team?.members ?? []} />
                </TabsContent>
                <TabsContent value="posts">
                  {isLeader&& team && id && <WhatsOnTeamMind id={id!} title={team.name!} />}
                  {team?.posts.map(post => <PostCard key={post._id} post={post} />)}
                </TabsContent>
              </Tabs>
            </div>

            <div className="ctab:hidden">
              <UpcomingEventsCard events={team?.events ?? []} mongoId={mongoId} />
            </div>
          </div>
        )}

        
      </div>
    </Layout>
  );
};

const UpcomingEventsCard = ({ events, mongoId }: { events: IEvent[]; mongoId: string }) => (
  <Card className="glass w-full">
    <CardHeader>
      <CardTitle className="text-xl text-cyan-200">Upcoming Events</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-2">
        {events.map(event => (
          <EventCard key={event._id.toString()} event={event} mongoId={mongoId} />
        ))}
      </div>
    </CardContent>
  </Card>
);

const EventCard = ({ event, mongoId }: { event: IEvent; mongoId: string }) => (
  <div className="bg-transparent w-full hover:bg-slate-700 hover:scale-[1.02] transition-all duration-200 min-w-[300px] rounded-xl p-3">
    <h1 className="text-purple-300 font-semibold text-2xl">{event.name}</h1>
    <p className="mt-3 text-lg">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
    <p>{event.location}</p>
    <Button className="mt-4">
      <Link href={`/event/${event._id.toString()}?uid=${mongoId}`}>View Event</Link>
    </Button>
  </div>
);

const TeamMembersCard = ({ members }: { members: IUser[] }) => (
  <Card className="mt-10 bg-transparent border-0">
    <CardContent>
      <div className="flex flex-wrap gap-7 justify-center">
        {members.map(member => (
          <Card key={member._id.toString()} className="w-fit border-0 bg-transparent">
            <CardContent className="mt-7">
              <h1 className="text-2xl capitalize">{member.name}</h1>
              <p className="text-sm">{member.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);

const TeamPageWithSuspense = () => (
  <Suspense fallback={<LoadingAnimation />}>
    <TeamPage />
  </Suspense>
);

export default TeamPageWithSuspense;