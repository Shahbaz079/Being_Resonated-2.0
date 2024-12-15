import React from 'react'

const Ring = () => {
  return (
    <div className='w-[50vw] absolute right-[10%] left-[50vw] h-[80vh] '>

      <div className="absolute right-[25%] top-[25%] bg-slate-600  w-[55%] h-[75%] rounded-[10000px]">
        <div className="bg-black absolute right-[5%] top-[5%] rounded-full w-[90%] h-[90%]">

          <div className="one bg-slate-600 absolute w-[25%] h-[25%] top-[-15%] left-[38%] rounded-full"></div>


          <div className="center bg-slate-600 absolute w-[50%] h-[50%] top-[25%] left-[25%] rounded-full">

          </div>

          <div className="two bg-slate-600 absolute w-[25%] h-[25%] top-[65%] left-[-5%] rounded-full"></div>


           <div className= " three bg-slate-600 absolute w-[25%] h-[25%] top-[65%] right-[-5%] rounded-full"></div>

        </div>
      </div>
    </div>
  )
}

export default Ring
