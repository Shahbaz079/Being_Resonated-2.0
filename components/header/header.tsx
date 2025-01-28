'use client'
import React from 'react'
import { SignedIn,SignedOut,SignInButton,UserButton } from "@clerk/nextjs";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';





const DotIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" />
    </svg>
  )
}


const Header = () => {
  

  const {user}=useUser();

const mongoId=user?.publicMetadata.mongoId as string
console.log(mongoId)
  return (
    <header className="absolute top-0 right-[4%] my-4 rounded-full items-center text-white flex flex-row justify-between ">
      <div className="mx-10">
        
      </div>
          <div className="absolute top-0 right-[2%] py-[1%] left-[90%] flex justify-between">
          <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton  />
             </SignedIn>
          </div>
           
          </header>
  )
}

export default Header;