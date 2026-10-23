"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  type LucideIcon,
  HeartHandshake,
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  Phone,
  Shield,
  MessageCircle,
  Video,
  Users,
  ClipboardCheck,
  RefreshCw,
  Plus,
  Search,
  Building,
  Heart,
  FastForward,
} from "lucide-react";
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
import { useAdminData, NewCounselingPayload } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";
import { SearchableCounselorSelect } from "./SearchableCounselorSelect";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

interface ConcernOption {
  id: string;
  label: string;
  botTag: string;
  icon: LucideIcon;
  description: string;
}

const CONCERN_OPTIONS: ConcernOption[] = [
  {
    id: "personal",
    label: "Personal Concern",
    botTag: "Personal",
    icon: User,
    description: "Individual spiritual struggles, habit renewal, mindset clarity",
  },
  {
    id: "relationship",
    label: "Relationship Concern",
    botTag: "Relationship",
    icon: HeartHandshake,
    description: "Premarital counseling, courtship questions, healthy boundaries",
  },
  {
    id: "family",
    label: "Family Concern",
    botTag: "Family",
    icon: Users,
    description: "Family dynamics, reconciliation, parenting guidance",
  },
  {
    id: "purity",
    label: "Purity & Mindset Concern",
    botTag: "Purity",
    icon: Shield,
    description: "Freedom from pornography, sexual purity, spiritual restoration",
  },
  {
    id: "emotional",
    label: "Emotional Concern",
    botTag: "Emotional Concerns",
    icon: Heart,
    description: "Grief, depression, anxiety, unresolved emotional trauma",
  },
];

interface MethodOption {
  id: string;
  label: string;
  botTag: string;
  icon: LucideIcon;
  hint: string;
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    id: "telegram",
    label: "Telegram Chat / Audio",
    botTag: "Telegram Chat",
    icon: MessageCircle,
    hint: "Encrypted messaging or voice call directly on Telegram",
  },
  {
    id: "phone",
    label: "Direct Phone Call",
    botTag: "Phone Call",
    icon: Phone,
    hint: "Direct cellular phone call to client phone number",
  },
  {
    id: "video",
    label: "Secure Video Call",
    botTag: "Video Call",
    icon: Video,
    hint: "Confidential Google Meet, Zoom, or Telegram video session",
  },
  {
    id: "in_person",
    label: "In-Person (if available)",
    botTag: "In-Person",
    icon: Building,
    hint: "Confidential face-to-face pastoral office meeting",
  },
];



export function AddCounselingModal() {
  const { clients, addCounselingRequest } = useAdminData();
  const { user: currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current user's full name
  const myName = useMemo(() => {
    if (!currentUser) return "";
    return (
      currentUser.fullName ||
      `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
    );
  }, [currentUser]);

  // Step 1: Client Selection mode ('existing' | 'manual')
  const [clientMode, setClientMode] = useState<"existing" | "manual">("existing");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Form State matching Bot Intake requirements (Default counselor is "Me")
  const [formState, setFormState] = useState<NewCounselingPayload>({
    clientName: "",
    phone: "",
    telegramId: "",
    concern: "Personal Concern",
    description: "",
    preferredMethod: "Telegram Chat / Audio",
    status: "pending",
    assignedTo: myName,
    scheduledAt: "",
  });

  // Keep assignedTo synced with current user name if initially empty
  useEffect(() => {
    if (myName && !formState.assignedTo) {
      setFormState((prev) => ({ ...prev, assignedTo: myName }));
    }
  }, [myName, formState.assignedTo]);

  // Filter clients for searchable picker
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 8);
    const q = clientSearch.toLowerCase();
    return clients
      .filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.username && c.username.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [clients, clientSearch]);

  // Counselors list for assignment
  const availableCounselors = useMemo(() => {
    const fromRoles = clients
      .filter((c) => c.role === "counselor" || c.role === "admin")
      .map((c) => c.fullName);
    const defaults = ["Pastor Samuel", "Pastor Daniel", "Dr. Selam", "Sister Marta"];
    return Array.from(new Set([...defaults, ...fromRoles]));
  }, [clients]);

  // Handle existing client select
  const handleSelectClient = (client: (typeof clients)[0]) => {
    setSelectedClientId(client.id);
    setFormState((prev) => ({
      ...prev,
      clientName: client.fullName,
      phone: client.phone && client.phone !== "Not shared" ? client.phone : "",
      telegramId: client.telegramId ? String(client.telegramId) : "",
    }));
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedClientId(null);
    setClientSearch("");
    setClientMode("existing");
    setFormState({
      clientName: "",
      phone: "",
      telegramId: "",
      concern: "Personal Concern",
      description: "",
      preferredMethod: "Telegram Chat / Audio",
      status: "pending",
      assignedTo: myName,
      scheduledAt: "",
    });
  };

  // Step 1 Validation
  const isStep1Valid = formState.clientName.trim().length > 0;

  // Step 2 Validation
  const isStep2Valid = formState.concern.trim().length > 0;

  // Step 3 Validation
  const isStep3Valid = formState.preferredMethod.trim().length > 0;

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Valid) return;
    if (currentStep === 2 && !isStep2Valid) return;
    if (currentStep === 3 && !isStep3Valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.clientName.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: NewCounselingPayload = {
        ...formState,
        description:
          formState.description && formState.description.trim().length > 0
            ? formState.description.trim()
            : "Skipped by client",
        assignedTo: formState.assignedTo?.trim() || undefined,
        scheduledAt: formState.scheduledAt || undefined,
      };

      const success = await addCounselingRequest(payload);
      if (success) {
        handleReset();
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) handleReset();
    }}>
      <DialogTrigger
        id="btn-open-add-counseling"
        className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
      >
        <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
        <span>Counseling</span>
      </DialogTrigger>

      <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-2xl shadow-2xl rounded-2xl p-6 overflow-hidden flex flex-col">
        {/* Top-Right Quadrant Watermark Icon under Close button */}
        <div className="absolute -top-16 -right-16 pointer-events-none select-none text-black/[0.04] z-0">
          <HeartHandshake className="w-36 h-36" strokeWidth={1.2} />
        </div>

        {/* Modal Header */}
        <DialogHeader className="pb-3 border-b border-black/[0.06] relative z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F6CE46] shrink-0" />
                <span>Intake New Counselling Request</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                Multi-step intake aligned with Telegram bot counseling workflow.
              </DialogDescription>
            </div>

            <div className="text-[11px] font-bold text-neutral-600 bg-neutral-100 rounded-full px-3 py-1 border border-black/[0.06]">
              Step {currentStep} of 4
            </div>
          </div>

          {/* Stepper Progress Bar & Indicator Pills */}
          <div className="pt-3">
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, title: "Client Info", icon: User },
                { step: 2, title: "Concern & Details", icon: HeartHandshake },
                { step: 3, title: "Session Format", icon: MessageCircle },
                { step: 4, title: "Review & Assign", icon: ClipboardCheck },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isDone = currentStep > s.step;
                const StepIcon = s.icon;
                return (
                  <div
                    key={s.step}
                    id={`stepper-pill-${s.step}`}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all text-xs ${
                      isActive
                        ? "bg-[#202328] text-white border-[#202328] shadow-2xs"
                        : isDone
                        ? "bg-[#F6CE46]/20 text-[#202328] border-[#F6CE46]/40 font-semibold"
                        : "bg-neutral-50 text-neutral-400 border-black/[0.06]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : isDone
                          ? "bg-[#202328] text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <StepIcon
                          className={`w-3 h-3 transition-colors ${
                            isActive ? "text-white" : "text-neutral-500"
                          }`}
                        />
                      )}
                    </div>
                    <span className="truncate text-[11px] font-medium hidden sm:inline">
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Multi-Step Body */}
        <div
          className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-2 pr-0.5 space-y-4 relative z-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* STEP 1: CLIENT SELECTION */}
          {currentStep === 1 && (
            <div id="counseling-step-1" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                <div>
                  <h4 className="text-xs font-bold text-[#202328] uppercase tracking-wider">
                    Step 1: Client Identification
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Select a registered client or manually enter client information.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-full border border-black/10 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setClientMode("existing")}
                    className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      clientMode === "existing"
                        ? "bg-[#202328] text-white shadow-2xs"
                        : "text-neutral-500 hover:text-[#202328]"
                    }`}
                  >
                    <Users
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        clientMode === "existing" ? "text-white" : "text-neutral-500"
                      }`}
                    />
                    <span className="whitespace-nowrap">Registered Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientMode("manual");
                      setSelectedClientId(null);
                    }}
                    className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      clientMode === "manual"
                        ? "bg-[#202328] text-white shadow-2xs"
                        : "text-neutral-500 hover:text-[#202328]"
                    }`}
                  >
                    <User
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        clientMode === "manual" ? "text-white" : "text-neutral-500"
                      }`}
                    />
                    <span className="whitespace-nowrap">Walk-in / External</span>
                  </button>
                </div>
              </div>

              {clientMode === "existing" ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      id="input-client-search"
                      placeholder="Search registered client by name, phone, or username..."
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      className="pl-9 bg-neutral-50/70 hover:bg-white focus:bg-white border-black/15 rounded-xl h-9.5 text-xs text-[#202328]"
                    />
                  </div>

                  <div
                    className="border border-black/[0.08] rounded-2xl bg-neutral-50/40 p-2 space-y-1.5 max-h-48 overflow-y-auto no-scrollbar"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {filteredClients.length === 0 ? (
                      <div className="p-4 text-center text-xs text-neutral-400">
                        No matching clients found. Switch to &quot;Walk-in / External&quot; to add manually.
                      </div>
                    ) : (
                      filteredClients.map((client) => {
                        const isSelected = selectedClientId === client.id;
                        return (
                          <div
                            key={client.id}
                            id={`client-option-${client.id}`}
                            onClick={() => handleSelectClient(client)}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                              isSelected
                                ? "bg-[#202328] text-white border-[#202328] shadow-xs ring-1 ring-[#202328]"
                                : "bg-white/80 border-black/[0.06] hover:bg-white hover:border-black/20 text-[#202328]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-neutral-100 text-[#202328]"
                                }`}
                              >
                                {client.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div
                                  className={`text-xs font-bold truncate transition-colors ${
                                    isSelected ? "text-white" : "text-[#202328]"
                                  }`}
                                >
                                  {client.fullName}
                                </div>
                                <div
                                  className={`text-[11px] truncate transition-colors ${
                                    isSelected ? "text-neutral-300" : "text-neutral-500"
                                  }`}
                                >
                                  {client.phone && client.phone !== "Not shared"
                                    ? client.phone
                                    : client.username
                                    ? `@${client.username}`
                                    : `ID: ${client.telegramId}`}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                                <Check className="w-3 h-3 text-white" />
                                <span>Selected</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-neutral-50/50 rounded-2xl border border-black/[0.06]">
                  <div>
                    <label className="text-xs font-semibold text-[#202328] block mb-1">
                      Full Client Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="input-manual-client-name"
                      required
                      placeholder="e.g. Bethlehem Tadesse"
                      value={formState.clientName}
                      onChange={(e) =>
                        setFormState({ ...formState, clientName: e.target.value })
                      }
                      className="bg-white border-black/15 rounded-xl h-9.5 px-3.5 text-xs text-[#202328]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#202328] block mb-1">
                        Phone Number (Optional)
                      </label>
                      <Input
                        id="input-manual-phone"
                        placeholder="e.g. +251 91 123 4567"
                        value={formState.phone || ""}
                        onChange={(e) =>
                          setFormState({ ...formState, phone: e.target.value })
                        }
                        className="bg-white border-black/15 rounded-xl h-9.5 px-3.5 text-xs text-[#202328]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#202328] block mb-1">
                        Telegram ID (Optional)
                      </label>
                      <Input
                        id="input-manual-telegram-id"
                        placeholder="e.g. 123456789"
                        value={formState.telegramId || ""}
                        onChange={(e) =>
                          setFormState({ ...formState, telegramId: e.target.value })
                        }
                        className="bg-white border-black/15 rounded-xl h-9.5 px-3.5 text-xs text-[#202328]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: CONCERN AREA & DESCRIPTION */}
          {currentStep === 2 && (
            <div id="counseling-step-2" className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#202328] uppercase tracking-wider">
                  Step 2: Concern Category & Brief Description
                </h4>
                <p className="text-xs text-neutral-500">
                  Select one of the 5 primary counselling categories configured in the Telegram bot.
                </p>
              </div>

              {/* 5 Concern Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CONCERN_OPTIONS.map((c) => {
                  const isSelected = formState.concern === c.label;
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.id}
                      id={`concern-card-${c.id}`}
                      onClick={() => setFormState({ ...formState, concern: c.label })}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#202328] text-white border-[#202328] shadow-md ring-1 ring-[#202328]"
                          : "bg-neutral-50/70 border-black/[0.08] hover:bg-white hover:border-black/20 text-[#202328]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-neutral-200/70 text-[#202328]"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 transition-colors ${
                                isSelected ? "text-white" : "text-[#202328]"
                              }`}
                            />
                          </div>
                          <span className="font-bold text-xs">{c.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                            <Check className="w-2.5 h-2.5 stroke-[3] text-white" />
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-1.5 leading-relaxed ${
                          isSelected ? "text-neutral-300" : "text-neutral-500"
                        }`}
                      >
                        {c.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Description Input with Quick Skip */}
              <div className="space-y-1.5 pt-2 border-t border-black/[0.06]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#202328]">
                    Description & Background (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormState({
                        ...formState,
                        description: "Skipped by client (To be shared during session)",
                      })
                    }
                    className="text-[11px] font-semibold text-neutral-500 hover:text-[#202328] underline underline-offset-2 cursor-pointer flex items-center gap-1"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>Skip Context (Share in Session)</span>
                  </button>
                </div>
                <textarea
                  id="textarea-counseling-desc"
                  rows={3}
                  placeholder="Enter context, sensitivity notes, or client concerns (or leave as 'Skipped by client')..."
                  value={formState.description || ""}
                  onChange={(e) =>
                    setFormState({ ...formState, description: e.target.value })
                  }
                  className="w-full bg-neutral-50/70 hover:bg-white focus:bg-white border border-black/15 rounded-xl p-3 text-xs text-[#202328] focus:border-[#202328] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 3: SESSION METHOD */}
          {currentStep === 3 && (
            <div id="counseling-step-3" className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#202328] uppercase tracking-wider">
                  Step 3: Preferred Session Format
                </h4>
                <p className="text-xs text-neutral-500">
                  Select the communication channel for the counselling session.
                </p>
              </div>

              {/* Preferred Method (4 choices) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {METHOD_OPTIONS.map((m) => {
                  const isSelected = formState.preferredMethod === m.label;
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      id={`method-card-${m.id}`}
                      onClick={() =>
                        setFormState({ ...formState, preferredMethod: m.label })
                      }
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "bg-[#202328] text-white border-[#202328] shadow-md ring-1 ring-[#202328]"
                          : "bg-neutral-50/70 border-black/[0.08] hover:bg-white hover:border-black/20 text-[#202328]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-neutral-200/70 text-[#202328]"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isSelected ? "text-white" : "text-[#202328]"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{m.label}</span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/30">
                              <Check className="w-2.5 h-2.5 stroke-[3] text-white" />
                            </div>
                          )}
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 leading-snug ${
                            isSelected ? "text-neutral-300" : "text-neutral-500"
                          }`}
                        >
                          {m.hint}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: ASSIGNMENT, STATUS & CONFIRMATION */}
          {currentStep === 4 && (
            <div id="counseling-step-4" className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#202328] uppercase tracking-wider">
                  Step 4: Assignment & Final Review
                </h4>
                <p className="text-xs text-neutral-500">
                  Assign a pastoral counselor, configure initial status, and review the request.
                </p>
              </div>

              {/* Status and Counselor Row: Compact Status, Wider Counselor Select */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 bg-neutral-50/70 rounded-2xl border border-black/[0.06]">
                {/* Initial Status (Compact) */}
                <div className="w-full sm:w-44 shrink-0">
                  <label className="text-xs font-semibold text-[#202328] block mb-1">
                    Initial Status
                  </label>
                  <CustomDropdown
                    id="select-initial-status"
                    value={formState.status}
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "assigned", label: "Assigned" },
                      { value: "scheduled", label: "Scheduled" },
                      { value: "completed", label: "Completed" },
                    ]}
                    onChange={(val) =>
                      setFormState({
                        ...formState,
                        status: val as NewCounselingPayload["status"],
                      })
                    }
                    variant="rounded"
                    className="w-full"
                    triggerClassName="w-full bg-white hover:bg-neutral-50 border border-black/15 text-xs rounded-xl px-3 h-9.5 text-[#202328] font-medium"
                  />
                </div>

                {/* Counselor Assignment with Search-enabled dropdown (Wider) */}
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-semibold text-[#202328] block mb-1">
                    Assign Counselor
                  </label>
                  <SearchableCounselorSelect
                    id="add-counseling-counselor-select"
                    value={formState.assignedTo || ""}
                    onChange={(val) =>
                      setFormState({ ...formState, assignedTo: val })
                    }
                  />
                </div>
              </div>

              {/* Review Summary Card */}
              <div className="border border-black/[0.08] rounded-2xl p-4 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                  <span className="text-xs font-bold text-[#202328] uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5 text-[#F6CE46]" />
                    <span>Intake Summary Review</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#202328] bg-[#F6CE46]/30 px-2.5 py-0.5 rounded-full border border-[#F6CE46]/40">
                    Ready to Save
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                      Client
                    </span>
                    <span className="font-bold text-[#202328]">{formState.clientName}</span>
                    {formState.phone && (
                      <span className="text-neutral-500 block text-[11px]">
                        {formState.phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                      Concern Area
                    </span>
                    <span className="font-bold text-[#202328]">{formState.concern}</span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                      Session Format
                    </span>
                    <span className="text-neutral-700 font-medium">
                      {formState.preferredMethod}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                      Initial Status
                    </span>
                    <span className="font-bold uppercase text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full border border-black/10 inline-block mt-0.5">
                      {formState.status}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                      Assigned Counselor
                    </span>
                    <span className="text-neutral-800 font-semibold text-xs">
                      {formState.assignedTo || myName || "Me"}
                    </span>
                  </div>
                </div>

                {formState.description && (
                  <div className="pt-2 border-t border-black/[0.04]">
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold mb-1">
                      Client Context / Notes
                    </span>
                    <p className="text-neutral-700 text-xs bg-neutral-50 p-2 rounded-xl border border-black/[0.04]">
                      {formState.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stepper Navigation Footer */}
        <DialogFooter className="pt-3 border-t border-black/[0.06] flex flex-row items-center justify-between sm:justify-between gap-2 shrink-0">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                id="btn-stepper-back"
                onClick={handleBack}
                disabled={isSubmitting}
                className="text-xs h-9 px-4 rounded-full border-black/15 bg-white text-[#202328] hover:bg-neutral-50 cursor-pointer shadow-2xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-xs h-9 px-4 rounded-full text-neutral-500 hover:text-[#202328] cursor-pointer"
              >
                Cancel
              </Button>
            )}
          </div>

          <div>
            {currentStep < 4 ? (
              <Button
                type="button"
                id="btn-stepper-next"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid) ||
                  (currentStep === 3 && !isStep3Valid)
                }
                className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-5 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                id="btn-stepper-submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !isStep1Valid}
                className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-5 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F6CE46]" />
                    <span>Saving Intake...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#F6CE46]" />
                    <span>Submit Counselling Request</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
