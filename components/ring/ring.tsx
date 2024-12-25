import { useEffect,useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { LogOutButton } from "../LogoutButton";



const Ring = () => {

  useEffect(() => { 
    const hoverElements = document.querySelector('.one') as HTMLElement;
     const targetElement1 = document.querySelector('.cardContainer') as HTMLElement;
      const targetElements2 = document.querySelectorAll('.cards');
       const onMouseEnter = () => { 
         
        targetElement1.classList.add('mainAnimation');
         targetElements2.forEach(element => { element.classList.add('cardAnimation'); }); }; 
         
         const onMouseLeave = () => { 
          
           targetElement1.classList.remove('mainAnimation'); 
           targetElements2.forEach(element => { element.classList.remove('cardAnimation'); }); };
            // Add event listeners if elements are found 
             if (hoverElements && targetElement1 && targetElements2.length) {
                hoverElements.addEventListener('mouseenter', onMouseEnter);
                 hoverElements.addEventListener('mouseleave', onMouseLeave); } 
                 // Cleanup event listeners on component unmount
                   return () => {
                     hoverElements.removeEventListener('mouseenter', onMouseEnter); hoverElements.removeEventListener('mouseleave', onMouseLeave); ; };
  },[])

const [peakPosition,setPeakPosition]=useState("pCard");

const changePosition=(cardname :string):void=>{

const targetCard=document.querySelector(`.${cardname}`) as HTMLElement;
const initialPeak=document.querySelector(`.${peakPosition}`) as HTMLElement;
if(targetCard){
  const computedStyle=getComputedStyle(targetCard);
  const computedStyleZ=getComputedStyle(initialPeak);

  const currentZ = computedStyle.getPropertyValue('z-index');
  const initialZ=computedStyleZ.getPropertyValue('z-index');

  
  const currentPosition=computedStyle.getPropertyValue('--position');
  setPeakPosition(`${cardname}`)

  targetCard.style.setProperty('--position','3');
  targetCard.style.setProperty('z-index',`${initialZ}`);
  
  initialPeak.style.setProperty('--position',`${currentPosition}`)
  initialPeak.style.setProperty('z-index',`${currentZ}`);



  
}

}
; 



  return (
    <div className='w-[50vw] absolute right-[10%] left-[50vw] h-[80vh] '>

      <div className="one absolute right-[25%] top-[20%] bg-slate-600  w-[60%] h-[90%] rounded-[10px]">

        <button onClick={()=>changePosition("pCard")} className="w-[90%] h-[10%] bg-cyan-300 rounded-[50px]  m-4 text-center py-2">Personal Details</button>
        <button onClick={()=>changePosition("tCard")}  className="w-[90%] h-[10%] bg-cyan-300 rounded-[50px]  m-4 text-center py-2">Teams</button>
        <button onClick={()=>changePosition("wCard")}  className="w-[90%] h-[10%] bg-cyan-300 rounded-[50px]  m-4 text-center py-2">Assigned Works</button>
      {/*
      <LogOutButton/>
      */}
        
      </div>
    </div>
  )
}

export default Ring
