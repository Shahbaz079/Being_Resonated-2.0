'use client';
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/components/expandableCards/hooks/use-outside-click";
import mongoose from "mongoose";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";



export interface IUser {
  _id: mongoose.Schema.Types.ObjectId,
  name: string;
  email: string;
  dob?: Date;
  gradYear?: number;
  password?: string;
  image?: string;
  interests?: string[];
  teams?: mongoose.Schema.Types.ObjectId[];
  assignedWorks?: {
    work?: string;
    completionDate: Date;
    team: mongoose.Schema.Types.ObjectId;
  }[];
  posts?: string[];
  role?: string;
  authProviderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserArray = IUser[];

interface ExpandableCardDemoProps { users: IUserArray; cUser: IUser | null; }

export interface newMember {
  _id: mongoose.Schema.Types.ObjectId,
  image?: string;
  name: string;
  gradYear?: number;
}

export function ExpandableCardDemo({ users, cUser }: ExpandableCardDemoProps) {
  const [active, setActive] = useState<IUser | boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [cInterests, setCInterests] = useState<string[]>([]);

  useOutsideClick(ref, () => setActive(null));

  useEffect(() => {
    if (active && typeof active === "object" && cUser) {
      const commonInterests = (cUser?.interests && active.interests) ? active.interests.filter((interest) => cUser.interests?.includes(interest) ?? false) : [];
      setCInterests(commonInterests);
    }
  },
    [active, cUser]);

  const addTeamHandler = (user: IUser) => {
    const newMember: newMember = {
      _id: user._id,
      name: user.name,
      gradYear: user.gradYear,
      image: user.image,
    }

    const storedMembersString = localStorage.getItem('members');

    let membersArray: newMember[] = [];

    if (storedMembersString) {
      membersArray = JSON.parse(storedMembersString);
    }

    if (!newMember) {
      alert('No member selected!');
      return;
    }

    const memberExists = membersArray.some(member => member._id === newMember._id);

    if (memberExists) {
      alert('Member already exists!');
      return;
    }

    membersArray.push(newMember);

    localStorage.setItem('members', JSON.stringify(membersArray));

    window.dispatchEvent(new Event('local-storage-update'));



    console.log('New member added to local storage');
  }

  return (
    <>
      <ul className="w-full flex flex-col gap-3">

        {users?.map((card) => (

          <Dialog>
            <DialogTrigger>
              <div
                onClick={() => setActive(card)}
                key={`card-${card.name}-${id}`}
                className="transform gap-10 transition-transform duration-200 hover:scale-[1.02] p-4 flex w-full hover:bg-gray-700 md:flex-row justify-between items-center rounded-xl cursor-pointer"
              >
                <div className="flex gap-4">
                  <div>
                    {card.image ?
                      <img
                        src={card.image}
                        alt={card.name}
                        className="h-12 w-12 rounded-full object-cover object-top"
                      /> :
                      <img
                        src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                        alt={"user did'nt provide image"}
                        className="h-12 w-12 rounded-full object-cover object-top"
                      />}
                  </div>

                  <div className="">
                    <h3 className="font-medium text-cyan-200 text-center">
                      {card.name}
                    </h3>

                    <p className="text-cyan-600">
                      {card.gradYear}
                    </p>
                  </div>
                </div>

                <button className="border-2 w-fit self-end border-cyan-700 px-3 py-1 rounded-lg"
                  onClick={() => addTeamHandler(card)}
                >
                  Add to Team
                </button>
              </div>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 opacity-75">
              <DialogTitle></DialogTitle>
              <div>
                <div className="flex gap-6">
                  <img src={card.image} alt={card.name} className="h-44 w-44 rounded-full border-cyan-400" />
                  <div className="flex flex-col">
                    <span className="capitalize text-xl text-cyan-200">{card.name}</span>
                    <span className="text-lg text-cyan-300">{card.gradYear}</span>
                    <p className="mt-4">You both share these common Interests:</p>
                    <p className="text-sm text-red-400 mt-1">{cInterests.join(", ")}</p>
                    <button onClick={() => addTeamHandler(card)} className="border-2 border-cyan-500 text-cyan-500 w-fit px-2 py-1 mt-5 hover:opacity-70">Add to Team</button>
                  </div>

                </div>
              </div>
            </DialogContent>
          </Dialog>

        ))}
      </ul >
    </>
  );
}

// export const CloseIcon = () => {
//   return (
//     <motion.svg
//       initial={{
//         opacity: 0,
//       }}
//       animate={{
//         opacity: 1,
//       }}
//       exit={{
//         opacity: 0,
//         transition: {
//           duration: 0.05,
//         },
//       }}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className="h-4 w-4 text-black"
//     >
//       <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//       <path d="M18 6l-12 12" />
//       <path d="M6 6l12 12" />
//     </motion.svg>
//   );
// };

