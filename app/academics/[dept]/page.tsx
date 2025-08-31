"use client";


import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Type definitions
interface DocumentData {
  fileId: string;
  title: string;
}

interface PYQData {
  sem: string;
  exam: string;
  year: string;
}

type PYQGroup = [PYQData, ...DocumentData[]];

import MeditatingPanda from "@/components/Animations/FloatingPanda";
import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";

// Google Drive Embed URL
const getEmbedUrl = (fileId: string) =>
  `https://drive.google.com/file/d/${fileId}/preview`;

const DocumentPage = () => {
  const { dept } = useParams();
  const params = useSearchParams();
  const sem = params.get("sem");
  const exam = params.get("ex");
  const { user } = useUser();
  
  // Array of authorized admin mongoIds
  const ADMIN_MONGO_IDS = [
    "679e8f524c04113c6bc5828e","68a5d5e9981205f073851fdf" , "68a5d5f3981205f073851fe0" , "68a5d60a411910aee8d05a64"
    // Add more admin mongoIds here as needed
  ];
  
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const queryClient = useQueryClient();
  
  // Check if user is an admin by checking if their mongoId is in the admin array
  const kernel = Boolean(
    user?.publicMetadata?.mongoId && 
    ADMIN_MONGO_IDS.includes(user.publicMetadata.mongoId as string)
  );

  // Upload modal state
  const [uploadModalData, setUploadModalData] = useState<null | {
    sem: string;
    exam: string;
    year: string;
  }>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileId, setUploadFileId] = useState("");

  // Fetch documents using TanStack Query
  const {
    data: PYQs = [],
    isLoading,
    error,
    refetch
  } = useQuery<PYQGroup[]>({
    queryKey: ['documents', dept, sem, exam],
    queryFn: async () => {
      if (!dept || !sem || !exam) {
        throw new Error('Missing required parameters');
      }
      
      const res = await fetch(`/api/documents?dept=${dept}&sem=${sem}&exam=${exam}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await res.json();
      return data.PYQDocs || [];
    },
    enabled: !!(dept && sem && exam),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Upload mutation with optimistic updates
  const uploadMutation = useMutation({
    mutationFn: async (uploadData: {
      dept: string;
      sem: string;
      exam: string;
      year: string;
      title: string;
      fileId: string;
    }) => {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadData),
      });
      
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      
      return res.json();
    },
    onMutate: async (newDoc) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['documents', dept, sem, exam] });
      
      // Snapshot the previous value
      const previousDocs = queryClient.getQueryData<PYQGroup[]>(['documents', dept, sem, exam]);
      
      // Optimistically update to the new value
      queryClient.setQueryData<PYQGroup[]>(['documents', dept, sem, exam], (old) => {
        if (!old) return old;
        
        // Find the matching semester/exam/year group
        return old.map((pyq) => {
          const [semData, ...docs] = pyq;
          if (semData.sem === newDoc.sem && semData.exam === newDoc.exam && semData.year === newDoc.year) {
            return [semData, ...docs, { title: newDoc.title, fileId: newDoc.fileId }] as PYQGroup;
          }
          return pyq;
        });
      });
      
      return { previousDocs };
    },
    onError: (err, newDoc, context) => {
      // Rollback on error
      if (context?.previousDocs) {
        queryClient.setQueryData<PYQGroup[]>(['documents', dept, sem, exam], context.previousDocs);
      }
      alert("Upload failed: " + (err instanceof Error ? err.message : 'Unknown error'));
    },
    onSuccess: () => {
      alert("Document uploaded successfully!");
      setUploadModalData(null);
      setUploadTitle("");
      setUploadFileId("");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['documents', dept, sem, exam] });
    },
  });
  
  const handleUpload = () => {
    if (!uploadModalData || !uploadTitle.trim() || !uploadFileId.trim() || !dept) return;
    
    uploadMutation.mutate({
      dept: Array.isArray(dept) ? dept[0] : dept,
      sem: uploadModalData.sem,
      exam: uploadModalData.exam,
      year: uploadModalData.year,
      title: uploadTitle.trim(),
      fileId: uploadFileId.trim(),
    });
  };



  if (!dept) {
    return <div className="text-white text-center p-6">Department not found</div>;
  }

  if (isLoading) {
    return (
      <div className="p-6 min-h-screen" style={{
        backgroundImage: 'linear-gradient(120deg, rgba(1,1,15,0.9), rgba(1,1,25,0.9))',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-center mb-12 text-slate-100 drop-shadow-lg"
        >
          Document Library
        </motion.h1>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          <span className="ml-4 text-slate-300">Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 min-h-screen" style={{
        backgroundImage: 'linear-gradient(120deg, rgba(1,1,15,0.9), rgba(1,1,25,0.9))',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold text-center mb-12 text-slate-100 drop-shadow-lg"
        >
          Document Library
        </motion.h1>
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
          <div className="text-red-400 text-center mb-4">
            <span className="text-6xl">⚠️</span>
            <p className="text-xl mt-2">Error loading documents</p>
            <p className="text-sm text-slate-400 mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
  className="p-6 min-h-screen"
  style={{
    backgroundImage: 'linear-gradient(120deg, rgba(1,1,15,0.9), rgba(1,1,25,0.9))',
  }}
>
   {/* Back Button */}
 <Link
         href={`/academics`}
         className="z-10 absolute top-[5vh] left-[5vw] flex items-center gap-2 bg-white/10 hover:bg-white/20 text-cyan-200 px-4 py-2 rounded-full shadow-md transition-all duration-200 backdrop-blur-md border border-cyan-300/20"
       >
         <IoArrowBack className="text-lg" />
         <span className="hidden sm:inline text-sm font-medium">Back</span>
       </Link>
  <motion.h1
    initial={{ opacity: 0, y: -30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-4xl font-extrabold text-center mb-12 text-slate-100 drop-shadow-lg"
  >
    Document Library
  </motion.h1>

  <div className="flex flex-col gap-12 items-center">
    {PYQs.length === 0 ? (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-slate-300 bg-slate-800/50 rounded-xl p-8 border border-slate-700"
      >
        <span className="text-4xl mb-4 block">📚</span>
        <h3 className="text-xl font-semibold mb-2">No documents found</h3>
        <p className="text-sm text-slate-400">No documents are available for {dept?.toString().toUpperCase()} - Semester {sem}, {exam}.</p>
        {kernel && (
          <p className="text-xs text-blue-300 mt-2">As an admin, you can upload the first document!</p>
        )}
      </motion.div>
    ) : (
      PYQs?.map((pyq, index) => {
      const [semData, ...docs] = pyq;
      const { sem, exam, year } = semData;

      return (
        <motion.div
          key={`${sem}-${exam}-${year}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
          className="w-full max-w-6xl rounded-2xl shadow-xl border border-slate-700 bg-slate-900 overflow-hidden"
        >
          <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-blue-300">
              Semester {sem} — {exam} {year}
            </h2>
            {kernel && (
              <button
                onClick={() => setUploadModalData({ sem, exam, year })}
                disabled={uploadMutation.isPending}
                className="text-blue-300 hover:text-blue-200 font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload Document"
              >
                {uploadMutation.isPending ? "⏳ Uploading..." : "⬆️ Upload"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6 px-6 py-4">
            {docs?.map((doc) => (
              <div
                key={doc.fileId}
                className="w-full rounded-lg border border-slate-700 shadow-md p-4 bg-slate-800 hover:bg-slate-700 cursor-pointer transition duration-200"
                onClick={() => setSelectedDoc({ fileId: doc.fileId, title: doc.title })}
              >
                <h3 className="text-lg font-semibold text-slate-100">{doc.title}</h3>
                <p className="text-sm text-slate-400">Click to view fullscreen</p>
              </div>
            ))}
          </div>
        </motion.div>
      );
      })
    )}
  </div>

  {/* View PDF Modal */}
  <AnimatePresence>
    {selectedDoc && (
      <motion.div
        className="fixed inset-0 z-50 bg-transparent flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ pointerEvents: 'none' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-full flex flex-col lg:flex-row p-4"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={() => setSelectedDoc(null)}
              className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg"
            >
              Close ✕
            </button>
          </div>

          <div className="w-full lg:w-[60vw] h-full mt-12 relative">
            <iframe
              src={getEmbedUrl(selectedDoc.fileId)}
              className="w-full h-full rounded-xl shadow-md [clip-path:polygon(0_0,100%_0,100%_80%,0_80%)] lg:[clip-path:none]"
              allow="autoplay"
            />
          </div>
          <div className="hidden lg:block w-full lg:w-[30vw] h-full p-2 mt-6 lg:mt-12">
            <MeditatingPanda fileId={selectedDoc.fileId} />
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Upload Modal */}
  <AnimatePresence>
    {uploadModalData && (
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 text-white rounded-xl p-6 shadow-2xl w-[90%] max-w-md relative border border-slate-700"
        >
          <button
            onClick={() => setUploadModalData(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
          >
            ✕
          </button>
          <h2 className="text-xl font-semibold mb-4 text-blue-300">
            Upload Document — Sem {uploadModalData.sem}, {uploadModalData.exam} {uploadModalData.year}
          </h2>
          <input
            className="w-full mb-3 p-2 border border-slate-600 bg-slate-800 text-white rounded placeholder:text-slate-400"
            placeholder="Document Title"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />
          <input
            className="w-full mb-3 p-2 border border-slate-600 bg-slate-800 text-white rounded placeholder:text-slate-400"
            placeholder="Google Drive File ID"
            value={uploadFileId}
            onChange={(e) => setUploadFileId(e.target.value)}
          />
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !uploadTitle.trim() || !uploadFileId.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded font-semibold transition"
          >
            {uploadMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>



  {/* FloatingPanda for Small Screens - Always Visible */}
  {selectedDoc && selectedDoc.fileId && (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[999999]">
      <div style={{ pointerEvents: 'auto' }}>
        <MeditatingPanda fileId={selectedDoc.fileId} />
      </div>
    </div>
  )}
</div>

  );
};

export default DocumentPage;
