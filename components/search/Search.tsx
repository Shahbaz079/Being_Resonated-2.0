'use client';


import { useState, useEffect } from 'react';
import Image from 'next/image';

const SearchPage = ({type,click}:{type:string,click:Function | null}) => {
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
    <div className={`absolute  ${type=="user"?"left-[10%]":'left-[110%]'}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users, events, teams"
        className='cphone:w-10'
      />
      <div className='absolute top-[10%] left-[10%] bg-[#555a4a] z-[50] w-[20vw]'>

        <ul>
          {results?.users?.map((user: any) => (
            <div className="w-[80%] h-20 flex flex-row justify-evenly items-center" key={user._id.toString()}>
                            <div className="overflow-hidden w-20 h-20">
                             <Image src={user.image || " "} className=""  width={200} height={200} alt={user.name} />
            
                            </div>
                            <div className="flex flex-col">
                              <div className="">{user.name}</div>
                              <div className="">{user.gradYear}</div>
                            </div>{click && (
                            <button className="" onClick={()=>click(user)}>Add to Team</button>)}
                          </div>
          ))}
        </ul>

        <ul>
          {results?.events?.map((event: any) => (
            <li key={event._id}>{event.name}</li>
          ))}
        </ul>

        <ul>
          {results?.teams?.map((team: any) => (
            <li key={team._id}>{team.name} </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
