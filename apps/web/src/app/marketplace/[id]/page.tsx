"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/UserAvatar";
import { sendMessageWithFallback } from "@/services/chat";
import {
  getItemById,
  increaseViews,
  toggleBookmark,
} from "@/services/marketplace";
import { getOwnProfile } from "@/services/profile";
import { ProductDTO, ProfileDTO } from "@repo/shared-types";
import {
  Bookmark,
  BookmarkCheck,
  Box,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  MessageCircle,
  Send,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDTO | undefined | null>(
    undefined
  );
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getOwnProfile();
        setProfile(result.data);
      } catch {
        toast.info(
          "Not logged in, create an account to unlock all capabilities"
        );
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  const [item, setItem] = useState<ProductDTO | undefined | null>(undefined);
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { id } = await params;
        const result = await getItemById(id);
        setItem(result.data || null);
      } catch (error) {
        console.error(error);
        setItem(null);
      }
    };
    fetchItem();
  }, [params]);

  const isOwner = item?.seller?.userId === profile?.id;

  useEffect(() => {
    if (isOwner || profile === null || !item) return;
    const initIncreaseViews = async () => {
      try {
        const viewedKey = `viewed_${item.id}`;
        if (!sessionStorage.getItem(viewedKey)) {
          sessionStorage.setItem(viewedKey, "true");
          const result = await increaseViews(item.id);
          if (result) {
            setItem((prev) => {
              if (!prev) return null;
              return { ...prev, views: (prev.views += 1) };
            });
          }
        }
      } catch (error) {
        console.error("Error updating the product", error);
      }
    };
    initIncreaseViews();
  }, [isOwner, profile, item]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const bookmarkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionIsBookmarked, setSessionIsBookmarked] = useState<
    boolean | null
  >(null);

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (bookmarkTimeoutRef.current) clearTimeout(bookmarkTimeoutRef.current);
    };
  }, []);

  if (item === undefined || profile === undefined)
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (item === null) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {
                "The product you're looking for doesn't exist or has been removed."
              }
            </p>
            <Button asChild>
              <Link href="/marketplace">Back to Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + item.photos.length) % item.photos.length
    );
  };

  const isBookmarked =
    sessionIsBookmarked ??
    profile?.bookmarkedProducts.includes(item.id) ??
    false;

  const handleToggleBookmark = () => {
    const nextState = !isBookmarked;
    setSessionIsBookmarked(nextState);

    if (bookmarkTimeoutRef.current) {
      clearTimeout(bookmarkTimeoutRef.current);
    }

    bookmarkTimeoutRef.current = setTimeout(async () => {
      try {
        await toggleBookmark(item.id);
      } catch (error) {
        setSessionIsBookmarked(isBookmarked);
        console.error("Failed to sync bookmark: ", error);
      }
    }, 500);
  };

  const handleMessageSeller = () => {
    if (!item.seller) return;
    setShowMessageForm(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.seller || !profile) return;
    if (message.trim()) {
      sendMessageWithFallback({
        content: message,
        receiverId: item.seller.userId,
        productRefId: item.id,
      });

      router.push(`/inbox?chat=${item.seller.userId}`); // TODO: Implement custom redirect in /inbox
    }
  };

  if (item.status === "sold" && !isOwner) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Item Sold</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              This listing for{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {item.name}
              </span>{" "}
              has been marked as sold and is no longer available for purchase.
            </p>
            <Button
              asChild
              className="bg-linear-to-r from-celestial-blue-500 to-picton-blue-500"
            >
              <Link href="/marketplace">Explore Other Items</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <main className="flex-1 container py-6 px-2 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4 relative">
            <div className="relative flex items-center aspect-square overflow-hidden rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <Image
                src={item.photos[currentImageIndex] || "/placeholder.png"}
                alt={item.name}
                width={600}
                height={600}
                className="object-contain w-full h-full"
              />
              {item.photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {item.photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {item.photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {item.photos.map((image, index) => (
                  <button
                    key={index}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-celestial-blue-500"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${item.name} ${index + 1}`}
                      width={120}
                      height={120}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{item.name}</h1>
                {/* <Badge
                  variant={item.availability === "Available" ? "default" : "secondary"}
                  className={
                    item.availability === "Available"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : ""
                  }
                >
                  {item.availability}
                </Badge> */}
                {/* Bookmark button */}
                {profile && profile.sellerProfile && !isOwner && (
                  <Button
                    onClick={handleToggleBookmark}
                    variant="outline"
                    size="icon"
                    className="rounded-full transition-all duration-200"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-5 w-5 text-celestial-blue-500 fill-celestial-blue-500" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>

              {/* <div className="flex items-center gap-4 mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-celestial-blue-500">${item.price}</span>
                  {item.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">${item.originalPrice}</span>
                  )}
                </div>
                {item.originalPrice && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Save ${item.originalPrice - item.price}
                  </Badge>
                )}
              </div> */}

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="rounded-full">
                    {item.condition}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{item.pickupLocation}</span>
                </div>
                {/* <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{item.views} views</span>
                </div> */}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-sm text-celestial-blue-600 dark:text-celestial-blue-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {profile && (
              <div className="space-y-3">
                {!showMessageForm ? (
                  <Button
                    disabled={isOwner && item.status === "sold"}
                    onClick={
                      isOwner
                        ? () => router.push(`edit-item/${item.id}`) // Use router.push instead of redirect for cleaner UX
                        : handleMessageSeller
                    }
                    className={`w-full h-12 rounded-xl font-medium transition-all ${
                      isOwner && item.status === "sold"
                        ? "bg-red-500 hover:bg-red-500 cursor-not-allowed opacity-100 text-white"
                        : "bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
                    }`}
                  >
                    {isOwner ? (
                      item.status === "sold" ? (
                        <>
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Item Already Sold
                        </>
                      ) : (
                        <>
                          <Box className="mr-2 h-5 w-5" />
                          Edit Item
                        </>
                      )
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Message Seller
                      </>
                    )}
                  </Button>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <div className="relative">
                      <Input
                        placeholder="Type your message to the seller..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="pr-12 h-12 rounded-xl"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className="absolute right-1 top-1 h-10 w-10 bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 rounded-lg"
                        disabled={!message.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl bg-transparent"
                      onClick={() => {
                        setShowMessageForm(false);
                        setMessage("");
                      }}
                    >
                      Cancel
                    </Button>
                  </form>
                )}
              </div>
            )}

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                {item.seller ? (
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      name={item.seller.user.name || undefined}
                      avatarUrl={item.seller.user.image || undefined}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.seller.user.name}
                      </div>
                    </div>
                  </div>
                ) : (
                  "Account Deleted"
                )}
                {item.seller && profile && !isOwner && (
                  <>
                    <Separator className="my-4" />
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/profile/${item.seller.userId}`}>
                        <User className="mr-2 h-4 w-4" />
                        View Seller Profile
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description and Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description & Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="pickup">Pickup</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-line">{item.description}</div>
                </div>
              </TabsContent>
              <TabsContent value="pickup" className="mt-4">
                <div className="space-y-4">
                  {/* <div>
                    <h4 className="font-semibold mb-2">Pickup Options</h4>
                    <div className="space-y-2">
                      {item.shipping.locations.map((location, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-celestial-blue-500" />
                          <span>{location}</span>
                        </div>
                      ))}
                    </div>
                  </div> */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Note:</strong> This seller prefers campus meetups
                      for safety and convenience. Shipping is not available for
                      this item.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Items */}
        {/* <Card>
          <CardHeader>
            <CardTitle>You Might Also Like</CardTitle>
            <CardDescription>Similar items from other sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedItems.map((item) => (
                <Link key={item.id} href={`/marketplace/${item.id}`} className="group">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-celestial-blue-500">${item.price}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.condition}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">by {item.seller}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </main>
    </div>
  );
}
