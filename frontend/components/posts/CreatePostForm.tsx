"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import { postsAPI } from "@/lib/api";

interface PostFormData {
  title: string;
  content: string;
  tags: string;
  image?: FileList;
}

export default function CreatePostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PostFormData>();

  const imageFile = watch("image");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("🖼️ IMAGE CHANGE EVENT:");
    console.log("  - Files in input:", e.target.files?.length || 0);
    console.log("  - File selected:", file ? "YES" : "NO");
    if (file) {
      console.log("    - File name:", file.name);
      console.log("    - File size:", file.size);
      console.log("    - File type:", file.type);
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Store file in local state (not in react-hook-form)
      console.log("📌 Storing file in selectedFile state...");
      setSelectedFile(file);
      console.log("✅ File stored");
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setValue("image", undefined);
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      setLoading(true);
      setError("");

      console.log("🔍 CHECKING FORM DATA BEFORE APPEND:");
      console.log(
        "  - selectedFile:",
        selectedFile
          ? `${selectedFile.name} (${selectedFile.size} bytes)`
          : "null"
      );

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("tags", data.tags);

      if (selectedFile) {
        console.log("✅ File found in selectedFile, appending to FormData");
        formData.append("image", selectedFile);
      } else {
        console.log("❌ NO FILE in selectedFile - skipping image");
      }

      // DEBUG: Check FormData entries
      console.log("📤 FORMDATA ENTRIES:");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  - ${key}: File(${value.name}, ${value.size})`);
        } else {
          console.log(`  - ${key}: ${value}`);
        }
      }

      const post = await postsAPI.createPost(formData);
      console.log("✅ POST CREATED:", post);
      router.push(`/posts/${post._id}`);
    } catch (err: any) {
      console.error("❌ ERROR:", err);
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              {...register("title", { required: "Title is required" })}
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your post content..."
              rows={12}
              {...register("content", { required: "Content is required" })}
              disabled={loading}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas (e.g., tech, lifestyle, travel)"
              {...register("tags")}
              disabled={loading}
            />
            <p className="text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Label
                  htmlFor="image"
                  className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Click to upload image
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("image")}
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  PNG, JPG, JPEG or WEBP (MAX. 10MB)
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Post...
                </>
              ) : (
                "Publish Post"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
