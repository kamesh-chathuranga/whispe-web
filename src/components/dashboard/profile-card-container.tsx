"use client";

import React, { useEffect, useState } from "react";
import ProfileCard from "./profile-card";
import { ScrollArea } from "../ui/scroll-area";
import { UserPlus } from "lucide-react";
import API from "@/lib/axios";
import { Person } from "@/types/types";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const ProfileCardContainer = () => {
  const [profilesCollection, setProfileCollection] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await API.get("/users");
        setProfileCollection(response.data);
      } catch (error) {
        console.error("Error fetching people:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      const response = await API.post("/friend-requests", { receiverId });
      toast.success(response.data.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("Failed to send friend request. Try again!");
      }
    }
  };

  const content = isLoading ? (
    <p>Loading...</p>
  ) : (
    <div className="flex flex-wrap gap-4 h-full ">
      {profilesCollection.map((profile) => (
        <ProfileCard
          key={profile._id}
          id={profile._id}
          name={profile.name}
          imageUrl={profile.avatarUrl}
          text="Add Friend"
          icon={<UserPlus />}
          onClick={(userId: string) => handleSendFriendRequest(userId)}
        />
      ))}
    </div>
  );

  return <ScrollArea className="h-full pb-14 pt-4">{content}</ScrollArea>;
};

export default ProfileCardContainer;
