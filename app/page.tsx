'use client'

import Link from "next/link";

import { useSession } from "@clerk/nextjs";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import "./page.styles.css";

const imageArray = ["/images/img1.jpg", "/images/img2.jpg", "/images/img3.jpg", "/images/img4.jpg", "/images/img5.jpg",]

const Home = () => {

  const { isLoaded } = useSession();
  const { userId } = useAuth();
  const { user } = useUser();
  const [animationOver, setAnimationOver] = useState<boolean>(false);

  //console.log(sessionId,getToken)
  const [mongoId, setMongoId] = useState(user?.publicMetadata?.mongoId as string)
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);

  useEffect(() => {
    const visited = localStorage.getItem('hasVisited');
    if (visited) {
      setIsFirstVisit(false);
    } else {
      localStorage.setItem('hasVisited', 'true');
      setIsFirstVisit(true);
    }
  }, []);

  useEffect(() => {
    setMongoId(user?.publicMetadata?.mongoId as string)
  }, [isLoaded, userId, user])

  useEffect(() => {
    const newInterval = setInterval(() => {
      setAnimationOver(true);
    }, 7500);

    return () => {
      clearInterval(newInterval);
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return 
    }
    const fetchData = async () => {

      if (userId) {
        try {
          if(!mongoId){
          const result = await fetch('/api/createuser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: user?.username,
              email: user?.primaryEmailAddress?.emailAddress,
              gradYear:user?.primaryEmailAddress?.emailAddress.slice(0,4),

            })
          }); 
          if (result.ok) {

            toast.success('User created successfully');
            console.log("Done")
          } else if (result.status === 400) {
            const res = await fetch('/api/retrieve', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: user?.username,
                email: user?.primaryEmailAddress?.emailAddress,
                userId: userId,
                image: user?.imageUrl,
                gradYear:user?.primaryEmailAddress?.emailAddress.slice(0,4),

              })
            });

            if (res.ok) {

              console.log('User retrieved successfully');
            }
          }
        }
        

    
        } catch (error) {

          console.error('Error:', error);
        }
      }
    };
    if (mongoId == null || mongoId === '' || mongoId === undefined) {
      fetchData();
    }

  }, [isLoaded, userId, mongoId, user]);

  useEffect(() => {
    if (isLoaded && user?.imageUrl) {
      // Function to be triggered when profileImageUrl changes
      const handleProfileImageChange = () => {
        // Add your additional logic here 

        const fetchData = async () => {
          try {
            const result = await fetch('/api/user', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user?.primaryEmailAddress?.emailAddress,
                image: user?.imageUrl,

              })
            });
            if (result.ok) {


              console.log("Done")
            }
            else {
              console.error('Error:', result);
            }
          } catch (error) {

            console.error('Error:', error);
          }
        }
        fetchData();
      };


      handleProfileImageChange();

    }
  }, [user?.imageUrl, isLoaded]);

  return (
    <div className="relative h-screen w-full">

      {(isFirstVisit && !animationOver) ? <div className="absolute banner before: h-full w-full z-[200] bg-black banner flex items-center justify-center">
        <div className="content">
          <p className="font-bold text-xl mb-5">LOGO</p>
          <h1 className="font-bold text-6xl">BEing</h1>
          <h1 className="font-bold text-6xl">Resonated</h1>
        </div>
      </div> : null}



      <header>
        <div className="logo text-xl text-red-950 font-extrabold">LOGO</div>
        <ul className="menu text-xl ctab:text-sm text-cyan-100" >
          <li className="font-semibold  p-1 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-50">
            <Link href={`/becommunity?id=${mongoId}`}>BeCommunity</Link>
          </li>
          <li className="font-semibold p-1 rounded-xl cursor-pointer hover:scale-105 transition-transform duration-50">
            <Link href="/academics">Academics</Link>
          </li>
        </ul>
      </header>



      {(!isFirstVisit || animationOver) ? <SliderComponent mongoId={mongoId}></SliderComponent> : null}

    </div>
  )
}

const SliderComponent = ({ mongoId }: { mongoId: string }) => {
  const [itemActive, setItemActive] = useState<number>(0);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const itemsLength = 5;

  useEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    const newInterval = setInterval(() => {
      onNextClick()
    }, 5000);

    setRefreshInterval(newInterval);

    return () => {
      clearInterval(newInterval);
    };
  }, [itemActive]);

  const onNextClick = () => {
    setItemActive((prev) => (prev + 1) % itemsLength);
  }

  const onPrevClick = function () {
    setItemActive((prev) => (prev - 1 + itemsLength) % itemsLength);
  }

  useEffect(() => {
    const thumbnailActive = document.querySelector('.thumbnail .item.active');
    if (thumbnailActive) {
      const rect = thumbnailActive.getBoundingClientRect();
      if (rect.left < 0 || rect.right > window.innerWidth) {
        thumbnailActive.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
      }
    }
  }, [itemActive]);

  return (
    <div className="slider">
      <div className="list">
        <div className={`item ${itemActive === 0 ? 'active' : ''}`} >
          <img src="/images/img1.jpg" width={"3000px"} />
          <div className="content rounded-xl p-4 glass">
            <h2 className="leading-none text-orange-500 font-semibold">BEing Resonated</h2>
            <p>
              An application where students of BE College can form communities, access academic resources, and participate in events by creating teams.
            </p>
          </div>
        </div>
        <div className={`item ${itemActive === 1 ? 'active' : ''}`} >
          <img src="/images/img25.jpg" width={"3000px"} />
          <div className="content rounded-xl p-4 glass">
            <h2 className="leading-1 text-orange-500 font-semibold">BEcommunity</h2>
            <p className="mb-5">
              A community where members can view posts from other users, like, share, and comment on them, as well as receive notifications about events occurring on campus.
            </p>
            <Link href={`/becommunity?id=${mongoId}`} className="ml-[-3px] text-lg border-4 px-2 py-1 text-cyan-100 hover:bg-gray-500">Browse BeCommunity</Link>
          </div>
        </div>
        <div className={`item ${itemActive === 2 ? 'active' : ''}`} >
          <img src="/images/img8.jpg" width={"3000px"} />
          <div className="content rounded-xl p-4 glass w-fit">
            <h2 className="leading-1 text-orange-500 font-semibold">Academics</h2>
            <p className="mb-5">
              Browse our extensive collection of academic resources across all departments and semesters.
            </p>
            <Link href="/academics" className="ml-[-3px] text-lg border-4 px-2 py-1 text-cyan-100 hover:bg-gray-500">Browse Academics</Link>
          </div>
        </div>

        <div className={`item ${itemActive === 3 ? 'active' : ''}`} >
          <img src="/images/img10.jpg" width={"3000px"} />
          <div className="content rounded-xl p-4 glass">
            <h2 className="leading-none text-orange-500 font-semibold">Join our Team</h2>
            <p className="mb-5">
              Contribute to Being Resonated by joining our team.
            </p>
            <Link href={`/team/678ed41edc8b11d686d71c64?id=678ed41edc8b11d686d71c64`} className="ml-[-3px] text-lg border-4 px-2 py-1 text-cyan-100 hover:bg-gray-500">Join Team</Link>
          </div>
        </div>

        <div className={`item ${itemActive === 4 ? 'active' : ''}`} >
          <img src="/images/img13.jpg" width={"3000px"} />
          <div className="content glass rounded-xl p-4">
            <h2 className="leading-1 text-orange-500 font-semibold">About Us</h2>
            <p className="mb-5">
              Get to know our team and contribute to its members.
            </p>
            <Link href="/aboutus" className="ml-[-3px] text-lg border-4 px-2 py-1 text-cyan-100 hover:bg-gray-500">About Us</Link>
          </div>
        </div>

      </div>


      <div className="arrows">
        <button id="prev" className="mr-1" onClick={onPrevClick}>{'<'}</button>
        <button id="next" onClick={onNextClick}>{'>'}</button>
      </div>

      <div className="thumbnail">

        <div onClick={() => setItemActive(0)} className={`cursor-pointer item ${itemActive === 0 ? "active" : ""}`}>
          <img src="/images/img1.jpg" />
        </div>

        <div onClick={() => setItemActive(1)} className={`cursor-pointer item ${itemActive === 1 ? "active" : ""}`}>
          <img src="/images/img25.jpg" />
        </div>

        <div onClick={() => setItemActive(2)} className={`cursor-pointer item ${itemActive === 2 ? "active" : ""}`}>
          <img src="/images/img8.jpg" />
        </div>

        <div onClick={() => setItemActive(3)} className={`cursor-pointer item ${itemActive === 3 ? "active" : ""}`}>
          <img src="/images/img10.jpg" />
        </div>

        <div onClick={() => setItemActive(4)} className={`cursor-pointer item ${itemActive === 4 ? "active" : ""}`}>
          <img src="/images/img13.jpg" />
        </div>
      </div>
    </div>

  )
}

export default Home;