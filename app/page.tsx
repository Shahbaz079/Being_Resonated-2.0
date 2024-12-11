import Link from "next/link";
import Profile from "@/components/profile/profile";
const Home = () => {
  
  return (
    <div className='py-4 w-full'>
      <div className="w-[80vw] h-[2%] flex flex-row justify-around mx-[10vw]">
      
        <Link  href="/becommunity" className="shadow-[inset_0_0_0_2px_#616467] text-black px-[5%] py-[2%] rounded-full tracking-widest  font-bold bg-transparent hover:bg-[#616467] hover:text-white  transition duration-200">BeCommunity</Link>
        <Link href="/" className="shadow-[inset_0_0_0_2px_#616467] text-black px-[5%] py-[2%]  rounded-full tracking-widest  font-bold bg-transparent hover:bg-[#616467] hover:text-white  transition duration-200">Home</Link>
        <Link href="/academics" className="shadow-[inset_0_0_0_2px_#616467] text-black px-[5%] py-[2%]  rounded-full tracking-widest  font-bold bg-transparent hover:bg-[#616467] hover:text-white  transition duration-200">Academics</Link>
      </div>

     
    <Profile/>
      


    </div>
  )
}

export default Home;