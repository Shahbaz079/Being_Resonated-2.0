'use client';

import { useState, useEffect } from 'react';

const SearchPage = () => {
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
        const res = await fetch(`/api/search?q=${debouncedSearchTerm}`);
        const data = await res.json();
        setResults(data);
      } else {
        setResults({ users: [], events: [], teams: [] });
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  return (
    <div className='absolute  left-[110%]'>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users, events, teams"
      />
      <div className='fixed top-[12%] left-[60%] bg-[#555a4a] z-[50]'>
        
        <ul>
          {results.users.map((user: any) => (
            <li key={user._id}>{user.name} ({user.email})</li>
          ))}
        </ul>
       
        <ul>
          {results.events.map((event: any) => (
            <li key={event._id}>{event.name}</li>
          ))}
        </ul>
      
        <ul>
          {results.teams.map((team: any) => (
            <li key={team._id}>{team.name} </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SearchPage;
