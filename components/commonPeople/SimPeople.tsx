'use client'

import { Suspense } from "react";

import Link from "next/link";

import { ExpandableCardDemo, IUser } from "@/components/expandableCards/card";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

const fetchSimilarPeople = async (id: string):Promise<IUser[]> => {
  const res = await fetch(`/api/people?id=${id}`)
  if (!res.ok) throw new Error('Failed to fetch similar people')
  return res.json()
}

const fetchLoggedUser = async (id: string) :Promise<IUser>=> {
  const res = await fetch(`/api/currentperson?id=${id}`)
  if (!res.ok) throw new Error('Failed to fetch current person')
  return res.json()
}

const SimPeople = ({id}:{id:string}) => {
    

    const {isLoaded,user} = useUser();

    const mongoId=user?.publicMetadata?.mongoId as string;


    const {
  data: similarPeople = [],
  isLoading: loadingPeople,
  error: peopleError,
} = useQuery({
  queryKey: ['similarPeople', mongoId],
  queryFn: () => fetchSimilarPeople(mongoId),
  enabled: isLoaded && !!mongoId, // Only run when user is loaded and ID is available
    refetchOnWindowFocus: false, // optional
    staleTime:Infinity
})

const {
  data: loggedUser,
  isLoading: loadingUser,
  error: userError,
} = useQuery({
  queryKey: ['loggedUser', mongoId],
  queryFn: () => fetchLoggedUser(mongoId),
  enabled: isLoaded && !!mongoId,
    refetchOnWindowFocus: false, // optional
})




    return (
        <div className="h-fit px-4 pb-4 items-center">
            <h1 className="text-center p-3 font-semibold text-cyan-200 text-md">Users</h1>

            <div className="mt-2 mx-4 hover:opacity-90 border-2 text-center bg-teal-600 rounded-lg flex">
                <Link href={`/profile?id=${mongoId}`} className="text-white w-full text-sm text-center px-2 py-1">User Profile</Link>
            </div>

            {loadingPeople && <svg className="mx-auto mt-6 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            <div className="text-cyan-200 mt-7">
                {
                 similarPeople.length === 0 ? (<><h1 className="text-center text-gray-400">Update your interests from your profile to find people like as yours✨</h1>
                        <Link className="mt-2 mx-4 text-sm hover:opacity-90 py-1 justify-center border-2 text-center bg-teal-600 rounded-lg flex" href={`/profile?id=${id}`} >Update Interests</Link>
                    </>
                    ) :
                        (<ExpandableCardDemo users={similarPeople} cUser={loggedUser ? loggedUser : null} />)
                }
            </div>


        </div>
    );
}

const SimPeopleWithSuspense = ({ id }: { id: string }) => (
    <Suspense fallback={<div>Loding</div>}> <SimPeople id={id} /></Suspense>
)

export default SimPeopleWithSuspense;
