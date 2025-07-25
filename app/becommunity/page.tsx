'use client'

import SimPeopleWithSuspense from "@/components/commonPeople/SimPeople"
import Link from "next/link";
import { useState } from "react"
import { ObjectId } from "mongoose";

import EventCard from "@/components/eventCard/EventCard";
import PostCard from "@/components/eventCard/PostCard";
import "./becommunity.css";
import Layout from "@/components/customLayouts/Layout";
import WhatsOnUserMind from "@/components/WhatsOnYourMInd/WhatsOnUserMind";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoadingAnimation from "@/components/loadingAnimation/loadingAnimation";
import { useUser } from "@clerk/nextjs";
import ITeam from "@/models/Team";

import {
  useQuery,
  useInfiniteQuery
} from '@tanstack/react-query';

import {
  fetchEventPosts,
  fetchUserPosts,
  fetchTeamPosts,
  fetchTopTeams
} from "@/lib/fetchPosts";
import Image from "next/image";


export interface EventPost {
  _id?: ObjectId; // Optional, generated by MongoDB
  title: string;
  caption?: string;
  image: string;
 vid:boolean;
  eventImg: {
    image: string;
    leaders:ObjectId[]
  };
  imgThumbnail?: string;
  likes?: {
    image?: string;
    _id: ObjectId;
    name: string;
  }[]; 
  location: string;
  date: Date;
  time: string;
  createdBy: ObjectId;
  createdAt?: Date; // Managed by mongoose timestamps
  updatedAt?: Date; // Managed by mongoose timestamps
  from: ObjectId;
  isEventPost: boolean;
  projectProgress: number;

}

const BeCommunity = () => {

  
const [render, setRender] = useState<"posts" | "events" | "users" | "teams">("posts");

  const {user}=useUser();



  //const searchParams = useSearchParams();
  const mongoId = user?.publicMetadata?.mongoId as string

// Fetch Top Teams (non-paginated)
  const { data: topTeams = []} = useQuery({
    queryKey: ['topTeams'],
    queryFn: fetchTopTeams,
  });

  // Infinite Event Posts
  const {
    data: eventPages,
    fetchNextPage: fetchNextPageEvent,
    hasNextPage: hasNextPageEvent,
    isFetchingNextPage: isFetchingNextPageEvent,
    status: eventStatus,
    isLoading: isLoadingEvent
  } = useInfiniteQuery({
    queryKey: ['eventPosts'],
    queryFn: ({ pageParam = 1 }) => fetchEventPosts({ page: pageParam, limit: 2 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 2 ? undefined : allPages.length + 1,
    refetchOnWindowFocus: false, 
    staleTime: 1000 * 60 * 1, // 5 minutes
  });

  // Same for user and team posts
  const { data: userPages 
    ,fetchNextPage: fetchNextPageUser,
    hasNextPage: hasNextPageUser,
    isFetchingNextPage: isFetchingNextPageUser,
    isLoading: isLoadingUser,
    status: userStatus
  } = useInfiniteQuery({
    queryKey: ['userPosts'],
    queryFn: ({ pageParam = 1 }) => fetchUserPosts({ page: pageParam, limit: 2 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 2 ? undefined : allPages.length + 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minutes
  });

  const { data: teamPages 
    ,fetchNextPage: fetchNextPageTeam,
    hasNextPage: hasNextPageTeam,
    isFetchingNextPage: isFetchingNextPageTeam,
    status: teamStatus,
    isLoading: isLoadingTeam
  } = useInfiniteQuery({
    queryKey: ['teamPosts'],
    queryFn: ({ pageParam = 1 }) => fetchTeamPosts({ page: pageParam, limit: 2 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < 2 ? undefined : allPages.length + 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minutes
  });

  // Combine and sort posts
  const finalPosts = [
    ...(eventPages?.pages.flat() ?? []),
    ...(userPages?.pages.flat() ?? []),
    ...(teamPages?.pages.flat() ?? [])
  ].sort((a, b) => (a?.createdAt ?? 0) > (b?.createdAt ?? 0) ? -1 : 1);



  return (
    <Layout>
      <div className="bg bec relative min-h-screen pt-[100px]">



        <div className="relative">

          <div className="cbecomn:hidden tabglass cphone:text-base cphone:gap-12 cphone_small:gap-7 cphone_small:text-sm cphone:gap-y-3 tabs flex flex-wrap text-xl gap-20 border-2 w-fit mx-auto px-3 rounded-lg justify-center">

            <span onClick={() => setRender("events")} className={`${render === "events" ? "active" : ""} relative px-2 pt-3 pb-3 cursor-pointer tab`}>Events
              <div className="absolute anbd"></div>
            </span>
            <span onClick={() => setRender("posts")} className={`${render === "posts" ? "active" : ""}  relative px-2 pt-3 pb-3 cursor-pointer tab`}>Posts
              <div className="absolute anbd"></div>
            </span>
            <span onClick={() => setRender("users")} className={`${render === "users" ? "active" : ""}  relative px-2 pt-3 pb-3 cursor-pointer tab`}>Users
              <div className="absolute anbd"></div>
            </span>
            <span onClick={()=>setRender("teams")} className={`${render === "teams" ? "active" : ""} relative px-2 pt-3 pb-3 cursor-pointer tab`}>Teams
              <div className="absolute anbd"></div>
            </span>

          </div>




          <div className=" h-fit justify-between cbecom:justify-center flex gap-3 p-5 cphone:px-2">

            {render === "events" ? <div className="w-[500px] glass rounded-2xl h-fit min-w-[300px] mt-3 cbecomn:hidden">
              <h1 className="text-center p-3 text-cyan-200 font-semibold text-base">Upcoming Events</h1>
              <EventCard uId={mongoId as string} />
            </div> : null}


            {render === "teams" ? (
  <div className="w-full max-w-[500px] glass mx-2 rounded-2xl mt-4 cbecomn:hidden pb-5 shadow-xl border border-cyan-900/30 backdrop-blur-lg">
    <h1 className="text-center text-xl font-bold text-cyan-200 py-4 border-b border-cyan-800/50">
      📈 Trending Teams
    </h1>

    <Link
      href={`/teamcreate?id=${mongoId}`}
      className="block mx-auto w-[90%] text-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all duration-300 text-white font-semibold rounded-xl py-2 mt-5 mb-4 shadow-md hover:shadow-lg"
    >
      ➕ Create a New Team
    </Link>

    <div className="space-y-3 px-3">
      {topTeams.map((team) => (
        <TeamCard {...team} key={team?._id?.toString()} />
      ))}
    </div>
  </div>
) : null}

            <div>
              <div className="glass rounded-2xl h-fit min-w-[300px] mt-3 cbecom:hidden">
                <h1 className="text-center p-3 text-cyan-200 font-semibold text-base">Upcoming Events</h1>
                <EventCard uId={mongoId as string} />
              </div>

              <div className="glass rounded-2xl h-fit min-w-[300px] mt-3 cbecom:hidden 
              pb-6 px-4 shadow-xl backdrop-blur-lg border border-cyan-500/20 transition-all duration-300
              ">
                <h1 className="text-center py-4 text-cyan-100 font-bold text-lg tracking-wide border-b border-cyan-400/30">📈 Trending Teams</h1>
                
             <div className="space-y-4">
    {topTeams.map((team) => (
      <TeamCard {...team} key={team?._id?.toString()} />
    ))}
  </div>
  <Link
    href={`/teamcreate?id=${mongoId}`}
    className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-xl py-2 mt-6 mb-5 text-center shadow-md hover:shadow-lg transition-all duration-300"
  >
    ➕ Create Team
  </Link>
              </div>
            </div>

            



            {render === "posts" ? <div className="posts w-full mt-3 cbecomn:hidden">
              <div className="">
                <WhatsOnUserMind></WhatsOnUserMind>
                {/**  eventPosts.map((eventPost) => (
                  <div className="" key={eventPost._id?.toString()}>
                    <PostCard post={eventPost} />
                  </div>

                ))  */}

                {( isLoadingEvent ||isLoadingTeam || isLoadingUser) && <div>
                  <LoadingAnimation></LoadingAnimation>
                </div>}

                {finalPosts?.map((post) => (
                  <div className="" key={post._id?.toString()}>
                    <PostCard post={post} />
                  </div>
                ))}
        {(hasNextPageEvent || hasNextPageTeam || hasNextPageUser) && (
      <button
        onClick={() => fetchNextPageEvent()
          || fetchNextPageUser()
          || fetchNextPageTeam()
        }
        className="load-more-btn bg-blue-500 text-white p-2 rounded mt-4 mx-auto block"
      >
        {isFetchingNextPageEvent || isFetchingNextPageTeam || isFetchingNextPageUser ? 'Loading...' : 'Load More'}
      </button>
    )}

    {(!hasNextPageEvent || !hasNextPageTeam || !hasNextPageUser) && (
      <p className="text-center mt-4 text-sm text-gray-400">No more posts to load.</p>
    )}

              </div>
            </div> : null}

            <div className="posts mt-3 w-full cbecom:hidden">
              <div className="">
                <WhatsOnUserMind></WhatsOnUserMind>
                {/**eventPosts.map((eventPost) => (
                  <div className="" key={eventPost._id?.toString()}>
                    <PostCard post={eventPost} />
                  </div>

                ))*/}

                {( isLoadingEvent ||isLoadingTeam || isLoadingUser) && <div>
                  <LoadingAnimation></LoadingAnimation>
                </div>}

                {finalPosts.map((userPost) => (
                  <div className="" key={userPost._id?.toString()}>
                    <PostCard post={userPost} />
                  </div>
                
                ))}
                 {(hasNextPageEvent || hasNextPageTeam || hasNextPageUser) && (
      <button
        onClick={() =>  fetchNextPageEvent()|| fetchNextPageUser() || fetchNextPageTeam()}
        disabled={!hasNextPageEvent && !hasNextPageTeam && !hasNextPageUser}
        className="load-more-btn bg-blue-500 text-white p-2 rounded mt-4 mx-auto block"
      >
        { isFetchingNextPageEvent || isFetchingNextPageTeam || isFetchingNextPageUser? 'Loading...' : 'Load More'}
      </button>
    )}

    { (!hasNextPageEvent || !hasNextPageTeam || !hasNextPageUser)&& (
      <p className="text-center mt-4 text-sm text-gray-400">No more posts to load.</p>
    )}


              </div>
            </div>






            {render === "users" ? <div>
              <div className="h-fit max-w-[400px] w-[400px] becomphone:w-full mt-3 glass rounded-2xl cbecomn:hidden">
                <SimPeopleWithSuspense id={mongoId} />
              </div>
            </div> : null}

            <div className="h-fit min-w-[350px] mt-3 glass rounded-2xl cbecom:hidden">
              <SimPeopleWithSuspense id={mongoId} />
            </div>

          </div>
        </div>


      </div>
    </Layout>
  )
}


const BeCommunityWithSuspense = () => (
  <Suspense fallback={<div>Loding</div>}> <BeCommunity /></Suspense>
)


const TeamCard = (team:ITeam)=> {
  return (
    <div className="w-full px-4 py-1">
      <Link className="rounded-lg flex flex-row justify-start gap-5 items-center p-3 cursor-pointer transform transition-transform duration-200 hover:scale-[1.02] hover:bg-gray-700"
      href={`/team/${team._id}?id=${team._id}`}
      >
          <Image src={team.image || "/default-image-path.jpg"} alt={team.name ||"team Img"} width={50} height={50} className=" rounded-full" />
          <span className="">{team.name}</span>
          </Link>
      </div>
    
  )
}

export default BeCommunityWithSuspense;


