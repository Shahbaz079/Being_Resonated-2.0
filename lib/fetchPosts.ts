import { EventPost } from "@/app/becommunity/page";
import ITeam from "@/models/Team";
import { UserPost } from "@/components/eventCard/PostCard";

export const fetchEventPosts = async ({ page = 1, limit = 2 }):Promise<EventPost[]>=> {
  const res = await fetch(`/api/eventpost?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch event posts");
  return res.json();
};

export const fetchUserPosts = async ({ page = 1, limit = 2 }):Promise<UserPost[]> => {
  const res = await fetch(`/api/userpost?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch user posts");
  return res.json();
};

export const fetchTeamPosts = async ({ page = 1, limit = 2 }) => {
  const res = await fetch(`/api/teampost?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch team posts");
  return res.json();
};

export const fetchTopTeams = async ():Promise<ITeam[]> => {
  const res = await fetch(`/api/team?type=topTeams`);
  if (!res.ok) throw new Error("Failed to fetch top teams");
  return res.json();
};
