'use client'

import { useEffect, useState,Suspense } from "react";
import { useSearchParams } from "next/navigation";


import { ExpandableCardDemo,IUser } from "@/components/expandableCards/card";

const SimPeople = () => {


    const searchParams = useSearchParams();
    const id = searchParams.get('id') as string;
    const [similarPeople, setSimilarPeople] = useState<IUser[]>([]);

    const [loggedUser, setLoggedUser] = useState<IUser | null>(null);

  
   


    useEffect(() => { 
        const fetchPeople = async () => {

         try { 
            const response = await fetch(`/api/people?id=${id}`); 

            const data = await response.json();
             setSimilarPeople(Array.isArray(data) ? data : []);
             } catch (error) { console.error('Error fetching people:', error); } };

             fetchPeople();



             const fetchCurrentPerson = async () => { 
                try { const response = await fetch(`/api/currentperson?id=${id}`); 
                    const data = await response.json();
                     setLoggedUser(data); } catch (error) { 
                        console.error('Error fetching current person:', error); 
                    }
                }
             fetchCurrentPerson();
             
              }, [id]);

{/*
    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    const result = await people(id);
                    const a=await currentPerson(id)
                    setSimilarPeople(result);
                    setLoggedUser(a);

                } catch (error) {
                    console.error("Error fetching similar people:", error);
                }
            })();
        }
    }, [id]);    */}

    return (
        <div>

          <div className="">

          </div>
          
          <div className="">
             <h1>#Users sharing similar interests as yours</h1>
             <ExpandableCardDemo users={similarPeople} cUser={loggedUser?loggedUser:null}/>
            </div>
           
        </div>
    );
}

const SimPeopleWithSuspense = () => (
     <Suspense fallback={<div>Loading...</div>}> 
     <SimPeople /> 
     </Suspense> )

export default SimPeopleWithSuspense;
