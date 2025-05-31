'use client'

import { extractTextFromBase64 } from "@/lib/pdfParser";
import Lottie from 'lottie-react'
import pandaAnimation from "@/public/lottie-animations/Animation - 1748338496917.json"
import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"

export default function MeditatingPanda({ fileId }: { fileId: string }) {
  const [openChat, setOpenChat] = useState(false)
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setResponse('')
    try {
      const response = await fetch(`/api/getdoc?fileId=${fileId}`)
      const { base64 } = await response.json()
      const text = await extractTextFromBase64(base64)

      const res = await fetch("/api/generate", {
        method: 'POST',
        body: JSON.stringify({ prompt: input, document: text }),
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()
      setResponse(data.reply || data.error)
    } catch (error) {
      console.error(error)
      setResponse("Something went wrong.")
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <>
      {/* Panda Button */}
      <motion.div
        className="fixed bottom-6 right-6 w-28 sm:w-32 md:w-36 z-50 cursor-pointer"
        onClick={() => setOpenChat(true)}
        whileHover={{ scale: 1.1 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Lottie animationData={pandaAnimation} loop autoplay />
      </motion.div>

      {/* Chat Popup */}
      <AnimatePresence>
        {openChat && (
          <motion.div
            className="fixed bottom-[18vh] right-4 sm:right-10 w-[90vw] sm:w-[70vw] md:w-[30vw] h-[75vh] sm:h-96 bg-white/30 backdrop-blur-md shadow-xl rounded-3xl p-4 z-50 border border-gray-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-xl text-gray-800">🐼 AI Assistant</h3>
              <button
                onClick={() => setOpenChat(false)}
                className="text-lg text-gray-500 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            <div className="h-[70%] overflow-y-auto rounded-md p-3 text-gray-800 bg-white/70 border border-gray-200 shadow-inner space-y-3 text-sm">
              <p>Hi! I’m your panda assistant. Ask me anything 🧘‍♂️</p>
              {loading ? (
                <div className="animate-pulse text-blue-500">Thinking...</div>
              ) : (
                response && <p className="whitespace-pre-line">{response}</p>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <textarea
                className="w-full text-gray-800 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm bg-white"
                rows={3}
                placeholder="Ask..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow hover:from-blue-600 hover:to-indigo-600 transition font-medium"
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
