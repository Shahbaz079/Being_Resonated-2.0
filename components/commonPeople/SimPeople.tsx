'use client'

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { ExpandableCardDemo, IUser } from "@/components/expandableCards/card";

const SimPeople = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') as string;
    const [similarPeople, setSimilarPeople] = useState<IUser[]>([]);
    const [loggedUser, setLoggedUser] = useState<IUser | null>(null);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

    useEffect(() => {
        const fetchPeople = async () => {
            setLoadingUsers(true);
            try {
                const response = await fetch(`/api/people?id=${id}`);

                const data = await response.json();
                console.log("hello", data);
                setSimilarPeople(Array.isArray(data) ? data : []);
                setLoadingUsers(false);
            } catch (error) { console.error('Error fetching people:', error); }
        };

        fetchPeople();

        const fetchCurrentPerson = async () => {
            try {
                const response = await fetch(`/api/currentperson?id=${id}`);
                const data = await response.json();
                setLoggedUser(data);
            } catch (error) {
                console.error('Error fetching current person:', error);
            }
        }
        fetchCurrentPerson();

    }, [id]);

    return (
        <div className="h-fit px-4 pb-4 items-center">
            <h1 className="text-center p-3 font-semibold text-cyan-200 text-md">Users</h1>

            <div className="mt-2 mx-4 hover:opacity-90 border-2 text-center bg-teal-600 rounded-lg flex">
                <Link href={`/profile?id=${id}`} className="text-white w-full text-sm text-center px-2 py-1">User Profile</Link>
            </div>

            {loadingUsers && <svg className="mx-auto mt-6 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
            <div className="text-cyan-200 mt-5">
                {
                    loggedUser?.interests?.length == 0 ? (<><h1>Update your interests to find similar people</h1>
                        <Link href={`/profile?id=${id}`} ></Link>
                    </>
                    ) :
                        (<ExpandableCardDemo users={similarPeople} cUser={loggedUser ? loggedUser : null} />)
                }
            </div>


        </div>
    );
}

const SimPeopleWithSuspense = () => (
    <Suspense fallback={<div>Loding</div>}> <SimPeople /></Suspense>
)

export default SimPeopleWithSuspense;
