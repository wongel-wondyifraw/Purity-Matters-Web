"use client";

import React, { useState, useRef } from "react";
import { Plus, UploadCloud, X, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminData } from "@/context/AdminDataContext";
import { CreateModulePayload } from "@/types/admin";

interface CreateModuleModalProps {
  courseId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateModuleModal({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}: CreateModuleModalProps) {
  const { addCourseModule } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateModulePayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        bannerFile: bannerFile || undefined,
      };

      const success = await addCourseModule(courseId, payload);
      if (success) {
        resetForm();
        onClose();
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl bg-white p-6 border border-black/10 shadow-2xl">
        <DialogHeader className="pb-3 border-b border-black/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46]" />
            <DialogTitle className="text-base sm:text-lg font-bold text-[#202328]">
              Add Course Module
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500">
            Define a primary module or milestone for this course.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Module Title */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5">
              Module Title <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Module 1: Unmasking Hidden Roots"
              className="h-10 text-xs rounded-xl bg-neutral-50 border-black/10"
            />
          </div>

          {/* Module Description */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5">
              Module Overview (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of lessons in this module..."
              className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-black/10 focus:border-[#202328] focus:outline-none"
            />
          </div>

          {/* Optional Module Banner */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5 flex items-center justify-between">
              <span>Module Banner (Optional)</span>
              <span className="text-[10px] text-neutral-400">Can be left empty</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-black/10 hover:border-black/30 rounded-2xl p-3 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
              {bannerPreview ? (
                <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                  <img
                    src={bannerPreview}
                    alt="Module Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-neutral-500 py-2">
                  <UploadCloud className="w-4 h-4 text-neutral-600" />
                  <span className="text-xs font-medium">Click to upload module banner</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full text-xs px-4 h-9 font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-[#202328] hover:bg-black text-white rounded-full text-xs px-5 h-9 font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Adding...</span>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
                  <span>Add Module</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
