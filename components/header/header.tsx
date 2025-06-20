'use client'
import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';








const Header = () => {


  return (
    <header className="fixed top-0 right-[4%] my-4 rounded-full items-center text-white flex flex-row justify-between z-[300]">
      
      <div className="">
       <SignedOut>
  <div className="bg-orange-400 hover:bg-orange-500 text-black font-semibold py-2 px-4 rounded-full text-lg">
    <SignInButton />
  </div>
</SignedOut>

<SignedIn>
  <UserButton 
    appearance={{
      elements: {
        userButtonAvatarBox: "w-10 h-10"  // default is ~32px, so this makes it ~48px
      }
    }}
  />
</SignedIn>

      </div>

    </header>
  )
}

export default Header;