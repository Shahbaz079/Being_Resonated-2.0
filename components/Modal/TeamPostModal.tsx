"use client";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "@/components/animatedModal/animated-modal";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import { useEdgeStore } from "@/lib/edgeStoreRouter";
import { useState } from "react";
import { SingleImageDropzone } from "../singledropZone/SingleImageDropZone";
import { IEvent } from "@/app/team/[id]/page";
import { useUser } from "@clerk/nextjs";
import ITeam from "@/models/Team";

export function TeamPostModal({ teamName, teamId }: { teamName: string, teamId: string | null }) {

const {user}=useUser();

  const [file, setFile] = useState<File>();
  const { edgestore } = useEdgeStore();
  const [caption,setCaption]=useState<string>("");
 const [progress,setProgress]=useState<number>(0);
  const handlePost=()=>{

    const post=async()=>{

      if (file) {
        const response = await edgestore.mypublicImages.upload({
          file,
          onProgressChange: (progress) => {
            // you can use this to show a progress bar
            setProgress(progress);
          },
        });

        if(response.url){
        const res= await fetch(`/api/teampost`,{
          method:"POST",
          body:JSON.stringify({title:teamName,image:response.url,caption,createdBy:user?.publicMetadata.mongoId,teamId:teamId}),
        })
        if(res.ok){
          toast.success("Post created successfully")
        }
      }
    }
  }
  post();
}

  
  return (
    <div className="py-40  flex items-center justify-center">
      <Modal >
        <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
          <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
            Post
          </span>
          <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
            ✈️
          </div>
        </ModalTrigger>
        <ModalBody className="overflow-y-scroll">
          <ModalContent>
            <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
           {teamName } Post to{" "}
              <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                BeCommunity
              </span>{" "}
              now!
            </h4>
            <div className="flex justify-center items-center">
              
                <motion.div
                  
                  style={{
                    rotate: Math.random() * 20 - 10,
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 0,
                    zIndex: 100,
                  }}
                  whileTap={{
                    scale: 1.1,
                    rotate: 0,
                    zIndex: 100,
                  }}
                  className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
                >
                  <SingleImageDropzone
                 width={200}
                height={200}
                value={file}
                onChange={(file) => {
                    setFile(file);
        }}
      />
                </motion.div>
              
            </div>
            <div className="pt-5 flex flex-wrap   items-start justify-start max-w-sm mx-auto">
              <label htmlFor="caption">Caption:</label>
              <textarea  id="caption" className="w-[100%] h-5 border rounded-lg overflow-y-scroll"  value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
          </ModalContent>
          <ModalFooter className="gap-4">
            <button className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
              Cancel
            </button>
            <button onClick={()=>handlePost()} className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28">
              Post now
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}
