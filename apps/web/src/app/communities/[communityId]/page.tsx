"use client";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Components
import { CommunityChat } from "@/components/communities/CommunityChat";
import { CommunityEvents } from "@/components/communities/CommunityEvents";
import { CommunityHeader } from "@/components/communities/CommunityHeader";
import { CommunityMembers } from "@/components/communities/CommunityMembers";
import { CommunitySettingsModal } from "@/components/communities/CommunitySettingsModal";
import { PrivateAccessView } from "@/components/communities/PrivateAccessView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Services
import { PublicJoinView } from "@/components/communities/PublicJoinView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCommunityById,
  hasRequested,
  joinCommunity,
  sendJoinRequest,
} from "@/services/communities";
import { CommunityDTO } from "@repo/shared-types";
import Link from "next/link";

export default function CommunityPage({
  params,
}: {
  params: Promise<{ communityId: string }>;
}) {
  const { status, data: session } = useSession();
  const [community, setCommunity] = useState<CommunityDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRequested, setIsRequested] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    const init = async () => {
      try {
        const { communityId } = await params;
        const result = await getCommunityById(communityId);
        const communityData = result.data || null;
        setCommunity(communityData);

        // Check if user has a pending request if not a member and community is private
        if (communityData && session?.user.id) {
          const isMember = communityData.members.some(
            (m) => m.userId === session.user.id
          );
          if (!isMember && communityData.mode === "private") {
            const result = await hasRequested(communityId);
            setIsRequested(result.data);
          }
        }
      } catch (error) {
        console.error(error);
        setCommunity(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params, session?.user.id]);

  const handleInstantJoin = async () => {
    if (!community) return;
    try {
      await joinCommunity(community.id);
      toast.success("Welcome to the community!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to join");
    }
  };

  const handleRequestJoin = async (message: string) => {
    if (!community) return;
    try {
      await sendJoinRequest(community.id, message);
      setIsRequested(true);
      toast.info("Join request sent!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send request");
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    );
  }

  if (!community || !session) {
    return (
      <div className="min-h-[80vh] w-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
          <div className="h-2 bg-red-500" />
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 rotate-3">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Community Not Found
            </h2>

            <p className="text-slate-500 mb-8 leading-relaxed">
              {
                "The community you are looking for doesn't exist, has been deleted, or you don't have the required permissions to view it."
              }
            </p>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold transition-all shadow-lg shadow-slate-200"
              >
                <Link href="/communities">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Communities
                </Link>
              </Button>

              <Button
                asChild
                variant="ghost"
                className="w-full h-12 rounded-xl text-slate-500 hover:text-slate-900"
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberData = community.members.find(
    (m) => m.userId === session.user.id
  );
  const isAdmin =
    memberData?.role === "admin" || memberData?.role === "moderator";
  const isPrivate = community.mode === "private";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <CommunityHeader
        community={community}
        isAdmin={isAdmin}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* CASE 1: NOT A MEMBER */}
        {!memberData ? (
          isPrivate ? (
            <PrivateAccessView
              community={community}
              isRequested={isRequested}
              onRequestJoin={handleRequestJoin}
            />
          ) : (
            <PublicJoinView community={community} onJoin={handleInstantJoin} />
          )
        ) : (
          /* CASE 2: IS A MEMBER - SHOW TABS */
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <div className="sticky top-20 z-20 bg-slate-50/80 backdrop-blur-md py-2">
              <TabsList className="bg-white border shadow-sm rounded-2xl h-14 p-1 w-full md:w-auto">
                <TabsTrigger
                  value="chat"
                  className="rounded-xl px-2 lg:px-8 h-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Chat
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="rounded-xl px-2 lg:px-8 h-full"
                >
                  <Calendar className="w-4 h-4 mr-2" /> Events
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="rounded-xl px-2 lg:px-8 h-full"
                >
                  <Users className="w-4 h-4 mr-2" /> Members
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="focus-visible:ring-0">
              <CommunityChat
                initialMessages={community.chat}
                communityId={community.id}
                member={memberData}
              />
            </TabsContent>

            <TabsContent value="events" className="focus-visible:ring-0">
              <CommunityEvents
                events={community.events}
                communityId={community.id}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent value="members" className="focus-visible:ring-0">
              <CommunityMembers
                members={community.members}
                requests={community.joinRequests}
                isAdmin={isAdmin}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <CommunitySettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        community={community}
      />
    </div>
  );
}
