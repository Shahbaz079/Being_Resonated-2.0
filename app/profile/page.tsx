'use client'


import { useState, Suspense,useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUser, useSession } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdOutlineModeEditOutline } from "react-icons/md";
import Layout from "@/components/customLayouts/Layout";
import LoadingAnimation from "@/components/loadingAnimation/loadingAnimation";
import PostCard from "@/components/eventCard/PostCard";
import WhatsOnUserMind from "@/components/WhatsOnYourMInd/WhatsOnUserMind";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Form from "./form";
import { Card, CardHeader } from "@/components/ui/card";
import AllInterests from "./allInterests";
import "./user.css";
import { SlOptions } from "react-icons/sl";

const fetchUser = async (id: string) => {
  const res = await fetch(`/api/user?id=${id}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

const ProfilePage = () => {
  const params = useSearchParams();
  const id = params.get("id") as string;
 
  const { user } = useUser();
  const ownerId = user?.publicMetadata.mongoId;
  const queryClient = useQueryClient();

  const [edit, setEdit] = useState(false);
  const [owner,setOwner]=useState(false);
  const [showAllInterests, setShowAllInterests] = useState(false);

  // Fetch user data with caching
  const {
    data: userData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  
    enabled: !!id, // only fetch if ID exists
    refetchOnWindowFocus: false, // disable refetch on window focus
    
  });

  useEffect(() => {
    // Check if the current user is the owner of the profile
    if (user && user.publicMetadata.mongoId === id) {
      setOwner(true);
    } else {
      setOwner(false);
    }
  },[])

  // Mutation to update profile
  const updateMutation = useMutation({
    mutationFn: async ({
      changedInterests,
      changedDescription,
    }: {
      changedInterests: string[];
      changedDescription: string;
    }) => {
      const res = await fetch(`/api/user?id=${ownerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData?.email,
          interests: changedInterests,
          dob: userData?.dob,
          image: user?.imageUrl,
          description: changedDescription,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["user", id],
       (old: any) => ({
        ...old,
        interests: updatedData.interests,
        dob: updatedData.dob,
        description: updatedData.description,
      }));
      queryClient.invalidateQueries({queryKey:['similarPeople',ownerId]})
      setEdit(false);
    },
    onError: (err) => console.error(err),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center p-2">
          <div className="mt-44">
            <LoadingAnimation />
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !userData) {
    return <div>Error loading user data</div>;
  }

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center p-2">
        {owner && !edit && (
          <button
            onClick={() => setEdit(true)}
            className="absolute top-[15vh] right-[10vw] w-8 h-8 bg-transparent rounded-full z-[900]"
          >
            <MdOutlineModeEditOutline className="w-6 h-6" />
          </button>
        )}

        <div className="animate-slide-top glass rounded-xl w-full text-gray-300 h-fit mt-[10vh] flex flex-col max-w-[600px] items-center py-2">
          <div className="w-[120px] h-[120px] mt-3 relative">
            {userData?.image && (
              <Image className="rounded-full" alt={userData.name} src={userData.image} layout="fill" />
            )}
          </div>

          <div className="w-fit flex flex-col">
            <div className="text-5xl capitalize text-center text-cyan-200 font-semibold mt-3">
              {userData?.name}
            </div>
            <p className="mt-3 text-lg text-center">{userData?.gradYear || null}</p>

            <div className="w-full flex p-2">
              {userData?.interests?.length ? (
                <div className="gap-3 flex mt-7 flex-wrap justify-center w-full">
                  {userData.interests.slice(0, 4).map((interest: string, index: number) => (
                    <InterestTag key={index} interest={interest} />
                  ))}
                  {userData.interests.length > 4 && (
                    <ShowMoreInterestTag setShowAllInterests={setShowAllInterests} />
                  )}
                </div>
              ) : (
                <p className="mt-5 text-gray-400">No interests selected yet!</p>
              )}
            </div>

            <p className="mt-5 text-center">{userData?.description}</p>

            {owner && (
              <Link href={`/teamcreate?id=${id}`} className="bg-green-700 px-4 py-2 w-fit mx-auto rounded-lg my-3 mt-5">
                Create Team
              </Link>
            )}
          </div>
        </div>

        <Card className="animate-slide-top bg-transparent border-0 w-full mt-7 p-0">
          <CardHeader className="p-0">
            <Tabs defaultValue="Posts">
              <TabsList className="flex items-center justify-center bg-transparent flex-wrap h-auto space-y-1">
                <TabsTrigger value="Posts" className="text-lg">Posts</TabsTrigger>
                {owner && <TabsTrigger value="Participations" className="text-lg">Participations</TabsTrigger>}
              </TabsList>

              <TabsContent value="Posts">
                <div>
                  {owner && <WhatsOnUserMind />}
                  {userData?.posts?.map((userPost: any,index:number) => (
                    <PostCard key={`${index}-userPost._id`} post={{ ...userPost, user: { image: userData.image } }} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {showAllInterests && (
          <AllInterests
            interests={userData?.interests || []}
            name={userData?.name}
            setShowAllInterests={setShowAllInterests}
          />
        )}

        <Dialog open={edit} onOpenChange={setEdit}>
          <DialogContent className="bg-slate-950 bg-opacity-85">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <Form
              currentUserDescription={userData?.description}
              currentInterests={userData?.interests || []}
              handleUpdate={(interests, desc) =>
                updateMutation.mutate({ changedInterests: interests, changedDescription: desc })
              }
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

const ProfilePageWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ProfilePage />
  </Suspense>
);

export default ProfilePageWithSuspense;


const InterestTag = ({ interest }: { interest: string }) => (
  <div className="border-2 w-fit py-1 px-2 rounded-2xl text-sm bg-[#332A2A] border-red-400">{interest}</div>
);

const ShowMoreInterestTag = ({ setShowAllInterests }: { setShowAllInterests: React.Dispatch<React.SetStateAction<boolean>> }) => (
  <div onClick={() => setShowAllInterests(true)} className="border-2 bg-[#332A2A] cursor-pointer border-red-400 font-extrabold px-2 rounded-2xl">
    <SlOptions />
  </div>
);


