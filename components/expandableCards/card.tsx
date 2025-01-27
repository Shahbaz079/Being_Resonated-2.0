'use client';
import Image from "next/image";
import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/components/expandableCards/hooks/use-outside-click";
import mongoose from "mongoose";



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

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

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
      {/* <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.name}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.name}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.name}-${id}`}>
               { active.image ? <Image
                  priority
                  width={200}
                  height={200}
                  src={active.image}
                  alt={active.name}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"/>:
                <Image
                  priority
                  width={200}
                  height={200}
                  src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                  alt={"user did'nt provide image"}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />}
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.name}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.name}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                     You Both Share these Common Interests: {cInterests.join(", ")}
                    </motion.p>
                  </div>
                  
                 
                  <motion.button
                    layoutId={`button-${active.name}-${id}`}
                   
                   onClick={()=>addTeamHandler(active)}
                  
                    className="addButton px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                   Add to Team
                  </motion.button>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    its Working
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence> */}
      <ul className="w-full gap-4">
        {users?.map((card) => (
          <div
            key={`card-${card.name}-${id}`}
            className="transform transition-transform duration-200 hover:scale-[1.02] border-2 border-cyan-900 p-4 flex w-full flex-col hover:bg-gray-700 md:flex-row justify-between items-center rounded-xl cursor-pointer"
          >
            <div className="flex gap-4 ">
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

            <button className="border-2 w-fit  border-cyan-700 px-3 py-1 rounded-lg"
              onClick={() => addTeamHandler(card)}
            >
              Add to Team
            </button>
          </div>
        ))}
      </ul >
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

