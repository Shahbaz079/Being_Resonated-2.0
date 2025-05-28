"use client";


import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";

import MeditatingPanda from "@/components/Animations/FloatingPanda";

// Google Drive Embed URL
const getEmbedUrl = (fileId: string) =>
  `https://drive.google.com/file/d/${fileId}/preview`;

const DocumentPage = () => {
  const { dept } = useParams();

   const params=useSearchParams();
   const sem=params.get("sem");
   const exam=params.get("ex");

     const { user } = useUser();
  const ownerId = user?.publicMetadata.mongoId;

  const [kernel, setKernel] = useState<boolean>(false);
  const [PYQs, setPYQs] = useState<Array<Array<any>>>([]);
  const [selectedDoc, setSelectedDoc] = useState<{ fileId: string; title: string } | null>(null);

  // Upload modal state
  const [uploadModalData, setUploadModalData] = useState<null | {
    sem: string;
    exam: string;
    year: string;
  }>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileId, setUploadFileId] = useState("");

 
  useEffect(() => {

    setKernel(ownerId=="679e8f524c04113c6bc5828e")


  }, [ownerId]);

  useEffect(() => {
  const getDocs= async () => {
    if (!dept || !sem || !exam) return;

    // Fetch documents from the server based on department
    const res = await fetch(`/api/documents?dept=${dept}&sem=${sem}&exam=${exam}`,{
      method: "GET",
      headers: { "Content-Type": "application/json" },
     
    });
    const data = await res.json();
    console.log(data)

    if (data) {
      setPYQs(data.PYQDocs);
    } else {
      console.error("Failed to fetch documents:", data.message);
    }
  }  
  
    getDocs();
  },
    [])

  const handleUpload = async () => {
    if (!uploadModalData || !uploadTitle || !uploadFileId) return;

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dept,
        sem: uploadModalData.sem,
        exam: uploadModalData.exam,
        year: uploadModalData.year,
        title: uploadTitle,
        fileId: uploadFileId,
      }),
    });

    const result = await res.json();

    if (result.success) {
      alert("Document uploaded!");
      setUploadModalData(null);
      // TODO: Ideally re-fetch updated data here
    } else {
      alert("Upload failed.");
    }
  };

  console.log("PYQS", PYQs);

  if (!dept) {
    return <div>Department not found</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-center mb-12 text-blue-900"
      >
        Document Library
      </motion.h1>

      <div className="flex flex-col gap-12 items-center">
        {PYQs?.map((pyq, index) => {
          const [semData, ...docs] = pyq;
          const { sem, exam, year } = semData;

          return (
            <motion.div
              key={`${sem}-${exam}-${year}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="w-full max-w-6xl rounded-2xl shadow-lg border border-gray-300 bg-white overflow-hidden"
            >
              <div className="bg-blue-100 p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-blue-800">
                  Semester {sem} — {exam} {year}
                </h2>
               {kernel && <button
                  onClick={() => setUploadModalData({ sem, exam, year })}
                  className="text-blue-800 hover:text-blue-600 font-bold text-xl"
                  title="Upload Document"
                >
                  ⬆️ Upload
                </button>}
              </div>

              <div className="flex flex-col gap-6 px-6 py-4">
                {docs?.map((doc) => (
                  <div
                    key={doc.fileId}
                    className="w-full rounded-lg border border-gray-200 shadow-sm p-4 bg-white hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => setSelectedDoc({ fileId: doc.fileId, title: doc.title })}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{doc.title}</h3>
                    <p className="text-sm text-gray-500">Click to view fullscreen</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View PDF Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full p-4"
            >
              <div className="absolute top-4 left-4 z-50">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg"
                >
                  Close ✕
                </button>
              </div>

              <div className="w-[60vw] h-full mt-12">
                <iframe
                  src={getEmbedUrl(selectedDoc.fileId)}
                  className="w-full h-full rounded-md"
                  allow="autoplay"
                />
              </div>
              <div className="w-[30vw] h-full">
                <MeditatingPanda fileId={selectedDoc.fileId}/>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalData && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-md relative"
            >
              <button
                onClick={() => setUploadModalData(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                Upload Document — Sem {uploadModalData.sem}, {uploadModalData.exam} {uploadModalData.year}
              </h2>
              <input
                className="w-full mb-3 p-2 border border-gray-300 rounded"
                placeholder="Document Title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
              />
              <input
                className="w-full mb-3 p-2 border border-gray-300 rounded"
                placeholder="Google Drive File ID"
                value={uploadFileId}
                onChange={(e) => setUploadFileId(e.target.value)}
              />
              <button
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
              >
                Upload
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentPage;
