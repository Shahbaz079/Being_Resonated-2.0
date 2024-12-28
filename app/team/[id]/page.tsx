'use client'
import { useState } from "react";

const TeamPage = () => {
  const [userData,setUserData]=useState(null);
  const [teamData,setTeamData]=useState(null);

  
  const currentu=localStorage.getItem('currentUser');
  const currentT=localStorage.getItem('teams');
console.log("users",currentu)
console.log("teams",currentT)
  if(currentu && currentT){
    const currentUser = JSON.parse(currentu);
    const currentTeams = JSON.parse(currentT);
    setUserData(currentUser)
    setTeamData(currentTeams)
  }

  console.log("localUser",userData)
  console.log("lacalTeam",teamData)

  return (
    <div>
      Hii
    </div>
  )
}

export default TeamPage
