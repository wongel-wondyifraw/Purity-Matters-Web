"use client";

import React, { useState, useEffect } from "react";
import {
  UserCog,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ShieldCheck,
  Crown,
  HeartHandshake,
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
import { ConsoleUser, UpdateUserPayload } from "@/types/auth";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: ConsoleUser | null;
  apiUrl: string;
}

export function EditUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  apiUrl,
}: EditUserModalProps) {
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setMiddleName(user.middleName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setRole(user.role || "admin");
      setIsActive(user.isActive !== false);
      setPassword("");
      setShowPassword(false);
      setErrorMsg(null);
    }
  }, [user]);

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
    if (!user) return;

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMsg("Please fill in first name, last name, and email.");
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem("purity_console_token");
      const payload: UpdateUserPayload = {
        firstName: firstName.trim(),
        middleName: middleName.trim() ? middleName.trim() : null,
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        isActive: isActive,
        ...(password.trim() ? { password: password.trim() } : {}),
      };

      const response = await fetch(`${apiUrl}/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update administrator user");
      }

      toast.success(
        "User Updated",
        `Profile for ${payload.firstName} ${payload.lastName} saved successfully.`
      );
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
      <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-xl md:max-w-2xl shadow-2xl rounded-2xl p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden relative">
        {/* Background Decorative Icon */}
        <div className="absolute -top-16 -right-16 pointer-events-none select-none text-black/[0.03] z-0">
          <UserCog className="w-40 h-40" strokeWidth={1.2} />
        </div>

        {/* Modal Header */}
        <DialogHeader className="pb-3.5 border-b border-black/[0.06] relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46] shrink-0 shadow-xs" />
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight">
              Edit Console User
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500 mt-1">
            Update personal information, administrative privileges, or reset login password.
          </DialogDescription>
        </DialogHeader>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 relative z-10"
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

              {/* Reset Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#202328]">
                    Reset Password{" "}
                    <span className="text-neutral-400 font-normal text-[11px]">
                      (Optional)
                    </span>
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
                    placeholder="Leave blank to keep current"
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

          {/* Section 3: Access Role Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
              Access Role & Privileges
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "superadmin",
                  label: "Superadmin",
                  desc: "Full root access & user control",
                  icon: Crown,
                },
                {
                  id: "admin",
                  label: "Administrator",
                  desc: "Standard management console",
                  icon: ShieldCheck,
                },
                {
                  id: "counselor",
                  label: "Counselor",
                  desc: "Client sessions & notes",
                  icon: HeartHandshake,
                },
              ].map((item) => {
                const isSelected = role === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-[#202328] text-white border-[#202328] shadow-sm"
                        : "bg-neutral-50/70 border-black/10 text-neutral-700 hover:bg-white hover:border-black/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? "bg-white/10 text-[#F6CE46]"
                            : "bg-black/[0.04] text-neutral-600"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold leading-tight">{item.label}</p>
                    <p
                      className={`text-[11px] mt-1 leading-snug line-clamp-1 ${
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Account Status */}
          <div className="p-3.5 rounded-xl border border-black/10 bg-neutral-50/60 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#202328]">Account Status</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {isActive ? "Active account" : "Suspended account"}
              </p>
            </div>
            <div className="flex items-center p-1 bg-neutral-200/70 rounded-xl border border-black/5 shrink-0">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isActive
                    ? "bg-[#202328] text-white shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Suspended
              </button>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3.5 border-t border-black/[0.06] flex items-center justify-end gap-2.5 shrink-0">
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
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <UserCog className="w-3.5 h-3.5 text-[#F6CE46]" />
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
