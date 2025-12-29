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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createItem, getItemById } from "@/services/marketplace";
import {
  CATEGORIES_CORE,
  Category,
  Condition,
  LABELLED_CONDITIONS,
  ProductCreatePayload,
} from "@repo/shared-types";
import {
  Camera,
  Loader2,
  Plus,
  PoundSterling,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function SellPageContent() {
  // Session state
  const { status } = useSession();
  const router = useRouter();
  // Form data
  const [formData, setFormData] = useState<ProductCreatePayload>({
    name: "",
    description: "",
    price: 0,
    category: "Other",
    condition: "New",
    pickupLocation: "",
    tags: [] as string[],
    photos: [],
  });
  const [images, setImages] = useState<{ src: string; isNew: boolean }[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "price" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds the 5MB size limit.`);
        continue;
      }

      validFiles.push(file);
    }

    if (images.length + validFiles.length > 3) {
      toast.error("You can upload a maximum of 3 images per product.");
      return;
    }

    const filePreviews = validFiles.map((file) => ({
      src: URL.createObjectURL(file),
      isNew: true,
    }));

    setImageFiles((prev) => [...prev, ...validFiles]);
    setImages((prev) => [...prev, ...filePreviews]);
  };

  const removeImage = (index: number) => {
    const removedImage = images[index];
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (removedImage.isNew) {
      const newFilesIndex = images
        .slice(0, index)
        .filter((img) => img.isNew).length;

      setImageFiles((prev) => prev.filter((_, i) => i !== newFilesIndex));
    }
  };

  const addTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim()) &&
      formData.tags.length < 5
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const existingUrlFiles = await Promise.all(
        images
          .filter((img) => !img.isNew)
          .map(async (img, i) => {
            const response = await fetch(img.src);
            const blob = await response.blob();
            const ext = blob.type.split("/")[1] || "jpg";
            return new File([blob], `resell-image-${i}.${ext}`, {
              type: blob.type,
            });
          })
      );

      const allFiles = [...existingUrlFiles, ...imageFiles];

      if (allFiles.length === 0) {
        alert("Please upload at least one image.");
        setIsSubmitting(false);
        return;
      }

      const res = await createItem(formData, allFiles);

      if (res.success) {
        toast.success("Item created successfully!");
        router.push("/marketplace/your-listings");
      } else {
        if (res.details) {
          setErrors(res.details);
        } else {
          toast.error("Error creating the item");
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search for resellId param
  const searchParams = useSearchParams();
  const resellId = searchParams.get("resellId");

  useEffect(() => {
    const fetchProductData = async () => {
      if (!resellId) return;

      try {
        const product = await getItemById(resellId);
        if (!product) throw new Error("Failed to fetch product data");

        setFormData({
          name: product.data.name,
          description: product.data.description,
          price: product.data.price,
          category: product.data.category as Category,
          condition: product.data.condition as Condition,
          pickupLocation: product.data.pickupLocation,
          tags: product.data.tags,
          photos: [],
        });

        if (product.data.photos && product.data.photos.length > 0) {
          setImages(
            product.data.photos.map((url) => ({ src: url, isNew: false }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProductData();
  }, [resellId]);

  // Session check
  if (status === "unauthenticated") {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <main className="flex-1 container py-8 px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {resellId ? "Re-Sell Item" : "Create New Listing"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {resellId
                ? "This form is pre-filled with your previous listing details."
                : "Fill out the details below to list your item on the marketplace"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photos
                </CardTitle>
                <CardDescription>
                  Add up to 3 photos of your item. The first photo will be the
                  main image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image.src || "/placeholder.png"}
                        alt={`Upload ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-2 left-2 text-xs">
                          Main
                        </Badge>
                      )}
                    </div>
                  ))}

                  {images.length < 3 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-celestial-blue-500 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Photo</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., MacBook Pro 2021, Physics Textbook, Desk Lamp..."
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1"
                  />
                  <p
                    className={`text-xs ${
                      !errors.name && "text-transparent"
                    } text-destructive mt-1`}
                  >
                    {errors.name || "º"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item's condition, features, and any other relevant details..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="mt-1 min-h-25"
                  />
                  <p
                    className={`text-xs ${
                      !errors.description && "text-transparent"
                    } text-destructive mt-1`}
                  >
                    {errors.description || "º"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative mt-1">
                      <PoundSterling className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "") {
                            handleInputChange("price", "");
                            return;
                          }

                          const parsed = parseFloat(value);
                          if (isNaN(parsed) || parsed < 0) return;

                          handleInputChange("price", value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (
                            value === "" ||
                            isNaN(Number(value)) ||
                            Number(value) < 0
                          ) {
                            handleInputChange("price", "0");
                          }
                        }}
                        className="pl-10"
                      />
                    </div>
                    <p
                      className={`text-xs ${
                        !errors.price && "text-transparent"
                      } text-destructive mt-1`}
                    >
                      {errors.price || "º"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="pickupLocation">Pickup Location *</Label>
                    <Input
                      id="pickupLocation"
                      placeholder="e.g., City Hall, Penrhyn Road Campus, Central London, etc"
                      value={formData.pickupLocation}
                      onChange={(e) =>
                        handleInputChange("pickupLocation", e.target.value)
                      }
                      className="mt-1"
                    />
                    <p
                      className={`text-xs ${
                        !errors.pickupLocation && "text-transparent"
                      } text-destructive mt-1`}
                    >
                      {errors.pickupLocation || "º"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) =>
                        handleInputChange("condition", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(LABELLED_CONDITIONS).map(
                          ([condition, { label, description }]) => (
                            <SelectItem key={condition} value={condition}>
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-xs text-gray-500">
                                  {description}
                                </div>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <p
                      className={`text-xs ${
                        !errors.condition && "text-transparent"
                      } text-destructive mt-1`}
                    >
                      {errors.condition || "º"}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES_CORE.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p
                      className={`text-xs ${
                        !errors.category && "text-transparent"
                      } text-destructive mt-1`}
                    >
                      {errors.category || "º"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
                <CardDescription>
                  Add up to 5 tags to help buyers find your item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    disabled={formData.tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={!currentTag.trim() || formData.tags.length >= 5}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        #{tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    <p
                      className={`text-xs ${
                        !errors.tags && "text-transparent"
                      } text-destructive mt-1`}
                    >
                      {errors.tags || "º"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || status === "loading"}
                className="flex-1 bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
              >
                {status === "loading" ? (
                  <Loader2 className="animate-spin" />
                ) : isSubmitting ? (
                  "Publishing..."
                ) : (
                  "Publish Listing"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      }
    >
      <SellPageContent />
    </Suspense>
  );
}
