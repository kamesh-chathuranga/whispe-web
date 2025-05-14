/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import ProfileCard from "./profile-card";
import { UserRoundX } from "lucide-react";
import { SentFriendRequest } from "@/types/types";
import API from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

const SentRequestCardContainer = () => {
  const [sentFriendRequests, setSentFriendRequests] = useState<
    SentFriendRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await API.get("/friend-requests/sent");
        const requests: SentFriendRequest[] = response.data.map(
          (request: any) => ({
            id: request._id,
            receiverName: request.receiver.name,
            receiverImageUrl: request.receiver?.avatarUrl,
          })
        );

        setSentFriendRequests(requests);
      } catch (error) {
        console.error("Error fetching people:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleCancelFriendRequest = async (requestId: string) => {
    try {
      const response = await API.delete(`/friend-requests/${requestId}/cancel`);
      setSentFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
      toast.success(response.data.message);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      } else {
        toast.error("Failed to cancel friend request. Try again!");
      }
    }
  };

  const content = isLoading ? (
    <p>Loading...</p>
  ) : (
    <div className="flex flex-wrap gap-4 h-full ">
      {sentFriendRequests.map((request) => (
        <ProfileCard
          key={request.id}
          id={request.id}
          name={request.receiverName}
          imageUrl={request.receiverImageUrl}
          text="Cancel Request"
          icon={<UserRoundX />}
          onClick={(requestId: string) => handleCancelFriendRequest(requestId)}
        />
      ))}
    </div>
  );

  return <ScrollArea className="h-full pb-14 pt-4">{content}</ScrollArea>;
};

export default SentRequestCardContainer;
