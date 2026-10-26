"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
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

interface UploadMaterialModalProps {
  courseId: number;
  moduleId: number;
  sectionId: number;
  sectionTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UploadMaterialModal({
  courseId,
  moduleId,
  sectionId,
  sectionTitle,
  isOpen,
  onClose,
  onSuccess,
}: UploadMaterialModalProps) {
  const { uploadCourseMaterial } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setSelectedFile(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSubmitting(true);
    try {
      const success = await uploadCourseMaterial(
        courseId,
        moduleId,
        sectionId,
        selectedFile,
        title.trim() || selectedFile.name
      );
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
              Attach Learning Material
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500">
            {sectionTitle
              ? `Upload learning resource to "${sectionTitle}".`
              : "Upload PDF, study guide, audio, video, or slide deck."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* File Dropzone */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5">
              Select File <span className="text-red-500">*</span>
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                selectedFile
                  ? "border-emerald-500/40 bg-emerald-50/30"
                  : "border-black/10 hover:border-black/30 hover:bg-neutral-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              {selectedFile ? (
                <div className="flex items-center gap-3 w-full p-2 bg-white rounded-xl border border-black/5 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-[#202328] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {formatSize(selectedFile.size)} • Click to choose another
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1 hover:bg-neutral-100 rounded-md text-neutral-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-3 text-neutral-500">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 mb-0.5">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-[#202328]">
                    Click or drag & drop material here
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    PDF, DOCX, MP3, MP4, PPTX, ZIP up to 100MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Material Title */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5">
              Material Display Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Session 1 Study Guide & Reflection"
              className="h-10 text-xs rounded-xl bg-neutral-50 border-black/10"
            />
          </div>

          {/* Directory location indicator */}
          <div className="p-2.5 bg-neutral-100/70 rounded-xl text-[11px] text-neutral-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">
              Files are safely structured under <code>uploads/courses/&#123;course&#125;/&#123;module&#125;/</code>
            </span>
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
              disabled={isSubmitting || !selectedFile}
              className="bg-[#202328] hover:bg-black text-white rounded-full text-xs px-5 h-9 font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Material</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
