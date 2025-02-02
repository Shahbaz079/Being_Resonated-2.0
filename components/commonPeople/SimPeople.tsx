'use client'

import { useEffect, useState, Suspense } from "react";

import Link from "next/link";

import { ExpandableCardDemo, IUser } from "@/components/expandableCards/card";
import { useUser } from "@clerk/nextjs";

const SimPeople = ({id}:{id:string}) => {
    
    const [similarPeople, setSimilarPeople] = useState<IUser[]>([]);
    const [loggedUser, setLoggedUser] = useState<IUser | null>(null);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
    const {isLoaded,user} = useUser();

    const mongoId=user?.publicMetadata?.mongoId as string;

    useEffect(() => {
        const fetchPeople = async () => {
            setLoadingUsers(true);
            try {
                const response = await fetch(`/api/people?id=${mongoId}`);

                const data = await response.json();
                setSimilarPeople(Array.isArray(data) ? data : []);
                setLoadingUsers(false);
            } catch (error) { console.error('Error fetching people:', error); }
        };

        

        const fetchCurrentPerson = async () => {
            try {
                const response = await fetch(`/api/currentperson?id=${mongoId}`);
                const data = await response.json();
                setLoggedUser(data);
            } catch (error) {
                console.error('Error fetching current person:', error);
            }
        }
       
            if (isLoaded){
            fetchCurrentPerson();
            fetchPeople();
            }
        
        

    }, [isLoaded]);



    return (
        <div className="h-fit px-4 pb-4 items-center">
            <h1 className="text-center p-3 font-semibold text-cyan-200 text-md">Users</h1>

            <div className="mt-2 mx-4 hover:opacity-90 border-2 text-center bg-teal-600 rounded-lg flex">
                <Link href={`/profile?id=${id}`} className="text-white w-full text-sm text-center px-2 py-1">User Profile</Link>
            </div>

            {loadingUsers && <svg className="mx-auto mt-6 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            <div className="text-cyan-200 mt-7">
                {
                    !loadingUsers && similarPeople.length === 0 ? (<><h1 className="text-center text-gray-400">Update your interests to find people sharing same vision as yours</h1>
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
