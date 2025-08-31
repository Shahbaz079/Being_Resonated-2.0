'use client'

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { ExpandableCardDemo, IUser } from "@/components/expandableCards/card";
import { useUser } from "@clerk/nextjs";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";

// Pagination types
interface PaginatedResponse {
  users: IUser[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Updated fetch function with pagination (backward compatible)
const fetchSimilarPeople = async ({ 
  id, 
  page = 1, 
  limit = 6 
}: { 
  id: string; 
  page?: number; 
  limit?: number; 
}): Promise<PaginatedResponse> => {
  const res = await fetch(`/api/people?id=${id}&page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to fetch similar people')
  const data = await res.json()
  
  // Handle backward compatibility - if API returns array instead of paginated response
  if (Array.isArray(data)) {
    return {
      users: data,
      totalUsers: data.length,
      totalPages: 1,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false
    }
  }
  
  return data
}

// Infinite scroll fetch function
const fetchSimilarPeopleInfinite = async ({ 
  pageParam = 1, 
  queryKey 
}: { 
  pageParam: number; 
  queryKey: string[]; 
}) => {
  const [, id] = queryKey;
  return fetchSimilarPeople({ id, page: pageParam, limit: 6 });
};

const fetchLoggedUser = async (id: string) :Promise<IUser>=> {
  const res = await fetch(`/api/currentperson?id=${id}`)
  if (!res.ok) throw new Error('Failed to fetch current person')
  return res.json()
}

const SimPeople = ({id}:{id:string}) => {
    const {isLoaded, user} = useUser();
    const mongoId = user?.publicMetadata?.mongoId as string;
    
    // Pagination state
    const [paginationMode, setPaginationMode] = useState<'pagination' | 'infinite'>('pagination');
    const [currentPage, setCurrentPage] = useState(1);
    
    
    // Regular pagination query
    const {
        data: paginatedData,
        isLoading: loadingPeople,
        error: peopleError,
        refetch
    } = useQuery({
        queryKey: ['similarPeople', mongoId, currentPage],
        queryFn: () => fetchSimilarPeople({ id: mongoId, page: currentPage, limit: 6 }),
        enabled: isLoaded && !!mongoId && paginationMode === 'pagination',
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
    
    // Infinite scroll query
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: loadingInfinite,
        error: infiniteError
    } = useInfiniteQuery({
        queryKey: ['similarPeopleInfinite', mongoId],
        queryFn: ({ pageParam = 1, queryKey }) => {
            const [, id] = queryKey;
            return fetchSimilarPeople({ id, page: pageParam, limit: 6 });
        },
        getNextPageParam: (lastPage) => {
            return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
        },
        enabled: isLoaded && !!mongoId && paginationMode === 'infinite',
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        initialPageParam: 1,
    });
    
    // Extract data based on pagination mode
    const similarPeople = paginationMode === 'pagination' 
        ? (paginatedData?.users || [])
        : (infiniteData?.pages.flatMap(page => page.users) || []);
    
    const totalPages = paginatedData?.totalPages || 1;
    const totalUsers = paginationMode === 'pagination' 
        ? (paginatedData?.totalUsers || similarPeople.length)
        : (infiniteData?.pages[0]?.totalUsers || similarPeople.length);
    
    const isLoading = paginationMode === 'pagination' ? loadingPeople : loadingInfinite;
    const error = paginationMode === 'pagination' ? peopleError : infiniteError;
    

    const {
        data: loggedUser,
        isLoading: loadingUser,
        error: userError,
    } = useQuery({
        queryKey: ['loggedUser', mongoId],
        queryFn: () => fetchLoggedUser(mongoId),
        enabled: isLoaded && !!mongoId,
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
    
    // Pagination handlers
    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);
    
    const handlePrevPage = useCallback(() => {
        handlePageChange(currentPage - 1);
    }, [currentPage, handlePageChange]);
    
    const handleNextPage = useCallback(() => {
        handlePageChange(currentPage + 1);
    }, [currentPage, handlePageChange]);
    
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
    
    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, currentPage - halfVisible);
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }
        
        return pages;
    };




    return (
        <div className="h-fit px-4 pb-4 items-center">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <h1 className="text-center font-semibold text-cyan-200 text-md flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Users {totalUsers > 0 && `(${totalUsers})`}
                </h1>
                
                {/* Pagination Mode Toggle - only show if we have pagination support */}
                {similarPeople.length > 0 && totalPages > 1 && (
                    <div className="flex items-center gap-2 text-xs">
                        <button
                            onClick={() => setPaginationMode('pagination')}
                            className={`px-2 py-1 rounded transition-colors ${
                                paginationMode === 'pagination' 
                                    ? 'bg-cyan-600 text-white' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            Pages
                        </button>
                        <button
                            onClick={() => setPaginationMode('infinite')}
                            className={`px-2 py-1 rounded transition-colors ${
                                paginationMode === 'infinite' 
                                    ? 'bg-cyan-600 text-white' 
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            Infinite
                        </button>
                    </div>
                )}
            </div>

            {/* User Profile Link */}
            <div className="mt-2 mx-4 hover:opacity-90 border-2 text-center bg-teal-600 rounded-lg flex">
                <Link href={`/profile?id=${mongoId}`} className="text-white w-full text-sm text-center px-2 py-1">
                    User Profile
                </Link>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center mt-6 text-cyan-200">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Loading users...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mt-6 text-center text-red-400 bg-red-900/20 rounded-lg p-3 mx-4">
                    <p className="text-sm">Failed to load users. Please try again.</p>
                    <button
                        onClick={() => refetch?.()}
                        className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="text-cyan-200 mt-7">
                {
                    // Show empty state only when not loading and no users found
                    !isLoading && similarPeople.length === 0 ? (
                        <>
                            <h1 className="text-center text-gray-400 mb-4">
                                Update your interests from your profile to find people like yours ✨
                            </h1>
                            <Link 
                                className="mt-2 mx-4 text-sm hover:opacity-90 py-2 justify-center border-2 text-center bg-teal-600 rounded-lg flex" 
                                href={`/profile?id=${id}`}
                            >
                                Update Interests
                            </Link>
                        </>
                    ) : (
                        // Show users when we have data, regardless of loading state
                        similarPeople.length > 0 && (
                            <>
                                <ExpandableCardDemo 
                                    users={similarPeople} 
                                    cUser={loggedUser ? loggedUser : null} 
                                />
                            
                            {/* Pagination Controls */}
                            {paginationMode === 'pagination' && totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2 px-4">
                                    {/* Previous Button */}
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Prev
                                    </button>
                                    
                                    {/* Page Numbers */}
                                    <div className="flex gap-1">
                                        {getPageNumbers().map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    currentPage === pageNum
                                                        ? 'bg-cyan-600 text-white'
                                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Next Button */}
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors text-sm"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            
                            {/* Load More Button for Infinite Scroll */}
                            {paginationMode === 'infinite' && hasNextPage && (
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isFetchingNextPage}
                                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto text-sm"
                                    >
                                        {isFetchingNextPage ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading more...
                                            </>
                                        ) : (
                                            'Load More Users'
                                        )}
                                    </button>
                                </div>
                            )}
                            
                            {/* Pagination Info */}
                            {paginationMode === 'pagination' && totalUsers > 0 && (
                                <div className="mt-4 text-center text-xs text-slate-400">
                                    Showing page {currentPage} of {totalPages} ({totalUsers} total users)
                                </div>
                            )}
                            
                            {paginationMode === 'infinite' && !hasNextPage && similarPeople.length > 0 && (
                                <div className="mt-6 text-center text-sm text-slate-400">
                                    You have reached the end! ({totalUsers} users loaded)
                                </div>
                            )}
                            </>
                        )
                    )
                }
            </div>
        </div>
    );
}

const SimPeopleWithSuspense = ({ id }: { id: string }) => (
    <Suspense fallback={
        <div className="h-fit px-4 pb-4 items-center">
            <div className="flex items-center justify-center mt-6 text-cyan-200">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading users...</span>
            </div>
        </div>
    }>
        <SimPeople id={id} />
    </Suspense>
)

export default SimPeopleWithSuspense;
