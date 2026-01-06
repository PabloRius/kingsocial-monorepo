"use client";

import {
  ArrowRight,
  ExternalLink,
  Fingerprint,
  Globe,
  GraduationCap,
  Loader2,
  MessageCircle,
  Package,
  Share2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/UserAvatar";
import { useChat } from "@/context/ChatContext"; // To get onlineUsers list

import { OnlineIndicator } from "@/components/OnlineIndicator";
import { getProfileById } from "@/services/profile";
import { ProfileDTO } from "@repo/shared-types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [profile, setProfile] = useState<ProfileDTO | null | undefined>(
    undefined
  );
  const { onlineUsers } = useChat(); // Shared state from provider
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { userId } = await params;
        const result = await getProfileById(userId);
        setProfile(result.data || null);
      } catch (error) {
        console.error(error);
        setProfile(null);
      }
    };
    fetchProfile();
  }, [params]);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Users className="text-slate-400 h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold">User Not Found</h1>
        <p className="text-slate-500 mb-6">
          This profile may be private or no longer exists.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/dashboard">Back Home</Link>
        </Button>
      </div>
    );
  }

  // --- LOGIC HELPERS ---
  const products = profile.sellerProfile?.products || [];
  const joinedCommunitiesCount = profile._count.communities || 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. HERO SECTION */}
      <div className="h-64 md:h-80 overflow-hidden bg-linear-to-r from-celestial-blue-400 to-picton-blue-500 relative group">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt="Cover"
            width={800}
            height={200}
            className="object-cover w-full h-full"
          />
        )}

        {/* Dark linear overlay for readability */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />

        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white"
            asChild
          >
            <Link href="/dashboard">
              <ArrowRight className="rotate-180" />
            </Link>
          </Button>
          <Button
            onClick={handleShare}
            variant="secondary"
            className="rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>

      {/* 2. PROFILE CORE CARD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Info (Left) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardContent className="p-8 pt-10 text-center">
                <div className="relative inline-block mb-6">
                  <UserAvatar
                    avatarUrl={profile.image || undefined}
                    name={profile.name || ""}
                    className="h-32 w-32 ring-8 ring-white shadow-lg text-4xl"
                  />
                  {/* Real-time Online Indicator */}
                  <div className="absolute bottom-2 right-2">
                    <OnlineIndicator
                      userId={profile.id}
                      currentOnlineList={onlineUsers}
                      userSettings={profile.settings || undefined}
                    />
                  </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <div className="flex items-center justify-center gap-2 mt-2 text-blue-600 font-bold">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm uppercase tracking-wider">
                    {profile.degree || "Student"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-50">
                  <div>
                    <p className="text-xl font-black text-slate-900">
                      {joinedCommunitiesCount}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Hubs
                    </p>
                  </div>
                  <div className="border-x border-slate-100">
                    <p className="text-xl font-black text-slate-900">
                      {products.length}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Store
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900">
                      {profile.sellerProfile?.products?.filter(
                        (p) => p.status === "sold"
                      ).length || 0}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Sales
                    </p>
                  </div>
                </div>

                <Button className="w-full mt-8 h-12 rounded-2xl bg-slate-900 hover:bg-blue-600 transition-all font-bold group">
                  Message User
                  <MessageCircle className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                </Button>
              </CardContent>
            </Card>

            {/* University ID Card */}
            <Card className="border-none shadow-md rounded-3xl p-6 bg-linear-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <Fingerprint className="h-8 w-8 text-blue-200" />
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-sm uppercase text-[10px]">
                    Verified Student
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest opacity-70">
                    Identity Number
                  </p>
                  <p className="text-xl font-mono font-bold tracking-tighter">
                    {profile.kNumber || "K-NOT-SET"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 uppercase font-bold tracking-widest opacity-70">
                    Study Level
                  </p>
                  <p className="font-bold">
                    {profile.studyLevel || "Undergraduate"}
                  </p>
                </div>
              </div>
              <Trophy className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 -rotate-12" />
            </Card>

            {/* Social Links Bento */}
            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Digital Footprint
              </h3>
              <div className="space-y-3">
                {profile.socialLinks?.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-400 group-hover:text-blue-600">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700 capitalize">
                        {link.platform}
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-300" />
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content (Right) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Biography Bento */}
            <Card className="border-none shadow-sm rounded-3xl p-8 bg-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  About {profile.name?.split(" ")[0]}
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg italic">
                  &quot;{profile.biography || "No biography provided yet."}
                  &quot;
                </p>
              </div>
              <Sparkles className="absolute top-4 right-4 h-12 w-12 text-blue-50 opacity-50" />
            </Card>

            {/* Content Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="inline-flex h-14 items-center justify-start rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
                <TabsTrigger
                  value="listings"
                  className="rounded-xl px-6 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Storefront ({products.length})
                </TabsTrigger>
                <TabsTrigger
                  value="communities"
                  className="rounded-xl px-6 h-full data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                >
                  Communities ({profile.communities?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="listings"
                className="focus-visible:ring-0 mt-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.length > 0 ? (
                    products.map((item) => {
                      return (
                        <Link
                          key={item.id}
                          href={`/marketplace/item/${item.id}`}
                        >
                          <Card className="group p-4 border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white border border-slate-100 overflow-hidden relative">
                            <div className="flex items-center gap-4">
                              {/* Product Image */}
                              <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden shadow-inner bg-slate-100">
                                <Image
                                  src={
                                    item.photos?.[0] ||
                                    "/placeholder-product.jpg"
                                  }
                                  alt={item.name}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm font-black text-blue-600">
                                    £{item.price}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 border-none px-1.5 h-4"
                                  >
                                    {item.condition}
                                  </Badge>
                                </div>
                              </div>

                              {/* Action Indicator */}
                              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <Package className="mx-auto h-12 w-12 text-slate-200 mb-2" />
                      <p className="text-slate-400 font-medium">
                        No active listings yet.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="communities"
                className="focus-visible:ring-0 mt-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.communities && profile.communities.length > 0 ? (
                    profile.communities.map((membership) => (
                      <Link
                        key={membership.community.id}
                        href={`/communities/${membership.community.id}`}
                      >
                        <Card className="group p-4 border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white border border-slate-100 overflow-hidden relative">
                          <div className="flex items-center gap-4">
                            <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden shadow-inner bg-slate-100">
                              <Image
                                src={
                                  membership.community.coverImage ||
                                  "/placeholder-community.jpg"
                                }
                                alt={membership.community.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {membership.community.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="secondary"
                                  className="bg-slate-100 text-[10px] uppercase tracking-wider text-slate-500 border-none"
                                >
                                  {membership.role}
                                </Badge>
                                <span className="text-[10px] text-slate-400">
                                  Joined{" "}
                                  {new Date(
                                    membership.joinedAt
                                  ).toLocaleDateString(undefined, {
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <Users className="mx-auto h-12 w-12 text-slate-200 mb-2" />
                      <p className="text-slate-400 font-medium">
                        {"This user hasn't joined any communities yet."}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
