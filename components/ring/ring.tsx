import { useEffect } from "react";

const Ring = () => {

  useEffect(() => { 
    const hoverElements = document.querySelectorAll('.one, .two, .three');
     const targetElement1 = document.querySelector('.cardContainer');
      const targetElements2 = document.querySelectorAll('.cards');
       const onMouseEnter = () => { 
        console.log('Mouse enter'); 
        targetElement1.classList.add('mainAnimation');
         targetElements2.forEach(element => { element.classList.add('cardAnimation'); }); }; 
         
         const onMouseLeave = () => { 
          console.log('Mouse leave');
           targetElement1.classList.remove('mainAnimation'); 
           targetElements2.forEach(element => { element.classList.remove('cardAnimation'); }); };
            // Add event listeners if elements are found 
             if (hoverElements.length && targetElement1 && targetElements2.length) {
               hoverElements.forEach(hoverElement => { hoverElement.addEventListener('mouseenter', onMouseEnter);
                 hoverElement.addEventListener('mouseleave', onMouseLeave); }); } 
                 // Cleanup event listeners on component unmount
                   return () => { hoverElements.forEach(hoverElement => { hoverElement.removeEventListener('mouseenter', onMouseEnter); hoverElement.removeEventListener('mouseleave', onMouseLeave); }); };
  },[])
  return (
    <div className='w-[50vw] absolute right-[10%] left-[50vw] h-[80vh] '>

      <div className="absolute right-[25%] top-[25%] bg-slate-600  w-[55%] h-[75%] rounded-[10000px]">
        <div className="bg-black absolute right-[5%] top-[5%] rounded-full w-[90%] h-[90%]">

          <div className="one bg-slate-600 absolute w-[25%] h-[25%] top-[-15%] left-[38%] rounded-full">P</div>


          <div className="center bg-slate-600 absolute w-[50%] h-[50%] top-[25%] left-[25%] rounded-full">

          </div>

          <div className="two bg-slate-600 absolute w-[25%] h-[25%] top-[65%] left-[-5%] rounded-full">W</div>


           <div className= " three bg-slate-600 absolute w-[25%] h-[25%] top-[65%] right-[-5%] rounded-full">T</div>

        </div>
      </div>
    </div>
  )
}

export default Ring
