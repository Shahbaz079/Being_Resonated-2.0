'use client'
import React from 'react'
import { SignedIn,SignedOut,SignInButton,UserButton } from "@clerk/nextjs";
import { useUser } from '@clerk/nextjs';





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
    <header className="relative top-0 left-[5vw]  right-[8vw] w-[90vw] bg-[#555a4a] h-[8vh] my-4 rounded-full items-center text-white ">
          <div className="absolute top-0 right-[2%] py-[1%] left-[90%] flex justify-between">
          <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton >
                

              </UserButton>
            </SignedIn>
          </div>
           
          </header>
  )
}

export default Header;