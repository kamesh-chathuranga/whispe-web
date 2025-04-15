"use client";

import React, { useEffect, useState } from "react";
import UserCard from "./user-card";
import { useStore } from "@/store";
import { ScrollArea } from "../ui/scroll-area";
import { UserPlus } from "lucide-react";
import API from "@/lib/axios";

interface Person {
  id: string;
  name: string;
  image?: string;
}

const UserCardContainer = () => {
  const { currentUser } = useStore();
  const [profilesCollection, setProfileCollection] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!currentUser?.id) return;
        setIsLoading(true);
        const response = await API.get("/users");
        setProfileCollection(response.data);
      } catch (error) {
        console.error("Error fetching people:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentUser?.id]);

  const content = isLoading ? (
    <p>Loading...</p>
  ) : (
    <div className="flex flex-wrap gap-4 h-full ">
      {profilesCollection.map((profile, i) => (
        <UserCard
          key={i}
          name={profile.name}
          imageUrl={profile.image || "/sample.jpg"}
          text="Add Friend"
          icon={<UserPlus />}
          onClick={() => console.log("Add Friend clicked")}
        />
      ))}
    </div>
  );

  return <ScrollArea className="h-full pb-14 pt-4">{content}</ScrollArea>;
};

export default UserCardContainer;
