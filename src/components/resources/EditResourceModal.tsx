"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  UploadCloud,
  FileText,
  Package,
  X,
  Save,
  Pencil,
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
import { ResourceCatalogItem } from "@/types/admin";

interface EditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceCatalogItem | null;
}

export function EditResourceModal({
  isOpen,
  onClose,
  resource,
}: EditResourceModalProps) {
  const { updateResource } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resourceType, setResourceType] = useState<"ebook" | "physical_book">("ebook");
  const [pricingType, setPricingType] = useState<"free" | "paid">("free");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<string>("50");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (resource) {
      setResourceType(resource.type || "ebook");
      setPricingType(resource.pricingType || (resource.price > 0 ? "paid" : "free"));
      setTitle(resource.title || "");
      setAuthor(resource.author || "");
      setDescription(resource.description || "");
      setPrice(resource.price ? String(resource.price) : "");
      setStockQuantity(
        resource.stockQuantity !== null && resource.stockQuantity !== undefined
          ? String(resource.stockQuantity)
          : "50"
      );
      setSelectedFile(null);
    }
  }, [resource]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource || !title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<ResourceCatalogItem> & { file?: File | null } = {
        title: title.trim(),
        author: author.trim() || "Purity Matters Ministry",
        description: description.trim() || "",
        type: resourceType,
        pricingType: resourceType === "physical_book" ? "paid" : pricingType,
        price:
          resourceType === "physical_book" || pricingType === "paid"
            ? Number(price) || 0
            : 0,
        currency: "ETB",
        stockQuantity:
          resourceType === "physical_book" ? Number(stockQuantity) || 0 : undefined,
        file: resourceType === "ebook" && selectedFile ? selectedFile : undefined,
      };

      const success = await updateResource(resource.id, payload);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!resource) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-xl md:max-w-2xl shadow-2xl rounded-2xl p-6 max-h-[88vh] flex flex-col overflow-hidden">
        {/* Decorative Watermark Icon */}
        <div className="absolute -top-18 -right-18 pointer-events-none select-none text-black/[0.05] z-0">
          <BookOpen className="w-36 h-36" strokeWidth={1.2} />
        </div>

        <DialogHeader className="pb-3 border-b border-black/[0.06] relative z-10 shrink-0">
          <div>
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Edit Resource #{resource.id}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              Modify resource metadata, pricing tier, inventory, or replace digital files.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3 flex-1 min-h-0 overflow-y-auto pr-1.5">
          {/* Resource Type Tabs */}
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold text-[#202328]">
              Resource Type
            </label>
            <div className="w-full sm:w-1/2 flex items-center p-1 bg-neutral-100 rounded-xl border border-black/[0.08]">
              <button
                type="button"
                onClick={() => setResourceType("ebook")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  resourceType === "ebook"
                    ? "bg-[#202328] text-white shadow-2xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>E-Book</span>
              </button>
              <button
                type="button"
                onClick={() => setResourceType("physical_book")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  resourceType === "physical_book"
                    ? "bg-[#202328] text-white shadow-2xs"
                    : "text-neutral-600 hover:text-[#202328]"
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Physical Book</span>
              </button>
            </div>
          </div>

          {/* Book Title */}
          <div>
            <label className="text-xs font-semibold text-[#202328] block mb-1">
              Book Title / Resource Name <span className="text-red-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g. Breaking Chains: The Wholeness Journey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
            />
          </div>

          {/* Author & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Author / Leader
              </label>
              <Input
                placeholder="e.g. Dr. Selamawit & Team"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Short Description
              </label>
              <Input
                placeholder="e.g. Handbook on freedom and healing"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
              />
            </div>
          </div>

          {/* Pricing & Stock Configuration */}
          {resourceType === "ebook" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Pricing Tier
                </label>
                <div className="flex p-0.5 bg-neutral-100 rounded-xl border border-black/10 h-10">
                  <button
                    type="button"
                    onClick={() => setPricingType("free")}
                    className={`flex-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pricingType === "free"
                        ? "bg-[#202328] text-white shadow-2xs"
                        : "text-neutral-600 hover:text-[#202328]"
                    }`}
                  >
                    Free (0 ETB)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingType("paid")}
                    className={`flex-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pricingType === "paid"
                        ? "bg-[#202328] text-white shadow-2xs"
                        : "text-neutral-600 hover:text-[#202328]"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Price (ETB)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    disabled={pricingType === "free"}
                    required={pricingType === "paid"}
                    placeholder={pricingType === "free" ? "0 (Free)" : "e.g. 250"}
                    value={pricingType === "free" ? "" : price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 pr-12 text-xs text-[#202328] font-bold disabled:opacity-50"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-neutral-400">
                    ETB
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Price (ETB) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 350"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 pr-12 text-xs text-[#202328] font-bold"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-bold text-neutral-400">
                    ETB
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Stock Inventory (Copies)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 text-xs text-[#202328]"
                />
              </div>
            </div>
          )}

          {/* Current File / Replace File */}
          {resourceType === "ebook" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#202328]">
                  E-Book File (.pdf, .epub)
                </label>
                {resource.fileName && (
                  <span className="text-[10px] text-neutral-500">
                    Current: <span className="font-mono font-semibold">{resource.fileName}</span>
                  </span>
                )}
              </div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed rounded-xl px-3.5 py-2.5 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  selectedFile
                    ? "border-[#F6CE46] bg-[#F6CE46]/10"
                    : "border-black/15 hover:border-black/30 bg-neutral-50/60 hover:bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.epub,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-black/10 flex items-center justify-center shrink-0 text-[#202328]">
                    <UploadCloud className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="text-left truncate">
                    <p className="text-xs font-bold text-[#202328] truncate">
                      {selectedFile
                        ? selectedFile.name
                        : resource.fileName
                        ? "Click to replace existing file"
                        : "Click to select or drop E-Book file"}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {selectedFile
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to replace`
                        : "Uploads directly to /uploads/resources/ebooks"}
                    </p>
                  </div>
                </div>

                {selectedFile ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="p-1 hover:bg-neutral-200 rounded-lg text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-neutral-600 bg-white border border-black/10 rounded-lg px-2.5 py-1 shrink-0">
                    Browse
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-black/[0.06] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full text-xs font-semibold h-9 px-4 border-black/15 text-neutral-700 hover:bg-neutral-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-[#202328] hover:bg-black text-white font-bold rounded-full text-xs h-9 px-5 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#F6CE46]" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
