"use client";

import React, { useEffect, useState } from "react";
import UserCard from "./user-card";
import { useStore } from "@/store";
import { ScrollArea } from "../ui/scroll-area";
import { UserPlus } from "lucide-react";
import axios from "axios";

interface Person {
  id: string;
  name: string | null;
  image: string | null;
  email: string | null;
}

const UserCardContainer = () => {
  const { currentUser } = useStore();
  const [profilesCollection, setProfileCollection] = useState<Person[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!currentUser?.id) return;
        
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/users`,
          { data: { userId: "vvvvvvv" } }
        );

        // setProfileCollection(response);
      } catch (error) {
        console.error("Error fetching people:", error);
      }
    })();
  }, [currentUser?.id]);

  return (
    <ScrollArea className="h-full pb-14 pt-4">
      <div className="flex flex-wrap gap-4 h-full ">
        {Array.from({ length: 15 }, (_, index) => (
          <UserCard
            key={index}
            name="Kamesh Chathuranga"
            imageUrl="/sample.jpg"
            text="Add Friend"
            icon={<UserPlus />}
            onClick={() => console.log("Add Friend clicked")}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default UserCardContainer;
