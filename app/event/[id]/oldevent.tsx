'use client'

import { redirect, useSearchParams } from "next/navigation";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from "@clerk/nextjs";
import { useState, useEffect, FormEvent } from "react";
import { IUser } from "@/components/expandableCards/card";
import ITeam, { Team } from "@/models/Team";

import Modal from "@/components/Modal/Modal";
import { BiMessageSquareEdit } from "react-icons/bi";
import { useEdgeStore } from "@/lib/edgestore";
import { AnimatedModalDemo } from "@/components/animatedModal/ModalDemo";
import { IEvent } from "@/app/team/[id]/page";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { FaLocationDot } from "react-icons/fa6";
import { VscSymbolEvent } from "react-icons/vsc";
import { SlCalender } from "react-icons/sl";



const EventPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [members, setMembers] = useState<IUser[] | null>([]);
    const [leaders, setLeaders] = useState<IUser[] | null>([]);
    const [image, setImage] = useState('');
    const [createdBy, setCreatedBy] = useState<IUser | null>();
    const [team, setTeam] = useState<ITeam | null>();
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [showMembermodal, setShowMemberModal] = useState(false);
    const [showLeadermodal, setShowLeaderModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [preview, setPreview] = useState<string | null>(null)

    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [event, setEvent] = useState<IEvent | null>(null);
    const [eventId, setEventId] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);

    const [live, setLive] = useState<boolean>(false);



    const { edgestore } = useEdgeStore();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const file = files[0];
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {

        if (file) {

            const res = await edgestore.mypublicImages.upload({
                file,
                onProgressChange: (progress) => {
                    setProgress(progress);
                }
            })



            const response = await fetch(`/api/upload?id=${eventId}&source=event`, {
                method: "POST",
                body: JSON.stringify({ imgUrl: res.url })
            })

            if (response.ok) {
                setUploadStatus("Image uploaded successfully")
                window.location.reload();
            }
        }

    }

    const closeMemberModal = () => {
        setShowMemberModal(false);
    }
    const closeLeaderModal = () => {
        setShowLeaderModal(false);
    }




    const searchParams = useSearchParams();
    const uid = searchParams.get("uid");

    const { user, isLoaded } = useUser();
    const mongoId = user?.publicMetadata.mongoId as string;

    useEffect(() => {

        if (uid !== mongoId) {
            redirect('/');
        }
    }, [isLoaded]);


    useEffect(() => {

        const handleEventData = async () => {
            const res = await fetch(`/api/events?id=${eventId}`);

            if (res.ok) {
                const data = await res.json();
                setName(data.name);
                setDescription(data.description);
                setDate(data.date);
                setImage(data.image);
                setMembers(data.members);
                setLeaders(data.leaders);
                setCreatedBy(data.createdBy);
                setTime(data.time);
                setLocation(data.location);
                setTeam(data.team);
                setLive(data.isLive);
                setEvent(data)
                console.log(data);
            } else {
                toast.error("Failed to fetch event data");
            }
        };
        if (typeof window !== 'undefined') {
            setEventId(window.location.pathname.split('/')[2]);
            console.log(eventId, "eventid")
            if (eventId) {
                handleEventData();
            }

        }

    }, [isLoaded, user, eventId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const res = await fetch(`/api/events?id=${eventId}`, {
            method: "PUT",
            body: JSON.stringify({ name, description, date, time, location, members, leaders })
        })
    }


    return (
        !edit ?
            <div className='w-[90vw] h-auto relative left-[5vw] right-[5vw]'>
                {live ? <div className="absolute top-0 left-0 text-center rounded-lg w-[10%] bg-[#45a57a] px-4 py-2">Live</div> : null}
                <div className="w-[100%] h-[50vh] rounded-lg flex flex-row items-center justify-around  p-4">
                    <div className=" w-[20vw] h-[20vh]">
                        {image ? <img

                            className="w-[30vw] h-[30vh] rounded-lg object-contain"
                            src={image}
                            alt={name}
                        // className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                        /> :
                            <img

                                className="w-[100%] h-[100%] rounded-lg"
                                src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                                alt={"user did'nt provide image"}
                            //  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                            />}
                    </div>

                    <div className="">
                        <h1 className="text-2xl font-bold mb-2">{name}</h1>
                        <p className="text-lg mb-2">{description}</p>
                        <p className="text-lg mb-2">{new Date(date).toLocaleDateString()}</p>
                        <p className="text-lg mb-2">Time: {time}</p>
                        <p className="text-lg mb-2">Location: {location}</p>
                        <h1>Created By:{createdBy?.name}</h1>
                        <h1>Team:{team?.name}</h1>

                    </div>

                    <BiMessageSquareEdit className="absolute top-0   right-[5%] text-4xl" onClick={() => setEdit(!edit)} />
                </div>

                <div className="w-[100%] h-auto flex flex-row items-center "  >

                    <div className="w-[50%] flex flex-row items-center justify-around">

                        <div className="w-[40px] h-[10px] mx-10">
                            <button onClick={() => setShowLeaderModal(true)}>Leaders</button>
                            <Modal isOpen={showLeadermodal} onClose={closeLeaderModal}>
                                {leaders && leaders.length > 0 && leaders?.map((leader) => (
                                    <div key={leader?._id?.toString() || Math.random().toString()}>
                                        <p>{leader.name}</p>
                                    </div>
                                ))}

                            </Modal>
                        </div>

                        <div className="w-[40px] h-[10px] mx-10">
                            <button onClick={() => setShowMemberModal(true)}>Members</button>

                            <Modal isOpen={showMembermodal} onClose={closeMemberModal}>
                                {members && members?.map((member) => (
                                    <div key={member?._id?.toString() || Math.random().toString()}>
                                        <p>{member.name}</p>
                                    </div>
                                ))}

                            </Modal>
                        </div>

                    </div>

                    <AnimatedModalDemo event={event} />

                </div>



            </div> :

            <div className='w-[90vw] h-auto relative left-[5vw] right-[5vw]'>
                <div className="w-[100%] h-[50vh] rounded-lg flex flex-row items-center justify-around  p-4">
                    <div className=" w-[20vw] h-[20vh]">
                        {file ? <div className="absolute top-0 left-[10vw] flex flex-col  h-[50vh] justify-evenly items-center">
                            <img

                                className="w-[30vw] h-[30vh] rounded-lg object-contain object-top"
                                src={preview as string}
                                alt={file.name}
                            // className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                            />

                            <input type="file" onChange={handleFileChange} />
                            <button className="bg-[#515151] px-8 py-2 rounded-lg" onClick={() => handleUpload()}>Upload</button>

                            <div className="border rounded overflow-hidden w-[100%] h-[6px]">
                                <div className="bg-slate-300 h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                            </div>

                            {uploadStatus && <p>{uploadStatus}</p>}
                        </div>

                            :
                            <div className="">
                                <img

                                    className="w-[100%] h-[100%] rounded-lg"
                                    src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                                    alt={"user did'nt provide image"}
                                //  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                                />

                                <input type="file" onChange={handleFileChange} />
                                <button onClick={() => { handleUpload() }}>Upload</button>
                                <div className="border rounded overflow-hidden w-44 h-[6px]">
                                    <div className="bg-slate-300 h-full transition-all duration-150" style={{ width: `${progress}%` }}></div>
                                </div>
                                {uploadStatus && <p>{uploadStatus}</p>}

                            </div>

                        }

                    </div>

                    <div className=" ">
                        <form className="flex flex-col justify-evenly items-left" onSubmit={handleSubmit}>
                            <div className="my-2">
                                <label>Event Name:</label>
                                <input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>

                            <div className="my-2">
                                <div>Team:{team?.name}</div>

                            </div>
                            <div className="my-2"> <label>Date:</label>
                                <input type="date" name="date" value={date}
                                    onChange={(e) => setDate(e.target.value)} required />
                            </div>

                            <div className="my-2">
                                <label>Description:</label> <textarea name="description" value={description}
                                    onChange={(e) => setDescription(e.target.value)} required />
                            </div>
                            <div className="my-2">
                                <label>Location:</label>
                                <input type="text" name="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
                            </div>
                            <div className="my-2">
                                <label>Time:</label>
                                <input type="text" name="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                            </div>
                            <button type="submit">Update Event</button>
                        </form>

                    </div>

                    <BiMessageSquareEdit className="absolute top-0   right-[5%] text-4xl" onClick={() => setEdit(!edit)} />
                </div>

                <div className="my-[5%] w-[100%] h-auto flex flex-row items-center"  >
                    <div className="w-[40px] h-[10px] mx-10">
                        <button onClick={() => setShowLeaderModal(true)}>Leaders</button>
                        <Modal isOpen={showLeadermodal} onClose={closeLeaderModal}>
                            {leaders && leaders.length > 0 && leaders?.map((leader) => (
                                <div key={leader?._id?.toString() || Math.random().toString()}>
                                    <p>{leader.name}</p>
                                </div>
                            ))}

                        </Modal>
                    </div>

                    <div className="w-[40px] h-[10px] mx-10">
                        <button onClick={() => setShowMemberModal(true)}>Members</button>

                        <Modal isOpen={showMembermodal} onClose={closeMemberModal}>
                            {members && members?.map((member) => (
                                <div key={member?._id?.toString() || Math.random().toString()}>
                                    <p>{member.name}</p>
                                </div>
                            ))}

                        </Modal>
                    </div>

                </div>



            </div>


    );
}

export default EventPage;
