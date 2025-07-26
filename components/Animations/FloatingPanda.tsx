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
      console.log('Response received:', data)
      setResponse(data.reply || data.error || 'No response received')
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
      {/* Large Screen: Panda Floating Button */}
      <div className="hidden lg:block">
        <motion.div
          className="fixed bottom-6 right-6 z-50 w-24 sm:w-28 md:w-32 cursor-pointer"
          onClick={() => setOpenChat(true)}
          whileHover={{ scale: 1.1 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Lottie animationData={pandaAnimation} loop autoplay />

          {/* Floating Message Bubble */}
          {!openChat && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-20 right-0 bg-white text-gray-800 shadow-lg px-4 py-2 rounded-xl border border-gray-300 text-sm max-w-[200px] whitespace-pre-line"
            >
              💬 Hi! Ask me any doubts you have about this doc!
            </motion.div>
          )}
        </motion.div>
      </div>

            {/* Small Screen: Floating Input Box */}
      <div className="lg:hidden">
        <div className="mx-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-4" style={{ pointerEvents: 'auto' }}>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-500"
                  placeholder="Ask me anything about this document..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim() && !loading) {
                        handleSubmit()
                      }
                    }
                  }}
                />
              </div>
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-600 transition font-semibold disabled:opacity-50 text-sm"
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
              >
                {loading ? '...' : 'Ask'}
              </button>
            </div>
            
            {/* Response display for small screen */}
            {loading && (
              <div className="mt-3 text-blue-500 text-sm animate-pulse">
                Thinking...
              </div>
            )}
            
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 bg-blue-50 p-3 rounded-xl border border-blue-200 shadow text-sm text-blue-900 whitespace-pre-wrap max-h-[200px] overflow-y-auto"
              >
                {response}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Popup - Only for Large Screens */}
      <AnimatePresence>
        {openChat && (
          <motion.div
            className="
            fixed bottom-0 left-0 right-0
          sm:bottom-4 sm:right-4 sm:left-auto
          w-screen sm:w-[70vw] md:w-[38vw]
          h-[90vh] sm:h-[85vh]
          bg-[#0f172a]/90 backdrop-blur-2xl
          shadow-2xl border border-blue-500/20
          rounded-t-3xl sm:rounded-3xl z-50
          flex flex-col overflow-hidden
          transition-all duration-300
            "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-white/30 border-b border-white/20">
              <h3 className="text-lg font-bold text-slate-800">🐼 Panda Assistant</h3>
              <button
                onClick={() => setOpenChat(false)}
                className="text-xl font-bold text-red-500 hover:text-red-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm text-slate-900 bg-white/40 backdrop-blur-sm">
              <div className="bg-white/60 p-3 rounded-xl border border-slate-200 shadow text-sm text-slate-800">
                Hi! I&apos;m your panda assistant. Ask me anything 🧘‍♂️
              </div>

              {loading ? (
                <div className="animate-pulse text-blue-500">Thinking...</div>
              ) : (
                response && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 shadow text-sm text-blue-900 whitespace-pre-wrap">
                    {response}
                  </div>
                )
              )}
            </div>

            {/* Input Section */}
            <div className="p-4 border-t border-white/20 bg-white/30 backdrop-blur-lg space-y-3">
              <textarea
                className="w-full resize-none bg-white p-4 rounded-xl border border-gray-300 text-gray-800 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[90px] max-h-[140px] placeholder:text-gray-500"
                rows={4}
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-600 transition font-semibold disabled:opacity-50"
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
