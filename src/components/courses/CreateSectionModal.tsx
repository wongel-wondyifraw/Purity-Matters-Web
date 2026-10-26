"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
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
import { CreateSectionPayload } from "@/types/admin";

interface CreateSectionModalProps {
  courseId: number;
  moduleId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateSectionModal({
  courseId,
  moduleId,
  isOpen,
  onClose,
  onSuccess,
}: CreateSectionModalProps) {
  const { addCourseSection } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [additionalContent, setAdditionalContent] = useState("");

  const resetForm = () => {
    setTitle("");
    setAdditionalContent("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateSectionPayload = {
        title: title.trim(),
        additionalContent: additionalContent.trim() || undefined,
      };

      const success = await addCourseSection(courseId, moduleId, payload);
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
              Add Module Section
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500">
            Define a section or lesson unit to hold learning materials and notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Section Title */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5">
              Section Title <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Session 1: Identifying Hidden Traps"
              className="h-10 text-xs rounded-xl bg-neutral-50 border-black/10"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5">
              Additional Content / Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={additionalContent}
              onChange={(e) => setAdditionalContent(e.target.value)}
              placeholder="Provide instructions, scripture references, or notes for this section..."
              className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-black/10 focus:border-[#202328] focus:outline-none"
            />
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
                  <span>Add Section</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
