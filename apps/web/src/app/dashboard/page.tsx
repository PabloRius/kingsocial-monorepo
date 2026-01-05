"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/context/ProfileContext"; // Use your new context!
import { formatCount } from "@/lib/formatters";
import { getAllCommunities } from "@/services/communities";
import { getMarketplaceStore } from "@/services/marketplace";
import {
  ArrowRight,
  Calendar,
  Loader2,
  MapPin,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { status } = useSession();
  const { profile } = useProfile();
  const [marketplaceCount, setMarketplaceCount] = useState<number | null>(null);
  const [communitiesCount, setCommunitiesCount] = useState<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchData = async () => {
      try {
        const [mkt, comm] = await Promise.all([
          getMarketplaceStore(),
          getAllCommunities(),
        ]);
        setMarketplaceCount(mkt?.data?.totalCount || 0);
        setCommunitiesCount(comm.data.length);
      } catch (error) {
        console.error(error);
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

          {/* ADDED: YOUR ACTIVITY SECTION */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Recent Communities
              </h3>
              <Button variant="link" className="text-blue-600">
                View All
              </Button>
            </div>
            {/* Placeholder for actual data list */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. RIGHT SIDEBAR - CONTEXTUAL INFO */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Simplified Event Item */}
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-50 flex flex-col items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <span className="text-xs uppercase">Jan</span>
                      <span className="text-lg">0{i + 4}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Tech Talk: AI in 2026
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> Main Hall • 4 PM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-8 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 border-none shadow-none">
                Explore Calendar
              </Button>
            </CardContent>
          </Card>

          {/* PROMO CARD */}
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
