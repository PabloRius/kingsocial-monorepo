"use client";
import CommunityCard from "@/components/CommunityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  getAllCommunities,
  getOwnCommunities,
  joinCommunity,
  sendJoinRequest,
} from "@/services/communities";
import { CommunityDTO } from "@repo/shared-types";
import { Loader2, Plus, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CommunitiesPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  const [userCommunities, setUserCommunities] = useState<
    CommunityDTO[] | undefined | null
  >(undefined);
  useEffect(() => {
    const fetchUserCommunities = async () => {
      try {
        const result = await getOwnCommunities();
        setUserCommunities(result.data || null);
      } catch (error) {
        console.error(error);
        setUserCommunities(null);
      }
    };
    fetchUserCommunities();
  }, []);
  const [allCommunities, setAllCommunities] = useState<
    CommunityDTO[] | undefined | null
  >(undefined);
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const result = await getAllCommunities();
        setAllCommunities(result.data || null);
      } catch (error) {
        console.error(error);
        setAllCommunities(null);
      }
    };
    fetchCommunities();
  }, []);
  const [selectedCommunity, setSelectedCommunity] =
    useState<CommunityDTO | null>(null);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  const handleJoinClick = (community: CommunityDTO) => {
    setSelectedCommunity(community);
    setShowJoinModal(true);
  };

  const handleJoinConfirm = async () => {
    if (!selectedCommunity) return;

    try {
      if (selectedCommunity.mode === "public") {
        await joinCommunity(selectedCommunity.id);
        toast.success(`You’ve joined ${selectedCommunity.name}!`);
      } else {
        await sendJoinRequest(selectedCommunity.id, joinMessage);
        toast.info(`Request sent to ${selectedCommunity.name} moderators.`);
      }

      setShowJoinModal(false);
      setJoinMessage("");
      router.push(`communities/${selectedCommunity.id}`);
    } catch (err) {
      toast.error("Something went wrong while joining the community.");
      console.error(err);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !session) return null;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-slate-900 py-16 mb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Communities
              </h1>
              <p className="text-slate-400 text-lg">
                Connect, collaborate, and grow with your fellow students.
              </p>
            </div>
            <Link href="/communities/create">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 px-8 text-lg shadow-lg shadow-blue-900/20"
              >
                <Plus className="mr-2 h-5 w-5" /> Start a Community
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-16">
          {/* 2. SECTION: MY COMMUNITIES (Horizontal Scroll or Grid) */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-600 rounded-full" />
                Your Active Hubs
              </h2>
              <Badge
                variant="outline"
                className="rounded-full px-4 border-slate-200 bg-white shadow-sm"
              >
                {userCommunities?.length || 0} Joined
              </Badge>
            </div>

            {userCommunities && userCommunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userCommunities.map((c) => (
                  <CommunityCard
                    key={c.id}
                    community={c}
                    variant="my"
                    role={
                      c.members.find((m) => m.userId === session.user.id)?.role
                    }
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-transparent py-12">
                <CardContent className="flex flex-col items-center text-center">
                  <Users className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="text-slate-500">
                    {"You haven't joined any communities yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* 3. SECTION: DISCOVER */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-1 h-8 bg-purple-600 rounded-full" />
                Explore the Campus
              </h2>
              {/* Search / Filter bar would go here later */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCommunities?.map((c) => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  variant="discover"
                  isMember={userCommunities?.some((uc) => uc.id === c.id)}
                  onJoinClick={handleJoinClick}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md">
          {selectedCommunity && selectedCommunity.mode === "public" ? (
            <>
              <DialogHeader>
                <DialogTitle>Join {selectedCommunity.name}?</DialogTitle>
                <DialogDescription>
                  This is a public community. You can join immediately or visit
                  its page first.
                </DialogDescription>
              </DialogHeader>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline">
                  <Link href={`/communities/${selectedCommunity.id}`}>
                    View Community
                  </Link>
                </Button>
                <Button
                  className="bg-linear-to-r from-celestial-blue to-picton-blue"
                  onClick={handleJoinConfirm}
                >
                  Join Now
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  Request to Join {selectedCommunity?.name}
                </DialogTitle>
                <DialogDescription>
                  This community is private. Send a request with a short message
                  to the moderators.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3">
                <Textarea
                  placeholder="Write a short message..."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-linear-to-r from-celestial-blue to-picton-blue"
                    onClick={handleJoinConfirm}
                  >
                    Send Request
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
