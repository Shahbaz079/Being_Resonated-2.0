'use client'

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { currentPerson, people } from "@/action/user";
import mongoose from "mongoose";
import { ExpandableCardDemo,IUser,IUserArray } from "@/components/expandableCards/card";

const SimPeople = () => {


    const searchParams = useSearchParams();
    const id = searchParams.get('id') as string;
    const [similarPeople, setSimilarPeople] = useState([]);

    const [loggedUser, setLoggedUser] = useState<IUser | null>(null);

  
   


    useEffect(() => { 
        const fetchPeople = async () => {
         try { const response = await fetch(`/api/people?id=${id}`); 
            const data = await response.json();
             setSimilarPeople(data); } catch (error) { console.error('Error fetching people:', error); } };
             fetchPeople();



             const fetchCurrentPerson = async () => { 
                try { const response = await fetch(`/api/currentPerson?id=${id}`); 
                    const data = await response.json();
                     setLoggedUser(data); } catch (error) { console.error('Error fetching current person:', error); }
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
             <ExpandableCardDemo users={similarPeople} cUser={loggedUser}/>
            </div>
           
        </div>
    );
}

export default SimPeople;
