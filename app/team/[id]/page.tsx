'use client'
import { useState } from "react";

const page = () => {
  const [userData,setUserData]=useState(null);
  const [teamData,setTeamData]=useState(null);

  
  const currentu=localStorage.getItem('currentUser');
  const currentT=localStorage.getItem('teams');

  if(currentu && currentT){
    const currentUser = JSON.parse(currentu);
    const currentTeams = JSON.parse(currentT);
    setUserData(currentUser)
    setTeamData(currentTeams)
  }

  return (
    <div>
      {userData} && {teamData}
    </div>
  )
}

export default page
