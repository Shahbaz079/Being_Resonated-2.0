  "use server";
import { User } from "@/models/User";
import connectDB from "@/config/db";
import { redirect } from "next/navigation";

import {hash} from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";


 

const signGithub=async ()=>{
  
   await signIn("github")
}


const signGoogle=async ()=>{
  
  await signIn("google")
}

const login=async(formData:FormData)=>{
  
  const email=formData.get('email') as string
       
  const password=formData.get('password') as string

  try {
    await signIn("credentials",{
      redirect:false,
      callbackUrl:"/",
      email,
      password
    })

  } catch (error) {
    const someError=error as CredentialsSignin

    return someError.cause
  }

   redirect("/");

}

  const register=async(formData:FormData)=>{
       const firstName=formData.get('firstname') as string
       
       const lastName=formData.get('lastname') as string
       
       const email=formData.get('email') as string
       
       const password=formData.get('password') as string

       const confirmPassword=formData.get('confirmPassword') as string

       
       if(!firstName||!lastName||!email||!password ||!confirmPassword){
          throw new Error("Please Fill all the details")
       }

       await connectDB();
       const existingUser=await User.findOne({email});
       if(existingUser)throw new Error("User Already exists");

       const hashedPassword=await hash(password,10)

       await User.create({firstName,lastName,email,password:hashedPassword});
       
       console.log("user craeted successfully");
       redirect("/")

  }


 

 

  

  export {register,login,signGithub,signGoogle}