 { /* "use server";
import { User } from "@/models/User";
import connectDB from "@/config/db";
import { redirect } from "next/navigation";

import {hash} from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import mongoose, { Schema,connect } from "mongoose";


 

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




const register = async (formData: FormData) => {
   const name = formData.get('name') as string; 
   const email = formData.get('email') as string;
   
   const password = formData.get('password') as string; 
   const confirmPassword = formData.get('confirmPassword') as string;
   
   if (!name || !email || !password || !confirmPassword) { 
    throw new Error("Please fill all the details"); 
  } 
  
  try { await connectDB();
     console.log('Connected to MongoDB'); 
    } catch (error) { 
      console.error('Error connecting to MongoDB:', error); 
      throw new Error("Database connection failed"); 
    } 
    
    try { 
      const existingUser = await User.findOne({ email }); 
      if (existingUser) throw new Error("User already exists"); 
      
      const hashedPassword = await hash(password, 10); 
      
      const newUser = await User.create({ name, email, password: hashedPassword });
      
      console.log("User created successfully:", newUser);
      
      redirect("/");
    
    } catch (error) { 
      
      console.error('Error during registration:', error);
      
      throw new Error("Registration failed");
        }
  }           */}

{ /*
  const people = async (id: string
  ): Promise<any[]> => { 
    await connectDB(); 
    const existingUser = await User.findById(id);
     if (!existingUser) { 
      throw new Error('User not found'); } 
      const referenceArray = existingUser.interests;
       const users = await User.find({}); 
       const matchCount = (arr: string[]) => arr.filter(element => referenceArray.includes(element)).length;
       const sortedUsers= users.sort((a, b) => matchCount(b.interests) - matchCount(a.interests));

       const plainUsers = sortedUsers.map(user => {
         const plainUser = user.toObject();
          plainUser._id = plainUser._id.toString();
           plainUser.teams = plainUser.teams?.map((teamId: mongoose.Types.ObjectId) => teamId.toString()); 
           plainUser.assignedWorks = plainUser.assignedWorks?.map((work: any) => ({ ...work, team: work.team.toString() }));
           return plainUser; });


      return plainUsers;
      }
     

      const currentPerson = async (id: string
      ): Promise<any> => { 
        await connectDB(); 
        const existingUser = await User.findById(id);
         if (!existingUser) { 
          throw new Error('User not found'); } 
          
           
             const plainUser = existingUser.toObject();
              plainUser._id = plainUser._id.toString();
               plainUser.teams = plainUser.teams?.map((teamId: mongoose.Types.ObjectId) => teamId.toString()); plainUser.assignedWorks = plainUser.assignedWorks?.map((work: any) => ({ ...work, team: work.team.toString() }));
               
    
    
          return plainUser;
       
         

 

 

  

  

 

   import { redirect } from 'next/navigation';



   const signGithub = async () => {
    try {
      const response = await fetch('/api/auth/github', { method: 'POST' });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error signing in with GitHub:', error);
    }
  };
  
  const signGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google', { method: 'POST' });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };
  
  const login = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log('Logged in successfully');
        redirect('/');
      } else {
        console.error('Error logging in:', result.message);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };
  
  const register = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
  
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword })
      });
  
      const result = await response.json();
      if (response.ok) {
        console.log('Registered successfully');
        redirect('/');
      } else {
        console.error('Error registering:', result.message);
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };
  
  export {register,login,signGithub,signGoogle} ;  */  }