"use client";

import React, { useState } from "react";
import { User, Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminData, NewClientPayload } from "@/context/AdminDataContext";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

export function ClientRegistrationModal() {
  const { addClient } = useAdminData();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<NewClientPayload>({
    fullName: "",
    telegramId: "",
    username: "",
    phone: "",
    languageCode: "en",
    role: "client",
    isRegistered: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.fullName.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await addClient(formState);
      if (success) {
        setFormState({
          fullName: "",
          telegramId: "",
          username: "",
          phone: "",
          languageCode: "en",
          role: "client",
          isRegistered: true,
        });
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all shrink-0">
        <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
        <span>Client</span>
      </DialogTrigger>

      <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-xl shadow-2xl rounded-2xl p-6 overflow-hidden">
        {/* Top-Right 1/4th Quadrant Watermark Icon under Close button */}
        <div className="absolute -top-18 -right-18 pointer-events-none select-none text-black/[0.05] z-0">
          <User className="w-36 h-36" strokeWidth={1.2} />
        </div>

        <DialogHeader className="pb-3 border-b border-black/[0.06] relative z-10 shrink-0">
          <div>
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Add New Client</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              Register a new client record in the system.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Abebe Bikila"
                value={formState.fullName}
                onChange={(e) =>
                  setFormState({ ...formState, fullName: e.target.value })
                }
                className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-9.5 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
              />
            </div>

            {/* Telegram Username */}
            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Telegram Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-semibold">
                  @
                </span>
                <Input
                  placeholder="username"
                  value={formState.username || ""}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      username: e.target.value.replace(/^@/, ""),
                    })
                  }
                  className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-9.5 pl-7 pr-3 text-xs text-[#202328] focus:border-[#202328] transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Phone Number
              </label>
              <Input
                placeholder="e.g. +251911420192"
                value={formState.phone || ""}
                onChange={(e) =>
                  setFormState({ ...formState, phone: e.target.value })
                }
                className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-9.5 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
              />
            </div>

            {/* System Role */}
            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                System Role
              </label>
              <CustomDropdown
                id="select-new-client-role"
                value={formState.role}
                options={[
                  { value: "client", label: "Client / Member" },
                  { value: "counselor", label: "Counselor / Staff" },
                  { value: "admin", label: "Administrator" },
                ]}
                onChange={(val) =>
                  setFormState({ ...formState, role: val })
                }
                variant="rounded"
                className="w-full"
                triggerClassName="w-full bg-neutral-50/70 hover:bg-white border border-black/15 rounded-xl h-9.5 px-3 text-xs text-[#202328]"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Preferred Language
              </label>
              <CustomDropdown
                id="select-new-client-language"
                value={formState.languageCode}
                options={[
                  { value: "en", label: "English (EN)" },
                  { value: "am", label: "Amharic (AM)" },
                  { value: "om", label: "Afaan Oromoo (OM)" },
                ]}
                onChange={(val) =>
                  setFormState({ ...formState, languageCode: val })
                }
                variant="rounded"
                className="w-full"
                triggerClassName="w-full bg-neutral-50/70 hover:bg-white border border-black/15 rounded-xl h-9.5 px-3 text-xs text-[#202328]"
              />
            </div>

            {/* Verification Status */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#202328] block mb-1">
                Verification Status
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setFormState({ ...formState, isRegistered: true })
                  }
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formState.isRegistered
                      ? "bg-[#202328] text-white border-[#202328] shadow-2xs"
                      : "bg-neutral-100 text-neutral-600 border-black/10 hover:bg-neutral-200"
                  }`}
                >
                  Verified Client
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormState({ ...formState, isRegistered: false })
                  }
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    !formState.isRegistered
                      ? "bg-[#202328] text-white border-[#202328] shadow-2xs"
                      : "bg-neutral-100 text-neutral-600 border-black/10 hover:bg-neutral-200"
                  }`}
                >
                  Awaiting Phone / In-Progress
                </button>
              </div>
            </div>
          </div>

          {/* Dialog Actions */}
          <div className="pt-3 mt-1 border-t border-black/[0.06] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsOpen(false)}
              className="rounded-full text-xs font-semibold h-9 px-4.5 border-black/15 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formState.fullName.trim()}
              className="bg-[#202328] hover:bg-black text-white rounded-full text-xs font-semibold h-9 px-5 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
                  <span>Create Client</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
