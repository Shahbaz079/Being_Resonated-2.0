'use client';


import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IUser } from '../expandableCards/card';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import Link from 'next/link';
import "./search.css"


type ClickType = (user: IUser) => void;

interface SearchPageProps {
  type: string; click: ClickType | null;
}

const SearchPage = ({ type, click }: SearchPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any>({ users: [], events: [], teams: [] });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearchTerm) {

        const res = await fetch(`/api/search?q=${debouncedSearchTerm}&type=${type}`);
        const data = await res.json();
        setResults(data);
      } else {
        setResults({ users: [], events: [], teams: [] });
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  return (
    <div className='relative'>
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onBlur={() => setSearchTerm("")}
        placeholder="Search users, events, teams"
        className='h-12'
      />
      <div className='absolute spglass z-[50] w-[500px] max-h-[500px] ctab:w-[400px] cphone:w-[100vw] cphone:fixed cphone:left-0 mt-2 overflow-y-scroll scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-transparent'>

        <ul className='flex flex-col'>
          {results?.users?.map((user: any) => (
            <div
              key={`card-${user.name}-${user._id}`}
              className="gap-10 p-4 flex w-full hover:bg-gray-700 md:flex-row justify-between items-center rounded-xl cursor-pointer"
            >
              <div className="flex gap-4">
                <div>
                  {user.image ?
                    <img
                      src={user.image}
                      alt={user.name}
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
                    {user.name}
                  </h3>

                  <p className="text-cyan-600">
                    {user.gradYear}
                  </p>
                </div>
              </div>

              <Link href={`/profile?id=${user._id}`} className="border-2 w-fit self-end border-cyan-700 px-3 py-1 rounded-lg">
                View
              </Link>
            </div>
          ))}
        </ul >

        <ul className='flex flex-col'>
          {results?.events?.map((event: any) => (

            <div key={event._id.toString()} className="p-4 flex justify-between cphone:text-sm items-center hover:bg-slate-700 rounded-xl cursor-pointer">
              <div className="flex gap-4">
                <div>
                  {event.image ? <img
                    width={100}
                    height={100}
                    className='w-12 h-12 rounded-full'
                    src={event.image}
                    alt={event.name}
                  /> :
                    <img
                      width={100}
                      height={100}
                      className='w-12 h-12 rounded-full'
                      src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                      alt={"event didn't provide image"}
                    />}
                </div>
                <div className="">
                  <h3 className="font-medium text-cyan-200 text-center">
                    {event.name}
                  </h3>
                </div>
              </div>
              <Link
                href="to be filled"
                className="text-center border-2 w-fit self-end border-cyan-700 px-3 py-1 rounded-lg"
              >
                View Event
              </Link>
            </div>
          ))}
        </ul>

        <ul className='flex flex-col'>
          {results?.teams?.map((team: any) => (
            <div className="p-4 flex justify-between items-center hover:bg-slate-700 rounded-xl cursor-pointer" key={team._id.toString()}>
              <div className="flex gap-4">
                <div>
                  {team.timage ? <Image
                    width={100}
                    height={100}
                    className='w-12 h-12 rounded-full'
                    src={team.timage}
                    alt={team.name}
                  /> :
                    <img
                      width={100}
                      height={100}
                      className='w-12 h-12 rounded-full'
                      src={'https://plus.unsplash.com/premium_vector-1683141200177-9575262876f7?q=80&w=1800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                      alt={"team didn't provide image"}
                    />}
                </div>
                <div className="">
                  <h3 className="font-medium text-cyan-200 text-center md:text-left">
                    {team.name}
                  </h3>
                </div>
              </div>
              <Link
                href={`/team/${team._id}?id=${team._id}`}
                className="text-center border-2 w-fit self-end border-cyan-700 px-3 py-1 rounded-lg"
              >
                View Team
              </Link>
            </div>
          ))}
        </ul>
      </div >
    </div >
  );
};

export default SearchPage;

{/* <div className="w-[80%] h-20 flex flex-row justify-evenly items-center" key={user._id.toString()}>
  <div className="overflow-hidden w-20 h-20">
    <Image src={user.image || " "} className="" width={200} height={200} alt={user.name} />

  </div>
  <div className="flex flex-col">
    <div className="">{user.name}</div>
    <div className="">{user.gradYear}</div>
  </div>{click && (
    <button className="" onClick={() => click(user)}>Add to Team</button>)}
</div> */}

{/* <li key={event._id}>{event.name}</li> */ }

{/* <li key={team._id}>{team.name} </li> */ }