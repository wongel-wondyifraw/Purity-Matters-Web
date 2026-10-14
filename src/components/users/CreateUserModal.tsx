"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Mail,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CreateUserPayload } from "@/types/auth";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apiUrl: string;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
  apiUrl,
}: CreateUserModalProps) {
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setErrorMsg(null);
  };

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in first name, last name, email, and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("purity_console_token");
      const payload: CreateUserPayload = {
        firstName: firstName.trim(),
        middleName: middleName.trim() ? middleName.trim() : undefined,
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: "admin", // stored in background
        isActive: true, // active automatically
      };

      const response = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create administrator user");
      }

      toast.success(
        "User Created",
        `Administrator account for ${payload.firstName} ${payload.lastName} created successfully.`
      );
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-xl shadow-2xl rounded-2xl p-6 sm:p-7 flex flex-col overflow-hidden relative">
        {/* Background Decorative Icon */}
        <div className="absolute -top-16 -right-16 pointer-events-none select-none text-black/[0.03] z-0">
          <UserPlus className="w-40 h-40" strokeWidth={1.2} />
        </div>

        {/* Modal Header */}
        <DialogHeader className="pb-3.5 border-b border-black/[0.06] relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46] shrink-0 shadow-xs" />
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight">
              Add New Console User
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500 mt-1">
            Create credentials for a team member to access the management console.
          </DialogDescription>
        </DialogHeader>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="py-4 space-y-4 relative z-10"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Full Name (Clean 3-Column Sequence) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Personal Information
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* First Name */}
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Bereket"
                  required
                  className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Middle Name <span className="text-neutral-400 font-normal">(Optional)</span>
                </label>
                <Input
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Tadesse"
                  className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Alemu"
                  required
                  className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 px-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Account Credentials (Balanced 2-Column Grid) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Account Credentials
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@puritymatters.org"
                    required
                    className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 pl-10 pr-3.5 text-xs text-[#202328] focus:border-[#202328] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#202328]">
                    Initial Password <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-semibold text-[#D4A818] hover:text-[#202328] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-10 pl-10 pr-10 text-xs text-[#202328] focus:border-[#202328] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full text-xs font-semibold px-4.5 h-9.5 border-black/15 text-[#202328] hover:bg-black/[0.04] cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full text-xs font-semibold px-5.5 h-9.5 bg-[#202328] hover:bg-black text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F6CE46]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-[#F6CE46]" />
                  <span>Create User</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
