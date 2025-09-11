
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { UserPostModal } from '../animatedModal/UserPostModal'
import { User, Award } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const Downbar = () => {
  const { user, loading } = useAuth();
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("")

  useEffect(() => {
    if (user) {
      setMongoId(user._id as string)
      setUserName(user.name)
    }
  }, [loading, user])

  return (
    <div className='fixed h-[8vh] top-auto bottom-0 left-[20%] right-[20%] rounded-lg 
      bg-gradient-to-r from-gray-900 via-gray-800 to-black 
      flex flex-row justify-around items-center'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/profile?id=${mongoId}`}>
              <button className="bg-gray-800 border border-cyan-600 rounded-md px-2 py-1">
                <User className="w-6 h-6 text-cyan-200 hover:text-cyan-100 transition-colors" />
              </button>
            </Link>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 border-cyan-600 text-cyan-100">
            <p>View Profile</p>
          </TooltipContent>
        </Tooltip>

        {/* <UserPostModal name={userName} /> */}

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="bg-gray-800 border border-cyan-600 rounded-md px-2 py-1">
              <Award className="w-6 h-6 text-cyan-200 hover:text-cyan-100 transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-gray-800 border-cyan-600 text-cyan-100">
            <p>My Participations</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default Downbar
