
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useEffect,useState

 } from 'react'
 import { UserPostModal } from '../animatedModal/UserPostModal'
const Downbar = () => {
  const {user,isLoaded}=useUser();
  const [mongoId,setMongoId]=useState<string |null>(null);
useEffect(() => {
  if(user){
    setMongoId(user.publicMetadata.mongoId as string)
  }
    
}, [isLoaded,user])
 
  return (
    <div className='fixed  h-[8vh] top-[88vh] left-[20%] right-[20%] rounded-lg bg-[#549dca9a] flex flex-row justify-around items-center' >
      <Link href={`/profile?id=${mongoId}`}>User Profile</Link>
      <UserPostModal/>

      <button className="">Participations</button>

    </div>
  )
}

export default Downbar
