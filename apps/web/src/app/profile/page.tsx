"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfile } from "@/context/ProfileContext";
import { deleteProfile, updateProfile } from "@/services/profile";
import { ProfileUpdatePayload } from "@repo/shared-types";
import {
  ArrowRight,
  Camera,
  DollarSign,
  Edit3,
  Eye,
  Loader2,
  Package,
  Plus,
  PoundSterling,
  Save,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const MAX_LINKS = 10;

export default function OwnProfilePage() {
  const { profile, refreshProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState<ProfileUpdatePayload>({
    name: "",
    biography: "",
    socialLinks: [],
    image: "",
    coverImage: "",
  });
  const [imagesData, setImagesData] = useState<{
    image: string | undefined;
    imageFile: File | null;
    coverImage: string | undefined;
    coverImageFile: File | null;
  }>({
    image: profile?.image || undefined,
    imageFile: null,
    coverImage: profile?.coverImage || undefined,
    coverImageFile: null,
  });
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || "",
        biography: profile.biography || "",
        socialLinks: profile.socialLinks || [],
        image: profile.image || "",
        coverImage: profile.coverImage || "",
      }));
      setImagesData({
        image: profile.image || undefined,
        imageFile: null,
        coverImage: profile.coverImage || undefined,
        coverImageFile: null,
      });
    }
  }, [profile]);
  const [isSaving, setIsSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  if (profile === undefined) {
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (!profile) {
    return; //TODO: Add error message and return button
  }
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "coverImage"
  ) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const imagePreview = URL.createObjectURL(file);
    if (type === "image") {
      setImagesData((prev) => ({
        ...prev,
        image: imagePreview,
        imageFile: file,
      }));
    } else if (type === "coverImage") {
      setImagesData((prev) => ({
        ...prev,
        coverImage: imagePreview,
        coverImageFile: file,
      }));
    }
  };
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const res = await updateProfile(
        formData,
        imagesData.imageFile || undefined,
        imagesData.coverImageFile || undefined
      );

      if (!res) {
        throw new Error("Failed to save profile");
      }

      setIsEditing(false);
      refreshProfile();
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || "",
      biography: profile.biography || "",
      socialLinks: profile.socialLinks || [],
      image: profile.image || "",
      coverImage: profile.coverImage || "",
    });
    setImagesData({
      image: profile.image || undefined,
      imageFile: null,
      coverImage: profile.coverImage || undefined,
      coverImageFile: null,
    });
    setIsEditing(false);
  };
  const handleDeleteAccount = async () => {
    try {
      if (
        !confirm(
          "Are you sure you want to delete your account? This action cannot be undone."
        )
      ) {
        return;
      }
      await deleteProfile();
      signOut({ redirectTo: "/" });
    } catch (error) {
      console.error("Error deleting account: ", error);
    }
  };
  const addSocialLink = () => {
    if ((formData.socialLinks || []).length >= MAX_LINKS) return;

    const updatedLinks = [
      ...(formData.socialLinks || []),
      { platform: "", url: "" },
    ];
    setFormData((prev) => ({ ...prev, socialLinks: updatedLinks }));
  };
  const removeSocialLink = (index: number) => {
    if (!formData.socialLinks) return;
    const updatedLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, socialLinks: updatedLinks }));
  };
  const updateSocialLink = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    if (!formData.socialLinks) return;
    const updatedLinks = formData.socialLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setFormData((prev) => ({ ...prev, socialLinks: updatedLinks }));
  };
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6">
      <main className="flex-1 mx-auto container py-6">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-linear-to-r from-celestial-blue-400 to-picton-blue-500 relative group">
            {imagesData.coverImage && (
              <Image
                src={imagesData.coverImage}
                alt="Cover"
                width={800}
                height={200}
                className="object-cover w-full h-full"
              />
            )}

            {/* Dark linear overlay for readability */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/10" />

            {isEditing && (
              <>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e, "coverImage")}
                  aria-label="Upload cover image"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-4 right-4 transition-opacity z-100"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Change Cover
                </Button>
              </>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-start text-center px-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <UserAvatar
                    avatarUrl={imagesData.image || undefined}
                    name={formData.name || ""}
                    className="text-3xl h-32 w-32 ring-4 ring-white dark:ring-gray-800"
                  />
                  {isEditing && (
                    <>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(e, "image")}
                        aria-label="Upload avatar image"
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full transition-opacity"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 min-w-0 text-white drop-shadow-lg text-left">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-200">
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

          <div className="flex gap-3 mt-8">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
            {!isEditing && (
              <Button variant="outline" asChild>
                <Link href={`/profile/${profile.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Public Profile
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="seller">Seller Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update your personal information and bio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email || ""}
                      disabled
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.biography || ""}
                      onChange={(e) =>
                        handleInputChange("biography", e.target.value)
                      }
                      disabled={!isEditing}
                      className="mt-1 min-h-25"
                      placeholder="Tell others about yourself..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>
                      Connect your social accounts (Max {MAX_LINKS})
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                    disabled={
                      !isEditing ||
                      (formData.socialLinks || []).length >= MAX_LINKS
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Link
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.socialLinks || []).map((link, index) => (
                    <div key={index} className="flex gap-3 items-end group">
                      <div className="flex-1 space-y-1">
                        <Label>Platform</Label>
                        <Input
                          value={link.platform}
                          onChange={(e) =>
                            updateSocialLink(index, "platform", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="e.g. Twitter, Portfolio"
                        />
                      </div>
                      <div className="flex-2 space-y-1">
                        <Label>URL / Username</Label>
                        <Input
                          value={link.url}
                          onChange={(e) =>
                            updateSocialLink(index, "url", e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="https://..."
                        />
                      </div>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeSocialLink(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {(formData.socialLinks || []).length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm italic">
                      No social links added yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
              {/* Seller Stats Summary */}
              {profile.sellerProfile && (
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-celestial-blue-50 to-picton-blue-50 dark:from-celestial-blue-900/10 dark:to-picton-blue-900/10"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-linear-to-r from-celestial-blue-500 to-picton-blue-500">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Seller Dashboard
                          </CardTitle>
                          <CardDescription>
                            Your marketplace performance
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 text-white">
                        {profile.sellerProfile.plan}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-celestial-blue-600">
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
                      <div className="text-center">
                        <div className="text-2xl font-bold text-celestial-blue-600">
                          $
                          {profile.sellerProfile.products
                            .filter((prod) => prod.status === "sold")
                            .reduce((sum, l) => sum + l.price, 0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Earned
                        </div>
                      </div>
                    </div>
                    <div className="gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-celestial-blue-600">
                          {
                            profile.sellerProfile.products.filter(
                              (prod) => prod.status !== "sold"
                            ).length
                          }
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Active Listing
                          {profile.sellerProfile.products.filter(
                            (prod) => prod.status !== "sold"
                          ).length !== 1 && "s"}
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
                    >
                      <Link href="/marketplace/your-listings">
                        View Seller Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Community Stats Summary */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10"></div>
                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-linear-to-r from-purple-500 to-pink-500">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Community Hub</CardTitle>
                        <CardDescription>
                          Your social engagement
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>Active</span>
                    </div>
                  </div>
                </CardHeader>

                {
                  // TODO
                  /* <CardContent className="relative">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentUser.communityStats.posts}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Posts
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {currentUser.communityStats.followers}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Followers
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className="text-sm font-semibold">
                          {currentUser.communityStats.likes}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Likes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                        <span className="text-sm font-semibold">
                          {currentUser.communityStats.comments}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Comments
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">
                        {currentUser.communityStats.following}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Following
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Link href="/community">
                      View Community Page
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent> */
                }
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <div className="flex flex-row">
              <Card className="lg:w-1/2 w-full">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {profile.sellerProfile && (
            <TabsContent value="seller" className="mt-6">
              <div className="flex flex-row ">
                <Card className="lg:w-1/2 w-full">
                  <CardHeader>
                    <CardTitle>Seller Profile</CardTitle>
                    <CardDescription>
                      Manage your seller account and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-linear-to-r from-celestial-blue-50 to-picton-blue-50 dark:from-celestial-blue-900/20 dark:to-picton-blue-900/20 rounded-lg">
                      <div>
                        <div className="font-semibold">
                          Current Plan: {profile.sellerProfile.plan}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {profile.sellerProfile.plan === "premium" ? (
                            <>
                              <PoundSterling />
                              {"9.99/month"}
                            </>
                          ) : profile.sellerProfile.plan === "pro" ? (
                            <>
                              <PoundSterling />
                              {"5.99/month"}
                            </>
                          ) : (
                            "Free"
                          )}
                        </div>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href="/seller-pricing">
                          {profile.sellerProfile.plan === "basic"
                            ? "Upgrade"
                            : "Manage Plan"}
                        </Link>
                      </Button>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href="/marketplace/sell">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Create New Listing
                        </Button>
                      </Link>
                      <Link href="/marketplace/your-listings">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Sales Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
