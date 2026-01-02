"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/context/ChatContext";
import { useProfile } from "@/context/ProfileContext";
import { sendMessage } from "@/services/chat";
import { format, isToday, isYesterday } from "date-fns";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  MoreVertical,
  Send,
  Smile,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function InboxPage() {
  const params = useParams();
  const chatId = params.id as string;

  const { profile } = useProfile();
  const { chats, socket, setIsSidebarOpen } = useChat();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChatData = useMemo(() => {
    return chats?.find((c) => c.id === chatId);
  }, [chats, chatId]);

  useEffect(() => {
    if (socket && chatId) {
      socket.emit("join_chat", chatId);
    }
  }, [socket, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatData?.messages]);

  if (!profile) return;

  const handleSendMessage = async () => {
    if (!message.trim() || isSubmitting) return;

    const content = message;
    setMessage("");
    setIsSubmitting(true);

    try {
      await sendMessage({
        chatId,
        content,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
      setMessage(content);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedChatData && chats !== undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Chat not found
      </div>
    );
  }

  if (chats === undefined || selectedChatData === undefined)
    return (
      <div>
        <Loader2 className="animate-spin" />
      </div>
    );

  const otherParticipant = selectedChatData.participants.find(
    (p) => p.user.id !== profile.id
  );

  return (
    <div className="flex-1 h-full flex flex-col bg-gray-50 overflow-hidden">
      {selectedChatData ? (
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    src={
                      // chat.avatar ||
                      otherParticipant?.user.image || "/placeholder.png"
                    }
                    alt={
                      // chat.avatar
                      //   ? "Chat Avatar"
                      otherParticipant?.user.name
                    }
                  />
                </Avatar>
                {/* {selectedChatData?.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )} */}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {otherParticipant?.user.name}
                </h2>
                {/* <p className="text-xs text-gray-500">
                    {selectedChatData?.online ? "Active now" : "Offline"}
                  </p> */}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4 overflow-hidden">
            <div className="space-y-4 py-4 px-4 mx-auto">
              {selectedChatData.messages.map((msg, i) => {
                const msgDate = new Date(msg.createdAt);

                // Separator logic
                const prevMsg = selectedChatData.messages[i - 1];
                const prevDate = prevMsg ? new Date(prevMsg.createdAt) : null;

                const shouldShowDateSeparator =
                  !prevDate ||
                  msgDate.toDateString() !== prevDate.toDateString();

                // Human-friendly label
                let dateLabel;
                if (isToday(msgDate)) {
                  dateLabel = "Today";
                } else if (isYesterday(msgDate)) {
                  dateLabel = "Yesterday";
                } else {
                  dateLabel = format(msgDate, "dd/MM/yyyy");
                }

                return (
                  <div key={msg.id}>
                    {/* Date separator */}
                    {shouldShowDateSeparator && (
                      <div className="flex justify-center my-4">
                        <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full">
                          {dateLabel}
                        </span>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`flex ${
                        msg.senderId === profile.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.senderId === profile.id
                            ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                            : "bg-white text-gray-900 rounded-bl-none shadow-sm"
                        }`}
                      >
                        {/* Product Reference Card */}
                        {msg.productRef && (
                          <Link
                            href={`/marketplace/${msg.productRef.id}`}
                            className="block mb-2 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-gray-100">
                                <Image
                                  src={msg.productRef.photos[0]}
                                  alt={msg.productRef.name}
                                  width={64}
                                  height={64}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {msg.productRef.name}
                                  </h4>
                                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-600 shrink-0" />
                                </div>
                                <p className="text-lg font-bold text-blue-600 mt-1">
                                  ${msg.productRef.price}
                                </p>
                              </div>
                            </div>
                          </Link>
                        )}

                        {/* Event Reference Card */}
                        {/* {msg.eventRef && (
                            <Link
                              href={`/community/${msg.eventRef.community.id}/events/${msg.eventRef.id}`}
                              className="block mb-2 bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-all group"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-1">
                                      {msg.eventRef.title}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      from{" "}
                                      <span className="font-medium">
                                        {msg.eventRef.community.name}
                                      </span>
                                    </p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 shrink-0" />
                                </div>

                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-blue-600" />
                                    <span>
                                      {formatEventDate(msg.eventRef.date)}
                                    </span>
                                  </div>
                                  {!msg.eventRef.all_day &&
                                    msg.eventRef.start_time && (
                                      <div className="flex items-center gap-1">
                                        <span>•</span>
                                        <span>
                                          {formatEventTime(
                                            msg.eventRef.start_time
                                          )}
                                        </span>
                                      </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  {msg.eventRef.location_format === "online" ? (
                                    <>
                                      <Globe className="w-3 h-3 text-green-600" />
                                      <span>Online Event</span>
                                    </>
                                  ) : (
                                    <>
                                      <MapPin className="w-3 h-3 text-blue-600" />
                                      <span className="truncate">
                                        {msg.eventRef.location}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Link>
                          )} */}

                        {/* Message Bubble */}
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.senderId === profile.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {format(msgDate, "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  className="pr-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <Smile className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        // Empty State
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-linear-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Messages
            </h2>
            <p className="text-gray-600 mb-6">
              Select a conversation from the list to start messaging
            </p>
            <Button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              View Conversations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
