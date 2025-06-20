'use client'

import Link from "next/link"
import { useSession, useAuth, useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"





import { motion , AnimatePresence,useScroll,useTransform} from "framer-motion"
import logo from "@/public/images/Being-Resonated logo-2.png"
import Image from "next/image"
import LoadingAnimation from "@/components/loadingAnimation/loadingAnimation"


const slides = [
  {
    img: "/images/img1.jpg",
    title: "BEing Resonated",
    desc: "Students of IIEST, Shibpur can form communities, access academic resources, and participate in events. Sign in with your G-Suite Id.",
  },
  {
    img: "/images/img25.jpg",
    title: "BEcommunity",
    desc: "View posts, like, share, comment, and stay updated about campus events.",
    link: "becommunity",
    linkLabel: "Browse BeCommunity",
  },
  {
    img: "/images/img8.jpg",
    title: "Academics",
    desc: "Browse our collection of academic resources across all departments.",
    link: "academics",
    linkLabel: "Browse Academics",
  },
  {
    img: "/images/img10.jpg",
    title: "Join our Team",
    desc: "Contribute to Being Resonated by joining our team.",
    link: "team/679e59d5809682fc61a8b371?id=679e59d5809682fc61a8b371",
    linkLabel: "Join Team",
  },
  {
    img: "/images/img13.jpg",
    title: "About Us",
    desc: "Get to know our team and contribute to its members.",
    link: "aboutus",
    linkLabel: "About Us",
  },
]

export default function Home() {
  const { isLoaded } = useSession()
  const { userId } = useAuth()
  const { user } = useUser()
  const mongoId = user?.publicMetadata?.mongoId as string

  const [loaderVisible, setLoaderVisible] = useState(true)

  const [isShrunk, setIsShrunk] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => setLoaderVisible(false), 3000)
  return () => clearTimeout(timer)
}, [])



useEffect(() => {
  const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsShrunk(true)
    } else {
      setIsShrunk(false)
    }
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])


  useEffect(() => {
    if (!isLoaded || !userId) return

    const fetchData = async () => {
      if (!mongoId) {
        const grad = Number(user?.primaryEmailAddress?.emailAddress.slice(0, 4)) + 4
        await fetch('/api/retrieve', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user?.username,
            email: user?.primaryEmailAddress?.emailAddress,
            userId,
            image: user?.imageUrl,
            gradYear: grad,
          }),
        })
      }
    }
    fetchData()
  }, [isLoaded, userId, mongoId, user])

  useEffect(() => {
    if (isLoaded && user?.imageUrl) {
      const updateProfileImage = async () => {
        await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.primaryEmailAddress?.emailAddress,
            image: user?.imageUrl,
            name: user?.username,
          }),
        })
      }
      updateProfileImage()
    }
  }, [user?.imageUrl, isLoaded])


  return (
    <div className="relative">
    {loaderVisible && (
  <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black flex flex-col justify-center items-center z-50">
    <motion.h1
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="text-2xl md:text-3xl text-white font-semibold text-center mb-4"
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="block"
      >
       Social. Smart. Supportive. 
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="block"
      >
        The all-in-one platform for IIEST students.
      </motion.span>

      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="block bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent font-extrabold text-3xl md:text-4xl"
      >
        Welcome to BEing Resonated
      </motion.span>
    </motion.h1>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="mt-4 text-white text-lg"
    >
      <LoadingAnimation/>
    </motion.div>
  </div>
)}


  

      <div
  className="fixed inset-0 z-0 bg-cover blur-xl  bg-center"
  style={{ backgroundImage: 'url(/images/campus-pic-1.png)',
   filter: 'brightness(0.5)' // dims to 50% brightness,
   }}  
/>
<div
  className="fixed inset-0 z-15 bg-contain bg-no-repeat bg-center"
  style={{ backgroundImage: 'url(/images/campus-pic-1.png)' }}  
/>




      <div className="overflow-hidden">
        {/* Navbar */}
 {/* Navbar */}
  <header  className={`fixed z-30 border-b px-4 py-2 bg-transparent backdrop-blur-sm transition-all duration-500 ease-in-out
    ${isShrunk ? 'top-0 left-0 right-0' : 'top-2 left-2 right-2'} rounded-lg`} 
    style={{
  backgroundImage: 'linear-gradient(120deg, rgba(1,1,15,0.4), rgba(1,1,15,0.4))',}}>
    <div className="max-w-7xl mx-auto px-6 flex justify-between items-center ">
      <div className="flex items-center  gap-3 group">
        <Image
          src={logo}
          alt="logo"
          className={`transition-all duration-300 ${isShrunk ? "w-8 h-8" : "w-12 h-12"} rounded-full shadow-md group-hover:scale-110`}
        />
        <span className="text-orange-400 font-extrabold text-xl group-hover:tracking-widest transition-all duration-300">BEing Resonated</span>
      </div>
      <nav className="hidden md:flex gap-8 text-white font-medium">
        {[
          { href: `/becommunity?id=${mongoId}`, label: "BeCommunity" },
          { href: `/academics`, label: "Academics" }
        ].map((item, idx) => (
          <div key={idx} className="relative flex flex-col items-center group cursor-pointer">
            <Link href={item.href} className="transition-transform duration-300 group-hover:scale-105">
              {item.label}
            </Link>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-cyan-300 transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
          </div>
        ))}
      </nav>
    </div>
  </header>

  {/* Hero section */}
<section className=" w-[100vw] h-[100vh]  px-6 pb-10 z-30">
  <div
    className=" backdrop-blur-lg border border-white/20 rounded-lg p-4 md:p-6 shadow-lg 
               w-full max-w-3xl relative top-[70vh]
               hover:bg-white/10 transition flex flex-col md:flex-row md:items-center md:justify-between"
    style={{ backgroundImage: 'linear-gradient(120deg, rgba(1,1,15,0.4), rgba(1,1,15,0.4))', }}
  >
    <div className="flex flex-col md:flex-row md:items-center md:gap-6 w-full md:w-auto">
      <div className="flex flex-col">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-2xl md:text-4xl font-extrabold text-orange-400"
        >
          BEing Resonated
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-base md:text-xl mt-1 md:mt-0"
        >
          <AnimatedOneLiner />
        </motion.div>
      </div>

      <div className="flex gap-2 mt-3 md:mt-0 ml-auto md:ml-0">
        {[ 
          { href: `/becommunity?id=${mongoId}`, label: "BeCommunity" },
          { href: `/academics`, label: "Academics" }
        ].map((btn, idx) => (
          <motion.a
            key={idx}
            href={btn.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + idx * 0.2, duration: 1 }}
            whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(255,165,0,0.6)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-yellow-400 text-black font-semibold py-2 px-4 rounded-full shadow-lg backdrop-blur-md border border-white/20 transition text-sm md:text-base"
          >
            {btn.label}
          </motion.a>
        ))}
      </div>
    </div>
  </div>
</section>


  {/* Content / Slider */}
  <div className="relative z-10">
    <SliderSection mongoId={mongoId} />
  </div>
        


  

        
     
      </div>
    </div>
  )
}


const AnimatedOneLiner=()=> {
  const lines = [
    "Where Connections Shape Futures",
    "Empowering Students Through Community & AI",
    "Smarter. Stronger. Together."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % lines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-12">
      <AnimatePresence mode="wait">
        <motion.span
          key={lines[index]}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="absolute w-full text-center"
        >
          {lines[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}




const SliderSection=({
 
  mongoId
}: {
 
  mongoId: string
}) =>{
 

  return (
    <>


 

      <section className="relative z-50 min-h-[50vh] p-10 rounded-xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              
              className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden shadow-lg cursor-pointer transition"
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-48 object-cover opacity-70"
              />
              <div className="absolute bottom-0 p-4 text-white">
                <h2 className="text-xl font-bold">{slide.title}</h2>
                <p className="text-sm">{slide.desc}</p>
                {slide.link && (
                  <Link
                    href={
                      slide.link.includes("becommunity")
                        ? `/${slide.link}?id=${mongoId}`
                        : `/${slide.link}`
                    }
                    className="inline-block mt-2 text-cyan-300 underline"
                  >
                    {slide.linkLabel}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
   

    </>
  )
}