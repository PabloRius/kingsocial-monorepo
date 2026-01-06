"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UnauthorizedPage } from "@/components/UnauthorisedCard";
import { UserAvatar } from "@/components/UserAvatar";
import { useProfile } from "@/context/ProfileContext";
import { deleteProfile, updateProfile } from "@/services/profile";
import { ProfileUpdatePayload } from "@repo/shared-types";
import {
  Camera,
  Edit3,
  Eye,
  Fingerprint,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
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
    kNumber: "",
    degree: "",
    studyLevel: "BSc",
    settings: { showOnlineStatus: true, notificationsEnabled: true },
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
        kNumber: profile.kNumber || "",
        degree: profile.degree || "",
        studyLevel: profile.studyLevel || "BSc",
        settings: profile.settings || {
          showOnlineStatus: true,
          notificationsEnabled: true,
        },
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
    return <UnauthorizedPage />;
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
      kNumber: profile.kNumber || "",
      degree: profile.degree || "",
      studyLevel: profile.studyLevel || "BSc",
      settings: profile.settings || {
        showOnlineStatus: true,
        notificationsEnabled: true,
      },
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
                <div className="flex-1 text-white drop-shadow-lg">
                  <h1 className="text-3xl font-bold text-left">
                    {profile.name}
                  </h1>
                  <div className="flex items-center gap-2 text-blue-200 font-medium">
                    <GraduationCap className="h-4 w-4" />
                    {formData.degree}
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Institutional Presence */}
              <Card className="lg:col-span-1 border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <div className="h-2 bg-blue-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-blue-500" />
                    University Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kNumber">K-Number</Label>
                    <Input
                      id="kNumber"
                      value={formData.kNumber || ""}
                      onChange={(e) =>
                        handleInputChange("kNumber", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="k210045..."
                      className="bg-slate-50 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="degree">Major / Degree</Label>
                    <Input
                      id="degree"
                      value={formData.degree || ""}
                      onChange={(e) =>
                        handleInputChange("degree", e.target.value)
                      }
                      disabled={!isEditing}
                      placeholder="Computer Science..."
                      className="bg-slate-50 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Study Level</Label>
                    <Select
                      disabled={!isEditing}
                      value={formData.studyLevel || "BSc"}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, studyLevel: val }))
                      }
                    >
                      <SelectTrigger className="bg-slate-50 border-none rounded-xl">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BSc">BSc (Undergraduate)</SelectItem>
                        <SelectItem value="MSc">MSc (Postgraduate)</SelectItem>
                        <SelectItem value="PHD">PhD (Doctorate)</SelectItem>
                        <SelectItem value="Finished">
                          Alumni (Finished)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Bio & Links (Combined) */}
              <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle>Personal Narrative</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Biography</Label>
                    <Textarea
                      value={formData.biography}
                      onChange={(e) =>
                        handleInputChange("biography", e.target.value)
                      }
                      disabled={!isEditing}
                      className="rounded-2xl min-h-32"
                    />
                  </div>
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
                                updateSocialLink(
                                  index,
                                  "platform",
                                  e.target.value
                                )
                              }
                              disabled={!isEditing}
                              placeholder="e.g. Twitter, Portfolio"
                            />
                          </div>

                          <div className="flex-2 space-y-1">
                            <Label>URL</Label>

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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="account"
            className="mt-6 flex flex-col lg:flex-row gap-6"
          >
            <Card className="border-none shadow-sm rounded-3xl w-full">
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control how you appear to other students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="text-base font-bold">
                      Online Presence
                    </Label>
                    <p className="text-sm text-slate-500">
                      Show a green dot when you are active in the chat.
                    </p>
                  </div>
                  <Switch
                    disabled={!isEditing}
                    checked={formData.settings.showOnlineStatus}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          showOnlineStatus: checked,
                        },
                      }))
                    }
                  />
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 text-amber-800 text-sm">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <p>
                    Note: Turning off online status will also prevent you from
                    seeing the online status of other students.
                  </p>
                </div>
              </CardContent>
            </Card>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
