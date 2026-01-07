"use client";

import {
  EventCalendarCard,
  EventCalendarSkeleton,
} from "@/components/EventCalendarCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/context/ProfileContext"; // Use your new context!
import { formatCount } from "@/lib/formatters";
import {
  getAllCommunities,
  getRecommendedCommunities,
} from "@/services/communities";
import { getAllEvents } from "@/services/event";
import { getMarketplaceStore } from "@/services/marketplace";
import { CommunityDTO, EventDTO } from "@repo/shared-types";
import {
  ArrowRight,
  Loader2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { status } = useSession();
  const { profile } = useProfile();
  const [marketplaceCount, setMarketplaceCount] = useState<number | null>(null);
  const [communitiesCount, setCommunitiesCount] = useState<number | null>(null);
  const [events, setEvents] = useState<EventDTO[] | undefined>(undefined);
  const [recommendedCommunities, setRecommendedCommunities] = useState<
    CommunityDTO[] | undefined | null
  >(undefined);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchData = async () => {
      try {
        const [mkt, comm, events] = await Promise.all([
          getMarketplaceStore(),
          getAllCommunities(),
          getAllEvents(),
        ]);
        setMarketplaceCount(mkt?.data?.totalCount || 0);
        setCommunitiesCount(comm.data.length);
        setEvents(events.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchData = async () => {
      try {
        const result = await getRecommendedCommunities();
        setRecommendedCommunities(result.data || null);
      } catch (error) {
        console.error(error);
        setRecommendedCommunities(null);
      }
    };
    fetchData();
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex flex-1 h-[80vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    );
  }

  const featuredModules = [
    {
      id: "marketplace",
      title: "Marketplace",
      description: "Buy and sell electronics, textbooks, and more with peers.",
      icon: ShoppingBag,
      gradient: "from-blue-600 via-blue-500 to-cyan-400",
      href: "/marketplace",
      stats: formatCount(marketplaceCount, "item"),
      lightBg: "bg-blue-50",
    },
    {
      id: "communities",
      title: "Communities",
      description: "Find your tribe and attend the best campus events.",
      icon: Users,
      gradient: "from-purple-600 via-purple-500 to-pink-400",
      href: "/communities",
      stats: formatCount(communitiesCount, "community", "communities"),
      lightBg: "bg-purple-50",
    },
  ];

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. HERO WELCOME SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-none px-3 py-1">
            <Sparkles className="mr-2 h-3 w-3" />
            Welcome back
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Hey, {profile?.name || "Student"}! 👋
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Your campus hub is buzzing. There are currently{" "}
            <span className="text-white font-medium">
              {marketplaceCount} items
            </span>{" "}
            for sale and{" "}
            <span className="text-white font-medium">
              {communitiesCount} communities
            </span>{" "}
            waiting for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl transition-all">
              <Link href="/marketplace/sell">List an Item</Link>
            </Button>
            <Button className="text-white bg-slate-700 hover:bg-slate-800 h-12 px-6 rounded-xl transition-all">
              <Link href="/events">Find Events</Link>
            </Button>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. LEFT COLUMN - MAIN FEATURES */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Popular Destinations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {featuredModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link key={module.id} href={module.href} className="group">
                    <Card className="h-full border-none shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                      <div
                        className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-2xl opacity-20 bg-linear-to-br ${module.gradient}`}
                      />
                      <CardContent className="p-8">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-linear-to-br ${module.gradient} text-white`}
                        >
                          <Icon className="h-7 w-7" />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">
                          {module.title}
                        </h4>
                        <p className="text-gray-500 mb-6 line-clamp-2">
                          {module.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="font-bold text-gray-900 text-lg">
                            {module.stats ?? "..."}
                          </span>
                          <div
                            className={`p-2 rounded-full ${module.lightBg} text-blue-600 group-hover:translate-x-1 transition-transform`}
                          >
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  New Communities for You
                </h3>
              </div>
              <Link href="/communities">
                <Button variant="link" className="text-blue-600 font-semibold">
                  Explore Hub
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedCommunities === undefined ? (
                // Loading State (Your pulse animation)
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-slate-50 animate-pulse border border-slate-100"
                  />
                ))
              ) : recommendedCommunities &&
                recommendedCommunities.length > 0 ? (
                recommendedCommunities.slice(0, 4).map((comm) => (
                  <Link
                    href={`/communities/${comm.id}`}
                    key={comm.id}
                    className="group"
                  >
                    <div className="aspect-square relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                      {/* Cover Image */}
                      <Image
                        src={comm.coverImage || "/community-placeholder.png"}
                        alt={comm.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-xs font-medium text-blue-300 mb-1 uppercase tracking-wider">
                          {comm.mode || "Public"}
                        </p>
                        <h4 className="font-bold text-sm md:text-base leading-tight line-clamp-2">
                          {comm.name}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                // Empty State
                <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                  <Users className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm">
                    Join more groups to see better matches!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. RIGHT SIDEBAR - CONTEXTUAL INFO */}
        <aside className="lg:col-span-4 space-y-8">
          {events === undefined ? (
            <EventCalendarSkeleton />
          ) : (
            <EventCalendarCard events={events} />
          )}

          <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-purple-700 p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-xl mb-2">Sell your old stuff!</h4>
              <p className="text-indigo-100 text-sm mb-4">
                Turn your textbooks and gadgets into extra cash today.
              </p>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50 w-full rounded-xl font-bold">
                Start Selling
              </Button>
            </div>
            <ShoppingBag className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 rotate-12" />
          </div>
        </aside>
      </div>
    </main>
  );
}
