'use client';
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/components/expandableCards/hooks/use-outside-click";
import mongoose from "mongoose";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import Link from "next/link";



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



  return (
    <>
      <ul className="w-full flex flex-col gap-3">

        {users?.map((card) => (

          <Dialog key={`card-${card.name}-${id}`}>
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

                <Link href={`/profile?id=${card._id}`} className="border-2 w-fit self-end border-cyan-700 px-3 py-1 rounded-lg"
                 
                >
                  View
                </Link>
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
                    <Link href={`/profile?id=${card._id}`} className="border-2 border-cyan-500 text-cyan-500 w-fit px-2 py-1 mt-5 hover:opacity-70">View</Link>
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


