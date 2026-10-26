"use client";

import React, { useState, useRef } from "react";
import {
  GraduationCap,
  Plus,
  UploadCloud,
  X,
  Sparkles,
  DollarSign,
  Tag,
  Target,
  CheckCircle2,
  ListPlus,
  Trash2,
} from "lucide-react";
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
import { CreateCoursePayload } from "@/types/admin";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCourseModal({ isOpen, onClose }: CreateCourseModalProps) {
  const { addCourse } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [courseType, setCourseType] = useState<"free" | "paid">("free");
  const [price, setPrice] = useState<string>("0");
  const [currency, setCurrency] = useState<string>("ETB");
  const [description, setDescription] = useState("");
  const [generalObjective, setGeneralObjective] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([""]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleOutcomeChange = (index: number, val: string) => {
    const updated = [...learningOutcomes];
    updated[index] = val;
    setLearningOutcomes(updated);
  };

  const addOutcomeField = () => {
    setLearningOutcomes([...learningOutcomes, ""]);
  };

  const removeOutcomeField = (index: number) => {
    if (learningOutcomes.length === 1) {
      setLearningOutcomes([""]);
      return;
    }
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName("");
    setTheme("");
    setCourseType("free");
    setPrice("0");
    setCurrency("ETB");
    setDescription("");
    setGeneralObjective("");
    setLearningOutcomes([""]);
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !theme.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: CreateCoursePayload = {
        name: name.trim(),
        theme: theme.trim(),
        type: courseType,
        price: courseType === "paid" ? Number(price) || 0 : 0,
        currency,
        description: description.trim() || undefined,
        generalObjective: generalObjective.trim() || undefined,
        learningOutcomes: learningOutcomes
          .map((o) => o.trim())
          .filter(Boolean),
        bannerFile: bannerFile || undefined,
      };

      const success = await addCourse(payload);
      if (success) {
        resetForm();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const themeSuggestions = [
    "Identity & Wholeness",
    "Overcoming Triggers",
    "Inner Healing",
    "Spiritual Disciplines",
    "Emotional Renewal",
    "Relational Purity",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 border border-black/10 shadow-2xl">
        <DialogHeader className="pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46]" />
            <DialogTitle className="text-lg sm:text-xl font-bold text-[#202328]">
              Create New Course
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500">
            Define course objectives, curriculum structure, banner imagery, and learning outcomes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          {/* Banner Image Upload */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5 flex items-center justify-between">
              <span>Course Banner Image</span>
              <span className="text-[11px] font-normal text-neutral-400">Recommended 16:9 or 1200x630</span>
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[130px] ${
                bannerPreview
                  ? "border-[#202328]/30 bg-neutral-50 p-2"
                  : "border-black/10 hover:border-[#202328]/40 hover:bg-black/[0.01]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerChange}
              />
              {bannerPreview ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                  <img
                    src={bannerPreview}
                    alt="Course Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                    <span>Click to change banner</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerFile(null);
                      setBannerPreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-neutral-500">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-0.5">
                    <UploadCloud className="w-5 h-5 text-neutral-700" />
                  </div>
                  <p className="text-xs font-semibold text-[#202328]">
                    Click or drag & drop banner image
                  </p>
                  <p className="text-[10px] text-neutral-400">PNG, JPG, WEBP up to 15MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Name & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#202328] mb-1.5">
                Course Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Walking in Freedom & Wholeness"
                className="h-10 text-xs rounded-xl bg-neutral-50 border-black/10 focus:border-[#202328]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#202328] mb-1.5 flex items-center justify-between">
                <span>Course Theme <span className="text-red-500">*</span></span>
              </label>
              <Input
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Identity & Wholeness"
                className="h-10 text-xs rounded-xl bg-neutral-50 border-black/10 focus:border-[#202328]"
              />
              {/* Theme suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {themeSuggestions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 hover:bg-[#F6CE46]/30 hover:text-[#202328] transition-colors cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Type & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-neutral-50 rounded-2xl border border-black/[0.06]">
            <div>
              <label className="block text-xs font-bold text-[#202328] mb-1">
                Course Type
              </label>
              <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-black/10">
                <button
                  type="button"
                  onClick={() => setCourseType("free")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    courseType === "free"
                      ? "bg-[#202328] text-white shadow-xs"
                      : "text-neutral-500 hover:text-[#202328]"
                  }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setCourseType("paid")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    courseType === "paid"
                      ? "bg-[#F6CE46] text-[#202328] shadow-xs"
                      : "text-neutral-500 hover:text-[#202328]"
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {courseType === "paid" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#202328] mb-1">
                    Price (Amount)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 500"
                    className="h-9 text-xs rounded-xl bg-white border-black/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202328] mb-1">
                    Currency
                  </label>
                  <Input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="ETB"
                    className="h-9 text-xs rounded-xl bg-white border-black/10 uppercase"
                  />
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5">
              Course Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a compelling overview of what learners will experience in this course..."
              className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-black/10 focus:border-[#202328] focus:outline-none"
            />
          </div>

          {/* General Objective */}
          <div>
            <label className="block text-xs font-bold text-[#202328] mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#202328]" />
              <span>General Objective</span>
            </label>
            <textarea
              rows={2}
              value={generalObjective}
              onChange={(e) => setGeneralObjective(e.target.value)}
              placeholder="Define the primary purpose and overall mission of this course..."
              className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-black/10 focus:border-[#202328] focus:outline-none"
            />
          </div>

          {/* Learning Outcomes Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#202328] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Learning Outcomes (Skills & Knowledge)</span>
              </label>
              <button
                type="button"
                onClick={addOutcomeField}
                className="text-xs font-bold text-[#202328] hover:text-black flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#F6CE46]" />
                <span>Add Outcome</span>
              </button>
            </div>

            <div className="space-y-2">
              {learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-100 text-[#202328] text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <Input
                    value={outcome}
                    onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                    placeholder={`e.g. Identify root emotional triggers and establish healthy boundaries`}
                    className="h-9 text-xs rounded-xl bg-neutral-50 border-black/10 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeOutcomeField(idx)}
                    className="p-2 text-neutral-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06]">
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
              disabled={isSubmitting || !name.trim() || !theme.trim()}
              className="bg-[#202328] hover:bg-black text-white rounded-full text-xs px-6 h-9 font-bold cursor-pointer shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Course...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
                  <span>Create Course</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
