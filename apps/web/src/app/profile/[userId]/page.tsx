"use client";

import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/UserAvatar";
import { toggleBookmark } from "@/services/marketplace";
import { getProfileById } from "@/services/profile";
import { ProfileDTO } from "@repo/shared-types";

import { ExternalLink, Globe, Loader2, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [profile, setProfile] = useState<ProfileDTO | undefined | null>(
    undefined
  );
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
  const [activeTab, setActiveTab] = useState("listings");
  const bookmarkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionToggles, setSessionToggles] = useState<Record<string, boolean>>(
    {}
  );
  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <Loader2 className="flex-1 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The user profile you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </p>
            <Button asChild>
              <Link href="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const activeItems = profile.sellerProfile?.products || [];
  const bookmarkedIds =
    activeItems
      ?.filter((item) => {
        const isInitiallyBookmarked = profile?.bookmarkedProducts?.includes(
          item.id
        );
        const sessionOverride = sessionToggles[item.id];

        return sessionOverride ?? isInitiallyBookmarked;
      })
      .map((i) => i.id) || [];

  const handleBookmarkProduct = (itemId: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.includes(itemId);
    const nextState = !isCurrentlyBookmarked;

    // 1. Instant UI Feedback
    setSessionToggles((prev) => ({ ...prev, [itemId]: nextState }));

    // 2. Debounced API Call
    if (bookmarkTimeoutRef.current) clearTimeout(bookmarkTimeoutRef.current);

    bookmarkTimeoutRef.current = setTimeout(async () => {
      try {
        await toggleBookmark(itemId);
      } catch (error) {
        // 3. Revert session state on error
        setSessionToggles((prev) => ({
          ...prev,
          [itemId]: isCurrentlyBookmarked,
        }));
        console.error("Failed to sync bookmark:", error);
      }
    }, 500);
  };
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6">
      <main className="flex-1 container mx-auto py-6">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-linear-to-r from-celestial-blue-400 to-picton-blue-500 relative group">
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

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-start text-center px-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <UserAvatar
                    avatarUrl={profile.image || undefined}
                    name={profile.name || ""}
                    className="text-3xl h-32 w-32 ring-4 ring-white dark:ring-gray-800"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0 text-white drop-shadow-lg text-left">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
                    <span>
                      Joined{" "}
                      {new Date(profile.createdAt).toLocaleString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {profile.biography}
                </p>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Social Links</h4>
                  <div className="space-y-3">
                    {profile.socialLinks && profile.socialLinks.length > 0 ? (
                      profile.socialLinks.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 group"
                        >
                          <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <Globe className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                              {link.platform}
                            </span>
                            <Link
                              rel="noopener noreferrer"
                              target="_blank"
                              href={
                                link.url.startsWith("http")
                                  ? link.url
                                  : `https://${link.url}`
                              }
                              className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline flex items-center gap-1 transition-all"
                            >
                              {/* Display a cleaned up version of the URL or the full URL */}
                              {
                                link.url
                                  .replace(/^https?:\/\/(www\.)?/, "")
                                  .split("/")[0]
                              }
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No social links provided.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            {profile.sellerProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-celestial-blue-500">
                        {
                          profile.sellerProfile.products.filter(
                            (prod) => prod.status === "sold"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Item
                        {profile.sellerProfile.products.filter(
                          (prod) => prod.status === "sold"
                        ).length !== 1
                          ? "s"
                          : ""}{" "}
                        Sold
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Listings and Reviews */}
          <div className="lg:col-span-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="listings">
                  Active Listings ({activeItems.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeItems.map((item) => {
                    return (
                      <ItemCard
                        key={item.id}
                        item={item}
                        mode="profile"
                        bookmarkedIds={bookmarkedIds}
                        onBookmark={handleBookmarkProduct}
                      />
                    );
                  })}
                </div>
                {activeItems.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Listings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {profile.name} doesn&apos;t have any items for sale right
                      now.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
