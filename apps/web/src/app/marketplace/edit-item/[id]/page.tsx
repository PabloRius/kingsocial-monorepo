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
import { getItemById, modifyItem } from "@/services/marketplace";
import {
  CATEGORIES_CORE,
  Category,
  Condition,
  LABELLED_CONDITIONS,
  ProductCreatePayload,
  ProductDTO,
} from "@repo/shared-types";
import {
  Camera,
  Loader2,
  Plus,
  PoundSterling,
  TagIcon,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [item, setItem] = useState<ProductDTO | undefined | null>(undefined);
  const [formData, setFormData] = useState<ProductCreatePayload>({
    name: "",
    description: "",
    price: 0,
    category: "Other",
    condition: "Good",
    photos: [],
    pickupLocation: "",
    tags: [],
  });
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { id } = await params;
        if (!id) return;
        const result = await getItemById(id);
        setItem(result.data);
        setFormData({
          name: result.data.name,
          description: result.data.description,
          price: result.data.price,
          category: result.data.category as Category,
          condition: result.data.condition as Condition,
          photos: result.data.photos,
          pickupLocation: result.data.pickupLocation,
          tags: result.data.tags,
        });
      } catch (error) {
        console.error(error);
        setItem(null);
      }
    };
    fetchItem();
  }, [params]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (item === undefined)
    return (
      <div className="flex flex-1 w-full h-full items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (item === null) return <></>;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "price" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files) return;

    if (formData.photos.length + files.length > 3) {
      toast.error("Max 3 photos allowed.");
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} exceeds the 5MB size limit.`);
        continue;
      }

      validFiles.push(file);
    }

    const filePreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...validFiles]);
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos ? [...prev.photos, ...filePreviews] : filePreviews,
    }));
  };

  const removeImage = (index: number) => {
    const photoToRemove = formData.photos[index];

    if (photoToRemove.startsWith("blob:")) {
      const blobIndex = formData.photos.filter(
        (p, i) => i < index && p.startsWith("blob:")
      ).length;

      setImageFiles((prev) => prev.filter((_, i) => i !== blobIndex));
    }

    setFormData((prev) => ({
      ...prev,
      photos: prev.photos!.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    setFormData((prev) => {
      if (
        prev.tags &&
        currentTag.trim() &&
        !prev.tags.includes(currentTag.trim()) &&
        prev.tags.length < 5
      ) {
        return {
          ...prev,
          tags: [...prev.tags, currentTag.trim()],
        };
      } else if (!prev.tags) {
        return { ...prev, tags: [currentTag.trim()] };
      } else return prev;
    });
    setCurrentTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags!.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!item) return;
      const existingPhotosOnly = formData.photos.filter(
        (p) => !p.startsWith("blob:")
      );
      const result = await modifyItem(
        item.id,
        { ...formData, photos: existingPhotosOnly },
        imageFiles,
        item.photos
      );
      if (result.success) {
        toast.success("Listing updated!");
        router.push("/marketplace/your-listings");
      } else {
        toast.error("Error updating item");
      }
    } catch (error) {
      console.error("Error updating listing: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-alice-blue-300 via-white to-celestial-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <main className="flex-1 container py-8 px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Update Your Listing</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fill out the details below to list your item on the marketplace
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
                  Add up to 5 photos of your item. The first photo will be the
                  main image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {formData.photos &&
                    formData.photos.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={image || "/placeholder.png"}
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

                  {formData.photos && formData.photos.length < 10 && (
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
                  <Label htmlFor="name">Title</Label>
                  <Input
                    id="name"
                    placeholder="e.g., MacBook Pro 2021, Physics Textbook, Desk Lamp..."
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item's condition, features, and any other relevant details..."
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="mt-1 min-h-25"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price</Label>
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
                          handleInputChange(
                            "price",
                            value === "" ? 0 : Number(value)
                          );
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <Input
                      id="pickupLocation"
                      placeholder="e.g., City Hall, Penrhyn Road Campus, Central London, etc"
                      value={formData.pickupLocation}
                      onChange={(e) =>
                        handleInputChange("pickupLocation", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="condition">Condition</Label>
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
                          ([condition, { description, label }]) => (
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
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
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
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5" />
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
                    disabled={formData.tags && formData.tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTag}
                    disabled={
                      !currentTag.trim() ||
                      (formData.tags && formData.tags.length >= 5)
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags && formData.tags.length > 0 && (
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-r from-celestial-blue-500 to-picton-blue-500 hover:from-celestial-blue-600 hover:to-picton-blue-600 text-white"
              >
                {isSubmitting ? "Publishing..." : "Update Listing"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
