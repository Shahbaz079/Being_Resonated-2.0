// components/MeditatingPanda.tsx
'use client'

import Lottie from 'lottie-react'
import pandaAnimation from "@/public/lottie-animations/Animation - 1748338496917.json"
import { useState } from 'react'


export default function MeditatingPanda({fileId}: { fileId: string }) {
  const [openChat, setOpenChat] = useState(false)
   const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
const [loading, setLoading] = useState(false);

  const handleSubmit=async()=> {
    setLoading(true);
    setResponse('');
    try {
    //  const docText=await extractTextFromPdfDriveFile(fileId)

      const res = await fetch("/api/generate", {
      method: 'POST',
      body: JSON.stringify({ prompt: input , fileId}),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    setResponse(data.reply || data.error);
  
      
    } catch (error) {
      console.error(error);
      setResponse("Something went wrong.");
    }finally{
      setLoading(false);
      setInput('');
    }

  }
    
  


  return (
    <>
      {/* Panda Button in Corner */}
      <div
        className="fixed bottom-8 right-8 w-36 cursor-pointer z-50"
        onClick={() => setOpenChat(true)}
      >
        <Lottie animationData={pandaAnimation} loop autoplay />
      </div>

      {/* Chatbot Popup */}
      {openChat && (
        <div className="fixed bottom-[20vh] right-10 w-[30vw] h-96 bg-white shadow-lg rounded-xl p-4 z-50 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">🐼 AI Assistant</h3>
            <button onClick={() => setOpenChat(false)} className="text-sm text-gray-500 hover:text-red-500">✕</button>
          </div>
          <div className="h-[80%] overflow-y-auto border rounded-md p-2 text-sm text-gray-700 bg-gray-50">
            <p className="mb-2">Hi! I’m your panda assistant. Ask me anything 🧘‍♂️</p>
            <p className="mb-2">{response}</p>
            {/* You can expand this into a chat UI later */}
            <textarea
        className="w-full text-white p-2 border rounded"
        rows={4}
        placeholder="Ask Mistral..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSubmit}
      >
        Generate
      </button>
          </div>
          
        </div>
      )}
    </>
  )
}
