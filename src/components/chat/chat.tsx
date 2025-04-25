"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { type SingleChat } from "@/types/types";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/store";

const Chat = ({ _id, partner, lastMessage }: SingleChat) => {
  const pathName = usePathname();
  const { setCurrentChat } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [displayMessage, setDisplayMessage] = useState("");

  useEffect(() => {
    if (pathName.includes(_id)) {
      setCurrentChat({ _id, partner, lastMessage });
    }
  }, [_id, lastMessage, partner, pathName, setCurrentChat]);

  const truncateMessage = useCallback(() => {
    if (!containerRef.current || !measureRef.current) return;

    const containerWidth = containerRef.current.getBoundingClientRect().width;
    const originalMessage = lastMessage
      ? lastMessage.sender._id === partner._id
        ? `From: ${lastMessage.content}`
        : `You: ${lastMessage.content}`
      : "You are now connected";

    measureRef.current.style.width = "auto";
    measureRef.current.innerText = originalMessage;

    if (measureRef.current.getBoundingClientRect().width <= containerWidth) {
      setDisplayMessage(originalMessage);
      return;
    }

    let left = 0;
    let right = originalMessage.length;
    let optimalLength = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      measureRef.current.innerText = originalMessage.slice(0, mid) + "...";
      const currentWidth = measureRef.current.getBoundingClientRect().width;

      if (currentWidth <= containerWidth) {
        optimalLength = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    setDisplayMessage(originalMessage.slice(0, optimalLength) + "...");
  }, [lastMessage, partner._id]);

  useEffect(() => {
    truncateMessage();

    const resizeObserver = new ResizeObserver(() => {
      truncateMessage();
    });

    const currentContainer = containerRef.current;

    if (currentContainer) {
      resizeObserver.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
    };
  }, [truncateMessage]);

  return (
    <Link
      href={`/chat/${_id}`}
      className={cn(
        "w-full h-full p-3 mb-1.5 flex border border-gray-200/50 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 ease-in-out",
        pathName === `/chat/${_id}` && "bg-gray-100 border-gray-300"
      )}
    >
      <div className="flex-1">
        <div className="flex items-center">
          <div className="size-11 rounded-full relative flex items-center justify-center overflow-hidden border">
            {partner.avatarUrl ? (
              <Image
                src={partner.avatarUrl}
                alt={`${partner.name}'s avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <User />
            )}
          </div>
          <div ref={containerRef} className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-gray-900">{partner.name}</p>
            <p
              className="mt-1 text-sm text-gray-500"
              style={{ whiteSpace: "nowrap" }}
            >
              {displayMessage}
            </p>
            <span
              ref={measureRef}
              style={{
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "nowrap",
              }}
            ></span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Chat;
