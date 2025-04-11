"use client";

import { useEffect } from "react";
import { Session } from "next-auth";
import { useStore } from "@/store";
import { User } from "@/types/types";
import axios from "axios";
import { ObjectId } from "mongoose";

interface SyncUserStoreProps {
  session: Session | null;
}

const SyncUserStore = ({ session }: SyncUserStoreProps) => {
  const { setCurrentUser } = useStore();

  useEffect(() => {
    (async () => {
      if (session && session?.user && session.user.id) {
        try {
          const { data, status } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${session.user.id}`
          );

          if (!data || status !== 200) {
            setCurrentUser(null);
          }

          const user: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatarUrl: data.avatarUrl,
            isOnline: data.isOnline,
            lastSeen: data.lastSeen,
            friends: data.friends.map((friend: ObjectId) => friend.toString()),
          };

          setCurrentUser(user);
        } catch (error) {
          console.log("Error fetching user data:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    })();
  }, [session, setCurrentUser]);

  return null;
};

export default SyncUserStore;
