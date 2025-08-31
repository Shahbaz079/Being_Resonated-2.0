import React, { useEffect, useRef, useState, useMemo } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Play } from "lucide-react";
import { EventPost } from "@/app/becommunity/page";
import { useUser } from "@clerk/nextjs";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import { ObjectId } from "mongoose";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Unified Post Types
export type UserPost = {
  _id?: ObjectId;
  createdBy: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  caption: string;
  image: string;
  vid: boolean;
  imgThumbnail?: string;
  name: string;
  user: {
    name: string;
    image: string;
  };
  date: string;
  likes: PostLike[];
  isEventPostPost: boolean;
  projectProgress: number;
  from?: {
    _id: ObjectId;
    image: string;
  };
};

export type TeamPost = {
  _id: ObjectId;
  title: string;
  from: string;
  team: {
    image: string;
    _id: string;
    leaders: ObjectId[];
  };
  caption: string;
  image: string;
  vid?: boolean;
  imgThumbnail?: string;
  likes: PostLike[];
};

type PostLike = {
  image?: string;
  _id: ObjectId;
  name: string;
};

// Post type determination
enum PostType {
  USER = 'user',
  TEAM = 'team',
  EVENT = 'event'
}

interface PostCardProps {
  post: UserPost | EventPost | TeamPost;
}

// Enhanced PostCard Component
const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useUser();
  const mongoId = user?.publicMetadata.mongoId as string;
  
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  const textRef = useRef<HTMLDivElement>(null);
  
  // Caption handling - always slice initially
  const CAPTION_SLICE_LENGTH = 150; // characters to show initially
  const shouldShowReadMore = post.caption && post.caption.length > CAPTION_SLICE_LENGTH;
  const displayCaption = isExpanded || !shouldShowReadMore 
    ? post.caption 
    : post.caption?.slice(0, CAPTION_SLICE_LENGTH) + '...';

  // Determine post type and extract unified data with better dark theme colors
  const postData = useMemo(() => {
    if ("user" in post) {
      return {
        type: PostType.USER,
        author: {
          name: post.user.name,
          image: post.user.image,
          id: post.createdBy.toString()
        },
        link: `/profile?id=${post.createdBy.toString()}`,
        color: "text-emerald-300",
        hoverColor: "hover:text-emerald-200",
        bgGradient: "from-emerald-600/30 via-teal-600/25 to-cyan-600/30",
        borderGradient: "from-emerald-400/40 to-teal-400/40",
        statusColor: "bg-gradient-to-r from-emerald-400 to-teal-400",
        deleteEndpoint: "/api/userpost",
        updateEndpoint: "/api/userpost",
        canDelete: post.createdBy.toString() === mongoId
      };
    } else if ("time" in post) {
      return {
        type: PostType.EVENT,
        author: {
          name: post.title,
          image: post.eventImg?.image || "",
          id: post.from?.toString() || ""
        },
        link: `/event/${post.from}?uid=${mongoId}`,
        color: "text-violet-300",
        hoverColor: "hover:text-violet-200",
        bgGradient: "from-violet-600/30 via-purple-600/25 to-fuchsia-600/30",
        borderGradient: "from-violet-400/40 to-fuchsia-400/40",
        statusColor: "bg-gradient-to-r from-violet-400 to-purple-400",
        deleteEndpoint: "/api/eventpost",
        updateEndpoint: "/api/eventpost",
        canDelete: post.eventImg?.leaders?.some(leader => 
          leader.toString() === mongoId
        ) || false
      };
    } else {
      return {
        type: PostType.TEAM,
        author: {
          name: "title" in post ? post.title : "",
          image: post.team?.image || "",
          id: post.from?.toString() || ""
        },
        link: `/team/${post.from?.toString()}?id=${post.from?.toString()}`,
        color: "text-amber-300",
        hoverColor: "hover:text-amber-200",
        bgGradient: "from-amber-600/30 via-orange-600/25 to-red-600/30",
        borderGradient: "from-amber-400/40 to-orange-400/40",
        statusColor: "bg-gradient-to-r from-amber-400 to-orange-400",
        deleteEndpoint: "/api/teampost",
        updateEndpoint: "/api/teampost",
        canDelete: post.team?.leaders?.some(leader => 
          leader.toString() === mongoId
        ) || false
      };
    }
  }, [post, mongoId]);

  // Initialize component state
  useEffect(() => {
    if (post.likes) {
      setLikeCount(post.likes.length);
      setIsLiked(post.likes.some(like => like._id.toString() === mongoId));
    }
  }, [post.likes, mongoId]);

  // Handlers
  const handleLike = async () => {
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    
    // Optimistic updates
    setIsLiked(newIsLiked);
    setLikeCount(newCount);

    try {
      let updatedLikes: string[];
      if (newIsLiked) {
        const newLike = {
          _id: mongoId as unknown as ObjectId,
          name: user?.username || "",
          image: user?.imageUrl || ""
        };
        updatedLikes = [...(post.likes || []), newLike].map(like => like._id.toString());
      } else {
        updatedLikes = post.likes?.filter(like => 
          like._id.toString() !== mongoId
        ).map(like => like._id.toString()) || [];
      }

      await fetch(`${postData.updateEndpoint}?id=${post._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likes: updatedLikes })
      });
    } catch (error) {
      // Revert optimistic updates on error
      setIsLiked(!newIsLiked);
      setLikeCount(likeCount);
      toast.error("Failed to update like");
    }
  };

  const handleDelete = async () => {
    if (!post._id) return;
    
    try {
      const response = await fetch(`${postData.deleteEndpoint}?id=${post._id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        toast.success("Post deleted successfully");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("Error deleting post");
    }
    setShowMenu(false);
  };

  const renderContent = (content: string) => {
    const modifiedHtml = content.replace(/<p><\/p>/g, "<p>&nbsp;</p>");
    return parse(modifiedHtml);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group relative max-w-2xl mx-auto mb-6"
    >
      {/* Main Card with Enhanced Glass Morphism */}
      <div className={`relative backdrop-blur-2xl bg-gradient-to-br ${postData.bgGradient} bg-slate-900/70 border border-slate-600/30 rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:backdrop-blur-3xl`}>
        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none" />
        <div className={`absolute inset-0 bg-gradient-to-br ${postData.borderGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none rounded-2xl`} />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <Link href={postData.link} className="flex items-center gap-4 group-hover:scale-[1.02] transition-transform duration-300">
            <div className="relative">
              <div className="relative p-0.5 rounded-full bg-gradient-to-br from-slate-600/50 to-slate-700/50 backdrop-blur-sm">
                <Image
                  src={postData.author.image || "/default-avatar.png"}
                  alt={postData.author.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover ring-2 ring-slate-500/30 hover:ring-slate-400/60 transition-all duration-300"
                />
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${postData.statusColor} shadow-lg ring-2 ring-slate-900/50 transition-transform duration-300 group-hover:scale-110`} />
            </div>
            <div>
              <h3 className={`font-semibold ${postData.color} ${postData.hoverColor} transition-colors duration-200 text-lg`}>
                {postData.author.name}
              </h3>
              <p className="text-xs text-slate-300/80 capitalize font-medium backdrop-blur-sm px-2 py-1 rounded-full bg-slate-700/30">
                {postData.type} post
              </p>
            </div>
          </Link>

          {/* Menu */}
          {postData.canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-slate-600/40 backdrop-blur-sm rounded-full transition-all duration-300 hover:scale-110 border border-slate-600/20 hover:border-slate-500/40"
              >
                <MoreHorizontal className="w-5 h-5 text-slate-300 hover:text-slate-200" />
              </button>
              
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-3 bg-slate-800/90 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl overflow-hidden z-10 min-w-[120px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <button
                      onClick={handleDelete}
                      className="relative w-full px-4 py-3 text-left text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-all duration-200 text-sm font-medium backdrop-blur-sm"
                    >
                      Delete Post
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        {post.caption && (
          <div className="px-6 pb-4 relative">
            <div className="relative p-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
              <div
                ref={textRef}
                className="relative text-slate-100 leading-relaxed prose prose-invert prose-sm max-w-none"
              >
                {renderContent(displayCaption || "")}
              </div>
            </div>
            
            {shouldShowReadMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`mt-3 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 backdrop-blur-sm border ${postData.color} ${postData.hoverColor} hover:scale-105 bg-slate-700/40 hover:bg-slate-600/50 border-slate-600/40 hover:border-slate-500/60`}
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Media */}
        {post.image && (
          <div className="relative mx-6 mb-4">
            <div className="aspect-video bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/30 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none z-10" />
              {"vid" in post && post.vid ? (
                <div className="relative group">
                  <video
                    className="w-full h-full object-cover"
                    controls
                    poster={post.imgThumbnail}
                  >
                    <source src={post.image} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <Play className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Image
                    src={post.image}
                    alt="Post content"
                    width={800}
                    height={600}
                    className={`w-full h-full object-cover transition-all duration-700 rounded-xl ${
                      isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                    onLoad={() => setIsImageLoaded(true)}
                    placeholder="blur"
                    blurDataURL={post.imgThumbnail || "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="}
                  />
                  {/* Loading placeholder */}
                  {!isImageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm animate-pulse flex items-center justify-center rounded-xl">
                      <div className="w-12 h-12 border-4 border-slate-500/50 border-t-slate-300 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-600/30 bg-slate-800/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                isLiked 
                  ? "text-red-300 hover:text-red-200 scale-105 bg-red-500/20 border-red-400/30 hover:border-red-300/50" 
                  : "text-slate-300 hover:text-red-300 hover:scale-105 hover:bg-red-500/10 border-slate-600/30 hover:border-red-400/30"
              }`}
            >
              <Heart className={`w-5 h-5 transition-all duration-300 ${isLiked ? "fill-current drop-shadow-sm" : "hover:fill-red-300/50"}`} />
              <span className="font-medium text-sm">{likeCount}</span>
              {isLiked && <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10 rounded-full pointer-events-none" />}
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-600/30 text-slate-300 hover:text-blue-300 hover:bg-blue-500/10 hover:border-blue-400/30 transition-all duration-300 hover:scale-105">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>

            <button className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-sm border border-slate-600/30 text-slate-300 hover:text-green-300 hover:bg-green-500/10 hover:border-green-400/30 transition-all duration-300 hover:scale-105">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          {/* Likes Preview */}
          {post.likes && post.likes.length > 0 && (
            <button
              onClick={() => setLikesModalOpen(true)}
              className="relative flex -space-x-2 hover:scale-110 transition-all duration-300 p-1 rounded-full hover:bg-slate-700/30 backdrop-blur-sm"
            >
              {post.likes.slice(0, 3).map((like, index) => (
                <div key={index} className="relative">
                  <Image
                    src={like.image || "/default-avatar.png"}
                    alt={like.name}
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-slate-800/80 object-cover hover:border-slate-600/80 transition-colors duration-300 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                </div>
              ))}
              {post.likes.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-slate-800/80 bg-slate-700/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-slate-600/80 transition-colors duration-300">
                  <span className="text-xs text-slate-200 font-medium">+{post.likes.length - 3}</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Likes Modal */}
      <Dialog open={likesModalOpen} onOpenChange={setLikesModalOpen}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-2xl border border-slate-600/50 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-lg pointer-events-none" />
          <DialogHeader className="relative">
            <DialogTitle className="text-slate-100 text-lg font-semibold">Liked by</DialogTitle>
          </DialogHeader>
          <div className="relative max-h-96 overflow-y-auto space-y-2 pr-2">
            {post.likes?.map((like, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-transparent hover:border-slate-600/30"
              >
                <div className="relative">
                  <Image
                    src={like.image || "/default-avatar.png"}
                    alt={like.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover ring-2 ring-slate-600/50"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                </div>
                <span className="text-slate-200 font-medium">{like.name}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PostCard;