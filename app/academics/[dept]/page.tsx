"use client";


import { useParams, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

// Zod Schemas for validation
const DocumentDataSchema = z.object({
  fileId: z.string()
    .min(1, "File ID is required")
    .max(200, "File ID too long"), // Removed strict regex, increased length limit
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .regex(/^[a-zA-Z0-9\s\-_.,()\[\]]+$/, "Title contains invalid characters")
}).passthrough(); // Allow additional fields from database

const PYQDataSchema = z.object({
  sem: z.string()
    .regex(/^[1-8]$/, "Semester must be between 1-8"),
  exam: z.string()
    .min(1, "Exam type is required")
    .regex(/^(mid|end|quiz)$/i, "Invalid exam type"),
  year: z.string()
    .regex(/^20[0-9]{2}$/, "Invalid year format")
}).passthrough(); // Allow additional fields

const PYQGroupSchema = z.tuple([PYQDataSchema]).rest(DocumentDataSchema);

const APIResponseSchema = z.object({
  PYQDocs: z.array(PYQGroupSchema).default([]),
  success: z.boolean().optional(),
  message: z.string().optional()
}).passthrough(); // Allow additional fields

const UploadDataSchema = z.object({
  dept: z.string()
    .min(2, "Department code too short")
    .max(10, "Department code too long")
    .regex(/^[a-z]{2,10}$/, "Department must be lowercase letters only"),
  sem: z.string().regex(/^[1-8]$/, "Invalid semester"),
  exam: z.string().regex(/^(mid|end|quiz)$/i, "Invalid exam type"),
  year: z.string().regex(/^20[0-9]{2}$/, "Invalid year"),
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title too long")
    .regex(/^[a-zA-Z0-9\s\-_.,()\[\]]+$/, "Title contains invalid characters"),
  fileId: z.string()
    .min(1, "File ID is required")
    .max(200, "File ID too long") // Removed strict regex for flexibility
});

const UserMetadataSchema = z.object({
  mongoId: z.string().min(1).optional()
});

// Type definitions derived from schemas
type DocumentData = z.infer<typeof DocumentDataSchema>;
type PYQData = z.infer<typeof PYQDataSchema>;
type PYQGroup = z.infer<typeof PYQGroupSchema>;
type UploadData = z.infer<typeof UploadDataSchema>;

// Delete data schema
const DeleteDataSchema = z.object({
  fileId: z.string().min(1, "File ID is required"),
  dept: z.string().min(2, "Department is required"),
  sem: z.string().regex(/^[1-8]$/, "Invalid semester"),
  exam: z.string().regex(/^(mid|end|quiz)$/i, "Invalid exam type"),
  year: z.string().regex(/^20[0-9]{2}$/, "Invalid year")
});

type DeleteData = z.infer<typeof DeleteDataSchema>;

import Link from "next/link";
import { IoArrowBack } from "react-icons/io5";
import dynamic from "next/dynamic";
import { toast } from 'react-toastify';

// Dynamically import FloatingPanda to prevent SSR issues with PDF parsing
const MeditatingPanda = dynamic(() => import("@/components/Animations/FloatingPanda"), {
  ssr: false,
  loading: () => null
});

// Security utilities
const sanitizeFileId = (fileId: string): string => {
  // Extract file ID from full Google Drive URL if provided
  const urlMatch = fileId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) return urlMatch[1];
  
  // Return sanitized file ID
  return fileId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);
};

// Google Drive Embed URL with validation
const getEmbedUrl = (fileId: string): string => {
  const sanitizedId = sanitizeFileId(fileId);
  const validation = z.string().regex(/^[a-zA-Z0-9_-]+$/).min(1).safeParse(sanitizedId);
  
  if (!validation.success) {
    throw new Error('Invalid file ID for embedding');
  }
  
  return `https://drive.google.com/file/d/${validation.data}/preview`;
};

const DocumentPage = () => {
  const { dept } = useParams();
  const params = useSearchParams();
  const sem = params.get("sem");
  const exam = params.get("ex");
  const { user } = useAuth();
  
  // Validate and sanitize URL parameters
  const validatedParams = useMemo(() => {
    try {
      const deptStr = Array.isArray(dept) ? dept[0] : dept;
      return {
        dept: deptStr?.toLowerCase(),
        sem: sem?.trim(),
        exam: exam?.toLowerCase().trim()
      };
    } catch {
      return { dept: null, sem: null, exam: null };
    }
  }, [dept, sem, exam]);
  
  // Array of authorized admin mongoIds with validation
  const ADMIN_MONGO_IDS = [
    "679e8f524c04113c6bc5828e",
    "68a5d5e9981205f073851fdf",
    "68a5d5f3981205f073851fe0", 
    "68a5d60a411910aee8d05a64"
  ].filter(id => z.string().min(20).safeParse(id).success); // Validate admin IDs
  
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Validate user and check admin status
  const { kernel, validatedUser } = useMemo(() => {
    try {
      if (!user?._id) {
        return { kernel: false, validatedUser: null };
      }
      
      const isAdmin = ADMIN_MONGO_IDS.includes(user._id);
      return { 
        kernel: isAdmin, 
        validatedUser: { mongoId: user._id } 
      };
    } catch {
      return { kernel: false, validatedUser: null };
    }
  }, [user?._id, ADMIN_MONGO_IDS]);

  // Upload modal state with validation
  const [uploadModalData, setUploadModalData] = useState<null | {
    sem: string;
    exam: string;
    year: string;
  }>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFileId, setUploadFileId] = useState("");
  
  // Real-time input validation
  const validateUploadInputs = useMemo(() => {
    if (!uploadTitle && !uploadFileId) return { isValid: true, errors: {} };
    
    const titleResult = z.string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title too long")
      .regex(/^[a-zA-Z0-9\s\-_.,()\[\]]*$/, "Title contains invalid characters")
      .safeParse(uploadTitle.trim());
      
    const fileIdResult = z.string()
      .min(0, "File ID validation")
      .safeParse(uploadFileId.trim()); // Removed strict regex validation
    
    const errors: Record<string, string> = {};
    if (!titleResult.success && uploadTitle) {
      errors.title = titleResult.error.errors[0]?.message || "Invalid title";
    }
    if (!fileIdResult.success && uploadFileId) {
      errors.fileId = fileIdResult.error.errors[0]?.message || "Invalid file ID";
    }
    
    return {
      isValid: titleResult.success && fileIdResult.success,
      errors
    };
  }, [uploadTitle, uploadFileId]);

  // Fetch documents using TanStack Query with validation
  const {
    data: PYQs = [],
    isLoading,
    error,
    refetch
  } = useQuery<any[]>({
    queryKey: ['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam],
    queryFn: async () => {
      const { dept: validDept, sem: validSem, exam: validExam } = validatedParams;
      
      console.log('Frontend params:', { validDept, validSem, validExam });
      
      if (!validDept || !validSem || !validExam) {
        throw new Error('Missing or invalid required parameters');
      }
      
      // Validate parameters before making request
      const paramValidation = z.object({
        dept: z.string().regex(/^[a-z]{2,10}$/, "Invalid department"),
        sem: z.string().regex(/^[1-8]$/, "Invalid semester"),
        exam: z.string().regex(/^(mid|end|quiz)$/, "Invalid exam type")
      }).safeParse({ dept: validDept, sem: validSem, exam: validExam });
      
      if (!paramValidation.success) {
        throw new Error(`Invalid parameters: ${paramValidation.error.errors[0]?.message}`);
      }
      
      const res = await fetch(
        `/api/documents?dept=${encodeURIComponent(validDept)}&sem=${encodeURIComponent(validSem)}&exam=${encodeURIComponent(validExam)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to fetch documents`);
      }
      
      const rawData = await res.json();
      
      // Validate API response
      const validatedResponse = APIResponseSchema.safeParse(rawData);
      if (!validatedResponse.success) {
        console.error('API response validation failed:', validatedResponse.error);
        throw new Error('Invalid response format from server');
      }
      
      return validatedResponse.data.PYQDocs;
    },
    enabled: !!(validatedParams.dept && validatedParams.sem && validatedParams.exam),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.message.includes('Invalid parameters')) return false;
      return failureCount < 3;
    }
  });

  // Upload mutation with comprehensive validation
  const uploadMutation = useMutation({
    mutationFn: async (uploadData: UploadData) => {
      // Validate upload data before sending
      const validationResult = UploadDataSchema.safeParse(uploadData);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      
      // Additional security check: ensure user is admin
      if (!kernel) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // Add CSRF protection if available
        },
        body: JSON.stringify(validationResult.data),
      });
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Upload failed (${res.status}): ${errorText}`);
      }
      
      const responseData = await res.json();
      
      // Validate response
      const responseValidation = z.object({
        success: z.boolean(),
        message: z.string().optional(),
        data: z.any().optional()
      }).safeParse(responseData);
      
      if (!responseValidation.success || !responseValidation.data.success) {
        throw new Error(responseValidation.data?.message || 'Upload failed');
      }
      
      return responseValidation.data;
    },
    onMutate: async (newDoc) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam] });
      
      // Snapshot the previous value
      const previousDocs = queryClient.getQueryData<any[]>(['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam]);
      
      // Optimistically update to the new value
      queryClient.setQueryData<any[]>(['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam], (old) => {
        if (!old) return old;
        
        // Find the matching semester/exam/year group
        return old.map((pyq: any) => {
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
        queryClient.setQueryData<any[]>(['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam], context.previousDocs);
      }
      toast.error("Upload failed: " + (err instanceof Error ? err.message : 'Unknown error'));
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully!");
      setUploadModalData(null);
      setUploadTitle("");
      setUploadFileId("");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam] });
    },
  });

  // Delete mutation with comprehensive validation
  const deleteMutation = useMutation({
    mutationFn: async (deleteData: DeleteData) => {
      // Additional security check: ensure user is admin
      if (!kernel) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      const res = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deleteData),
      });
      
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Delete failed (${res.status}): ${errorText}`);
      }
      
      return await res.json();
    },
    onMutate: async (deleteData) => {
      await queryClient.cancelQueries({ queryKey: ['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam] });
      const previousDocs = queryClient.getQueryData<any[]>(['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam]);
      
      queryClient.setQueryData<any[]>(['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam], (old) => {
        if (!old) return old;
        return old.map((pyq: any) => {
          const [semData, ...docs] = pyq;
          if (semData.sem === deleteData.sem && semData.exam === deleteData.exam && semData.year === deleteData.year) {
            const filteredDocs = docs.filter((doc: any) => doc.fileId !== deleteData.fileId);
            return [semData, ...filteredDocs] as PYQGroup;
          }
          return pyq;
        });
      });
      
      return { previousDocs };
    },
    onError: (err, deleteData, context) => {
      if (context?.previousDocs) {
        queryClient.setQueryData<any[]>(['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam], context.previousDocs);
      }
      toast.error("Delete failed: " + (err instanceof Error ? err.message : 'Unknown error'));
      setDeletingFileId(null);
    },
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      setDeletingFileId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', validatedParams.dept, validatedParams.sem, validatedParams.exam] });
    },
  });
  
  const handleDelete = (doc: DocumentData, semData: PYQData) => {
    if (!validatedParams.dept) return;
    
    if (confirm(`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`)) {
      const deleteData: DeleteData = {
        fileId: doc.fileId,
        dept: validatedParams.dept,
        sem: semData.sem,
        exam: semData.exam,
        year: semData.year,
      };
      
      setDeletingFileId(doc.fileId);
      deleteMutation.mutate(deleteData);
    }
  };
  
  const handleUpload = () => {
    if (!uploadModalData || !validatedParams.dept) {
      setValidationErrors({ general: 'Missing required data' });
      return;
    }
    
    // Clear previous errors
    setValidationErrors({});
    
    // Validate inputs before submission
    const uploadData = {
      dept: validatedParams.dept,
      sem: uploadModalData.sem,
      exam: uploadModalData.exam,
      year: uploadModalData.year,
      title: uploadTitle.trim(),
      fileId: uploadFileId.trim(),
    };
    
    const validation = UploadDataSchema.safeParse(uploadData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setValidationErrors(errors);
      return;
    }
    
    uploadMutation.mutate(validation.data);
  };
  
  // Safe document selection with validation
  const handleDocumentSelect = (doc: any) => {
    const validation = DocumentDataSchema.safeParse(doc);
    if (validation.success) {
      setSelectedDoc(validation.data);
    } else {
      console.error('Invalid document data:', validation.error);
      alert('Error: Invalid document data');
    }
  };



  // Security check: validate all required parameters
  if (!validatedParams.dept || !validatedParams.sem || !validatedParams.exam) {
    return (
      <div className="p-6 min-h-screen" style={{
        backgroundImage: 'linear-gradient(120deg, rgba(1,1,15,0.9), rgba(1,1,25,0.9))',
      }}>
        <div className="text-center text-red-400 p-8">
          <span className="text-6xl mb-4 block">🚫</span>
          <h2 className="text-xl font-semibold mb-2">Invalid Access</h2>
          <p className="text-sm text-slate-400">
            Missing or invalid parameters. Please access this page through the proper navigation.
          </p>
          <Link 
            href="/academics"
            className="mt-4 inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Academics
          </Link>
        </div>
      </div>
    );
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
        <p className="text-sm text-slate-400">
          No documents are available for {validatedParams.dept} - Semester {validatedParams.sem}, {validatedParams.exam}.
        </p>
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
            {docs?.map((doc: any) => (
              <div
                key={doc.fileId}
                className="w-full rounded-lg border border-slate-700 shadow-md p-4 bg-slate-800 hover:bg-slate-700 transition duration-200"
              >
                <div className="flex justify-between items-start gap-4">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    <h3 className="text-lg font-semibold text-slate-100">{doc.title}</h3>
                    <p className="text-sm text-slate-400">Click to view fullscreen</p>
                  </div>
                  {kernel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc, semData);
                      }}
                      disabled={deletingFileId === doc.fileId}
                      className="text-red-400 hover:text-red-300 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded border border-red-500/30 hover:border-red-400/50 transition-colors"
                      title="Delete Document"
                    >
                      {deletingFileId === doc.fileId ? "🗑️ Deleting..." : "🗑️ Delete"}
                    </button>
                  )}
                </div>
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
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
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
          <div className="mb-3">
            <input
              className={`w-full p-2 border bg-slate-800 text-white rounded placeholder:text-slate-400 ${
                validationErrors.title || validateUploadInputs.errors.title
                  ? 'border-red-500 focus:border-red-400' 
                  : 'border-slate-600 focus:border-blue-400'
              }`}
              placeholder="Document Title (3-200 characters)"
              value={uploadTitle}
              onChange={(e) => {
                setUploadTitle(e.target.value);
                // Clear field-specific error on input
                if (validationErrors.title) {
                  setValidationErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              maxLength={200}
            />
            {(validationErrors.title || validateUploadInputs.errors.title) && (
              <p className="text-red-400 text-xs mt-1">
                {validationErrors.title || validateUploadInputs.errors.title}
              </p>
            )}
          </div>
          <div className="mb-3">
            <input
              className={`w-full p-2 border bg-slate-800 text-white rounded placeholder:text-slate-400 ${
                validationErrors.fileId || validateUploadInputs.errors.fileId
                  ? 'border-red-500 focus:border-red-400' 
                  : 'border-slate-600 focus:border-blue-400'
              }`}
              placeholder="Google Drive File ID (alphanumeric, -, _)"
              value={uploadFileId}
              onChange={(e) => {
                // Extract and sanitize file ID from URL or direct input
                const sanitized = sanitizeFileId(e.target.value);
                setUploadFileId(sanitized);
                // Clear field-specific error on input
                if (validationErrors.fileId) {
                  setValidationErrors(prev => ({ ...prev, fileId: '' }));
                }
              }}
              onPaste={(e) => {
                // Handle pasted Google Drive URLs
                const pastedData = e.clipboardData.getData('text');
                const extractedId = sanitizeFileId(pastedData);
                if (extractedId !== pastedData) {
                  e.preventDefault();
                  setUploadFileId(extractedId);
                }
              }}
              maxLength={100}
            />
            {(validationErrors.fileId || validateUploadInputs.errors.fileId) && (
              <p className="text-red-400 text-xs mt-1">
                {validationErrors.fileId || validateUploadInputs.errors.fileId}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">
              Extract from Google Drive share URL: drive.google.com/file/d/<strong>FILE_ID</strong>/view
            </p>
          </div>
          {validationErrors.general && (
            <div className="mb-3 p-2 bg-red-900/30 border border-red-500 rounded text-red-400 text-sm">
              {validationErrors.general}
            </div>
          )}
          <button
            onClick={handleUpload}
            disabled={
              uploadMutation.isPending || 
              !uploadTitle.trim() || 
              !uploadFileId.trim() ||
              !validateUploadInputs.isValid ||
              Object.keys(validationErrors).length > 0
            }
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
