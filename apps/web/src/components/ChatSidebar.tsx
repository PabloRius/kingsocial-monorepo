"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/context/ChatContext";
import { useProfile } from "@/context/ProfileContext";
import { formatChatTimestamp } from "@/lib/formatters";
import { Loader2, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";

export function ChatSidebar() {
  const { profile } = useProfile();
  const { chats, isSidebarOpen, setIsSidebarOpen } = useChat();
  const { id: activeChatId } = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats?.filter((chat) => {
    const otherParticipantsNames = chat.participants
      .filter((p) => p.user.id !== profile?.id)
      .map((p) => p.user.name?.toLowerCase() || "")
      .join(" ");

    const lastMessageContent =
      chat.messages.at(-1)?.content.toLowerCase() || "";

    const search = searchQuery.toLowerCase();

    return (
      otherParticipantsNames.includes(search) ||
      lastMessageContent.includes(search)
    );
  });

  if (filteredChats === null || !profile) return;

  return (
    <div
      className={`${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed md:relative md:translate-x-0 z-40 w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 transition-transform duration-300 h-full flex flex-col`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredChats === undefined ? (
          <div className="flex flex-1 w-full h-full items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                router.push(`/inbox/${chat.id}`);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`flex flex-row gap-4 items-center w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                activeChatId === chat.id
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : ""
              }`}
            >
              <div className="relative shrink-0">
                <Avatar>
                  <AvatarImage
                    src={
                      // chat.avatar ||
                      chat.participants.find((p) => p.user.id !== profile.id)
                        ?.user.image || "/placeholder.svg"
                    }
                    alt={
                      // chat.avatar
                      //   ? "Chat Avatar"
                      chat.participants
                        .filter((p) => p.user.id !== profile.id)
                        .map((p) => p.user.name)
                        .join(", ")
                    }
                  />
                </Avatar>

                {/* {chat.online && (
    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
  )} */}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {chat.participants
                      .filter((p) => p.user.id !== profile.id)
                      .map((p) => p.user.name)
                      .join(", ")}
                  </h3>
                  <span className="text-xs text-gray-500 shrink-0">
                    {chat.messages.at(-1)?.createdAt
                      ? formatChatTimestamp(
                          new Date(chat.messages.at(-1)!.createdAt)
                        )
                      : ""}
                  </span>
                </div>
                {chat.messages.length > 0 && (
                  <div className="flex items-left justify-between min-w-0">
                    <p className="text-sm text-gray-600 truncate">
                      {(() => {
                        const lastMessage = chat.messages.at(-1);
                        if (!lastMessage) return "";

                        const senderId = lastMessage.senderId;
                        const senderName = chat.participants.find(
                          (p) => p.user.id === senderId
                        )?.user.name;
                        const isFromLoggedUser = senderId === profile.id;

                        if (isFromLoggedUser) {
                          return `You: ${lastMessage.content}`;
                        }

                        if (chat.participants.length === 2) {
                          // One-to-one chat → just show content
                          return lastMessage.content;
                        }

                        // Group chat → show name: content
                        return `${senderName || "Unknown"}: ${
                          lastMessage.content
                        }`;
                      })()}
                    </p>

                    {/* {chat.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )} */}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
