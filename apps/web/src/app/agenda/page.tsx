"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sendMessageWithFallback } from "@/services/chat";
import { getRecommendedPeers } from "@/services/profile";
import { ProfileDTO } from "@repo/shared-types";
import {
  GraduationCap,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Send,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 5;

export default function AgendaPage() {
  const { status } = useSession();
  const [peers, setPeers] = useState<ProfileDTO[] | undefined | null>(
    undefined
  );
  const [page, setPage] = useState(1);

  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const result = await getRecommendedPeers();
        setPeers(result.data);
      } catch (error) {
        console.error(error);
        setPeers(null);
      }
    };
    fetchPeers();
  }, []);

  const paginatedPeers = useMemo(() => {
    if (!peers) return [];
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return peers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [peers, page]);

  const totalPages = peers ? Math.ceil(peers.length / ITEMS_PER_PAGE) : 0;

  const handleSendMessage = async (recipientId: string) => {
    if (!messageText.trim()) return;
    setIsSending(true);
    try {
      await sendMessageWithFallback({
        content: messageText,
        receiverId: recipientId,
      });
      toast.success("Message sent successfully!");
      setMessageText("");
      setActiveMessageId(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (peers === undefined || status === "loading") {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    );
  }

  if (!peers || status === "unauthenticated") return null;

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1 rounded-full">
          AI Matchmaking
        </Badge>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          Student Agenda
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          {
            "We've analyzed your bio and interests to find the most relevant peers on campus."
          }
        </p>
      </div>

      <div className="grid gap-4">
        {paginatedPeers.length > 0 ? (
          paginatedPeers.map((peer) => (
            <Card
              key={peer.id}
              className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                  {/* Avatar Section */}
                  <div className="relative w-24 h-24 shrink-0">
                    <Image
                      src={peer.image || "/default-avatar.png"}
                      alt={peer.name || ""}
                      fill
                      className="rounded-2xl object-cover ring-4 ring-slate-50"
                    />
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 text-center md:text-left space-y-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {peer.name}
                    </h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {peer.degree || "Independent Student"}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {peer.studyLevel || "Undergraduate"}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-1 mt-2 italic">
                      &quot;{peer.biography || "No bio available..."}&quot;
                    </p>
                  </div>

                  {/* Action Section / Inline Input */}
                  <div className="w-full md:w-auto min-w-70">
                    {activeMessageId === peer.id ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <Input
                          autoFocus
                          placeholder="Write a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSendMessage(peer.id)
                          }
                          className="rounded-xl border-slate-200 h-11"
                        />
                        <Button
                          size="icon"
                          onClick={() => handleSendMessage(peer.id)}
                          disabled={isSending || !messageText.trim()}
                          className="bg-blue-600 hover:bg-blue-700 rounded-xl shrink-0 h-11 w-11"
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setActiveMessageId(null);
                            setMessageText("");
                          }}
                          className="rounded-xl shrink-0 h-11 w-11 text-slate-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center md:justify-end">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-xl border-slate-200 h-11"
                        >
                          <Link href={`/profile/${peer.id}`}>View Profile</Link>
                        </Button>
                        <Button
                          onClick={() => setActiveMessageId(peer.id)}
                          className="bg-slate-900 hover:bg-black text-white rounded-xl h-11 px-6 flex gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed">
            <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">
              No matches found. Try updating your bio!
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {peers.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-6 pt-4">
          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() => {
              setPage((p) => p - 1);
              setActiveMessageId(null);
            }}
            className="rounded-xl font-semibold text-slate-600"
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPage(i + 1);
                  setActiveMessageId(null);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  page === i + 1 ? "bg-blue-600 w-4" : "bg-slate-300"
                }`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => {
              setPage((p) => p + 1);
              setActiveMessageId(null);
            }}
            className="rounded-xl font-semibold text-slate-600"
          >
            Next →
          </Button>
        </div>
      )}
    </main>
  );
}
