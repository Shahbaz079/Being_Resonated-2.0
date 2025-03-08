import { useEdgeStore } from "@/lib/edgeStoreRouter";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FaImage } from "react-icons/fa";
import { SingleImageDropzone } from "../singledropZone/SingleImageDropZone";
import { IoIosSend } from "react-icons/io";
import EditorBox from "./Editor";
import { GoVideo } from "react-icons/go";

const WhatsOnUserMind = () => {
  const [file, setFile] = useState<File>();
  const { edgestore } = useEdgeStore();
  const [caption, setCaption] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const { user, isLoaded } = useUser();
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("");
  const [posting, setPosting] = useState<boolean>(false);
  const editor = useRef(null);
  const placeholder = "What's on your mind ?";

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: placeholder || "Start typings...",
    }),
    [placeholder]
  );

  const imageUrl = React.useMemo(() => {
    if (typeof file === "string") {
      // in case an url is passed in, use it to display the image
      return file;
    } else if (file) {
      // in case a file is passed in, create a base64 url to display the image
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  useEffect(() => {
    if (user) {
      setMongoId(user.publicMetadata.mongoId as string);
      setUserName(user?.username);
    }
  }, [isLoaded, user]);

  const handlePost = () => {
    if (posting) return;

    setPosting(true);

    const post = async () => {
      if (file) {
        const mimeType = file.type;
        if (mimeType.startsWith("image/")) {
          const response = await edgestore.mypublicImages.upload({
            file,
            onProgressChange: (progress) => {
              setProgress(progress);
            },
          });

          if (response.url) {
            const res = await fetch(`/api/userpost`, {
              method: "POST",
              body: JSON.stringify({
                image: response.url,
                vid: false,
                imgThumbnail: response.thumbnailUrl,
                caption,
                createdBy: user?.publicMetadata.mongoId,
                name: userName,
              }),
            });
            if (res.ok) {
              toast.success("Posted successfully");
              setFile(undefined);
              setCaption("");
              setPosting(false);
            }
          }
        } else if (mimeType.startsWith("video/")) {
          videoUploadHandler();
        }
      }
    };

    post();
  };

  const videoUploadHandler = async () => {
    if (file) {
      const res = await edgestore.mypublicVideos.upload({
        file,
        onProgressChange: (progress) => {
          // you can use this to show a progress bar
          console.log(progress);
        },
      });
      // you can run some server action or api here
      // to add the necessary data to your database
      if (res.url) {
        const response = await fetch(`/api/userpost`, {
          method: "POST",
          body: JSON.stringify({
            image: res.url,
            vid: true,
            caption,
            createdBy: user?.publicMetadata.mongoId,
            name: userName,
          }),
        });
        if (response.ok) {
          toast.success("Posted successfully");
          setFile(undefined);
          setCaption("");
          setPosting(false);
        }
      }
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl w-full p-4 max-w-[600px] mx-auto mb-10 h-fit flex flex-col gap-5">
      <EditorBox content={caption} setCaption={setCaption}></EditorBox>
      <div className="flex justify-between p-2">
        <div className="flex">
          <Dialog>
            <DialogTrigger asChild>
              <FaImage className="cursor-pointer w-7 h-7 ml-2 fill-cyan-500 hover:fill-cyan-300"></FaImage>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 opacity-75">
              <DialogTitle>Select Image</DialogTitle>
              <div className="flex justify-center">
                <SingleImageDropzone
                  width={200}
                  height={200}
                  value={file}
                  onChange={(file) => {
                    setFile(file);
                  }}
                ></SingleImageDropzone>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <GoVideo className="cursor-pointer w-7 h-7 ml-2 fill-cyan-500 hover:fill-cyan-300"></GoVideo>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 opacity-75">
              <DialogTitle>Select Video</DialogTitle>
              <div className="flex justify-center">
                <input
                  type="file"
                  onChange={(e) => {
                    setFile(e.target.files?.[0]);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {imageUrl ? (
            <img
              onClick={() => setFile(undefined)}
              src={imageUrl}
              className="cursor-pointer ml-3 h-10 w-10 hover:border-2 hover:border-red-600"
            ></img>
          ) : null}
        </div>
        <button
          disabled={posting}
          onClick={handlePost}
          className="disabled:border-cyan-600 disabled:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-400 hover:text-cyan-200 p-2 w-fit flex gap-3 items-center self-end px-5 border-2 border-cyan-600 rounded-lg"
        >
          <IoIosSend
            className={`${posting ? "hidden" : ""} fill-cyan-600 mt-[1px]`}
          ></IoIosSend>
          <span className={`${posting ? "italic" : ""} text-cyan-400 text-lg`}>
            {posting ? "Posting" : "Post"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default WhatsOnUserMind;
