"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  HeartHandshake,
  User,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Phone,
  Shield,
  MessageCircle,
  Video,
  Users,
  Sparkles,
  RefreshCw,
  Plus,
  Search,
  Building,
  Heart,
  Zap,
  Sunrise,
  Sun,
  Moon,
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

interface ConcernOption {
  id: string;
  label: string;
  botTag: string;
  icon: React.ReactNode;
  description: string;
}

const CONCERN_OPTIONS: ConcernOption[] = [
  {
    id: "personal",
    label: "Personal Concern",
    botTag: "Personal",
    icon: <User className="w-4 h-4 text-[#202328]" />,
    description: "Individual spiritual struggles, habit renewal, mindset clarity",
  },
  {
    id: "relationship",
    label: "Relationship Concern",
    botTag: "Relationship",
    icon: <HeartHandshake className="w-4 h-4 text-[#202328]" />,
    description: "Premarital counseling, courtship questions, healthy boundaries",
  },
  {
    id: "family",
    label: "Family Concern",
    botTag: "Family",
    icon: <Users className="w-4 h-4 text-[#202328]" />,
    description: "Family dynamics, reconciliation, parenting guidance",
  },
  {
    id: "purity",
    label: "Purity & Mindset Concern",
    botTag: "Purity",
    icon: <Shield className="w-4 h-4 text-[#202328]" />,
    description: "Freedom from pornography, sexual purity, spiritual restoration",
  },
  {
    id: "emotional",
    label: "Emotional Concern",
    botTag: "Emotional Concerns",
    icon: <Heart className="w-4 h-4 text-[#202328]" />,
    description: "Grief, depression, anxiety, unresolved emotional trauma",
  },
];

interface MethodOption {
  id: string;
  label: string;
  botTag: string;
  icon: React.ReactNode;
  hint: string;
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    id: "telegram",
    label: "Telegram Chat / Audio",
    botTag: "Telegram Chat",
    icon: <MessageCircle className="w-4 h-4 text-[#202328]" />,
    hint: "Encrypted messaging or voice call directly on Telegram",
  },
  {
    id: "phone",
    label: "Direct Phone Call",
    botTag: "Phone Call",
    icon: <Phone className="w-4 h-4 text-[#202328]" />,
    hint: "Direct cellular phone call to client phone number",
  },
  {
    id: "video",
    label: "Secure Video Call",
    botTag: "Video Call",
    icon: <Video className="w-4 h-4 text-[#202328]" />,
    hint: "Confidential Google Meet, Zoom, or Telegram video session",
  },
  {
    id: "in_person",
    label: "In-Person (if available)",
    botTag: "In-Person",
    icon: <Building className="w-4 h-4 text-[#202328]" />,
    hint: "Confidential face-to-face pastoral office meeting",
  },
];

interface TimeOption {
  id: string;
  label: string;
  botTag: string;
  icon: React.ReactNode;
  hours: string;
}

const TIME_OPTIONS: TimeOption[] = [
  {
    id: "next",
    label: "Next Available Appointment",
    botTag: "Next Available",
    icon: <Zap className="w-4 h-4 text-[#202328]" />,
    hours: "Earliest open slot across all pastoral counselors",
  },
  {
    id: "morning",
    label: "Morning (9:00 AM - 12:00 PM)",
    botTag: "Morning (9am - 12pm)",
    icon: <Sunrise className="w-4 h-4 text-[#202328]" />,
    hours: "Between 09:00 AM and 12:00 PM EAT",
  },
  {
    id: "afternoon",
    label: "Afternoon (1:00 PM - 5:00 PM)",
    botTag: "Afternoon (1pm - 5pm)",
    icon: <Sun className="w-4 h-4 text-[#202328]" />,
    hours: "Between 01:00 PM and 05:00 PM EAT",
  },
  {
    id: "evening",
    label: "Evening (6:00 PM - 9:00 PM)",
    botTag: "Evening (6pm - 9pm)",
    icon: <Moon className="w-4 h-4 text-[#202328]" />,
    hours: "Between 06:00 PM and 09:00 PM EAT",
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
    preferredTime: "Next Available Appointment",
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
      preferredTime: "Next Available Appointment",
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
  const isStep3Valid =
    formState.preferredMethod.trim().length > 0 &&
    formState.preferredTime.trim().length > 0;

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
        className="bg-[#202328] hover:bg-black text-white text-xs h-8.5 px-4 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all"
      >
        <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
        <span>New Counselling Request</span>
      </DialogTrigger>

      <DialogContent className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-2xl shadow-2xl rounded-2xl p-6 overflow-hidden flex flex-col max-h-[92vh]">
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
                { step: 1, title: "Client Info" },
                { step: 2, title: "Concern & Details" },
                { step: 3, title: "Format & Window" },
                { step: 4, title: "Review & Assign" },
              ].map((s) => {
                const isActive = currentStep === s.step;
                const isDone = currentStep > s.step;
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
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive
                          ? "bg-[#F6CE46] text-[#202328]"
                          : isDone
                          ? "bg-[#202328] text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3" /> : s.step}
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
        <div className="flex-1 min-h-0 overflow-y-auto py-3 pr-1 space-y-4 relative z-10">
          {/* STEP 1: CLIENT SELECTION */}
          {currentStep === 1 && (
            <div id="counseling-step-1" className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-xs font-bold text-[#202328] uppercase tracking-wider">
                    Step 1: Client Identification
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Select a registered client or manually enter client information.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-full border border-black/10">
                  <button
                    type="button"
                    onClick={() => setClientMode("existing")}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      clientMode === "existing"
                        ? "bg-white text-[#202328] shadow-2xs"
                        : "text-neutral-500 hover:text-[#202328]"
                    }`}
                  >
                    Registered Client
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientMode("manual");
                      setSelectedClientId(null);
                    }}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      clientMode === "manual"
                        ? "bg-white text-[#202328] shadow-2xs"
                        : "text-neutral-500 hover:text-[#202328]"
                    }`}
                  >
                    Walk-in / External
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

                  <div className="border border-black/[0.08] rounded-2xl bg-neutral-50/40 p-2 space-y-1.5 max-h-48 overflow-y-auto">
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
                                ? "bg-white border-[#202328] shadow-xs ring-1 ring-[#202328]"
                                : "bg-white/80 border-black/[0.06] hover:bg-white hover:border-black/20"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected
                                    ? "bg-[#202328] text-white"
                                    : "bg-neutral-100 text-[#202328]"
                                }`}
                              >
                                {client.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#202328] truncate">
                                  {client.fullName}
                                </div>
                                <div className="text-[11px] text-neutral-500 truncate">
                                  {client.phone && client.phone !== "Not shared"
                                    ? client.phone
                                    : client.username
                                    ? `@${client.username}`
                                    : `ID: ${client.telegramId}`}
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-1 text-[11px] font-bold text-[#202328] bg-[#F6CE46]/30 px-2 py-0.5 rounded-full border border-[#F6CE46]/50">
                                <Check className="w-3 h-3" />
                                <span>Selected</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Summary of Selected Client */}
                  {selectedClientId && (
                    <div className="p-3 bg-neutral-100/70 border border-black/10 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-neutral-500 font-medium">Selected Client: </span>
                        <span className="font-bold text-[#202328]">{formState.clientName}</span>
                        {formState.phone && (
                          <span className="text-neutral-500 ml-2">({formState.phone})</span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-black/10 text-neutral-600">
                        TG ID: {formState.telegramId || "Linked"}
                      </span>
                    </div>
                  )}
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
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-white/10 text-white"
                                : "bg-neutral-200/60 text-[#202328]"
                            }`}
                          >
                            {c.icon}
                          </div>
                          <span className="font-bold text-xs">{c.label}</span>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
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

          {/* STEP 3: SESSION METHOD & APPOINTMENT WINDOW */}
          {currentStep === 3 && (
            <div id="counseling-step-3" className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#202328] uppercase tracking-wider">
                  Step 3: Session Format & Appointment Window
                </h4>
                <p className="text-xs text-neutral-500">
                  Select the communication channel and preferred schedule matching the bot flow.
                </p>
              </div>

              {/* Preferred Method (4 choices) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#202328] block">
                  Preferred Session Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {METHOD_OPTIONS.map((m) => {
                    const isSelected = formState.preferredMethod === m.label;
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
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-white/10 text-white"
                              : "bg-neutral-200/60 text-[#202328]"
                          }`}
                        >
                          {m.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{m.label}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
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

              {/* Preferred Time Window (4 choices) */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <label className="text-xs font-semibold text-[#202328] block">
                  Preferred Appointment Window
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TIME_OPTIONS.map((t) => {
                    const isSelected = formState.preferredTime === t.label;
                    return (
                      <div
                        key={t.id}
                        id={`time-card-${t.id}`}
                        onClick={() =>
                          setFormState({ ...formState, preferredTime: t.label })
                        }
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-[#202328] text-white border-[#202328] shadow-md ring-1 ring-[#202328]"
                            : "bg-neutral-50/70 border-black/[0.08] hover:bg-white hover:border-black/20 text-[#202328]"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-white/10 text-white"
                              : "bg-neutral-200/60 text-[#202328]"
                          }`}
                        >
                          {t.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{t.label}</span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[#F6CE46] text-[#202328] flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 leading-snug ${
                              isSelected ? "text-neutral-300" : "text-neutral-500"
                            }`}
                          >
                            {t.hours}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

              {/* Status and Counselor Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-neutral-50/70 rounded-2xl border border-black/[0.06]">
                {/* Initial Status */}
                <div>
                  <label className="text-xs font-semibold text-[#202328] block mb-1">
                    Initial Status
                  </label>
                  <select
                    id="select-initial-status"
                    value={formState.status}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        status: e.target.value as NewCounselingPayload["status"],
                      })
                    }
                    className="w-full bg-white border border-black/15 text-xs rounded-xl px-3 py-2 text-[#202328] font-medium focus:outline-none focus:ring-1 focus:ring-[#202328] cursor-pointer"
                  >
                    <option value="pending">Pending (Unassigned)</option>
                    <option value="assigned">Assigned to Counselor</option>
                    <option value="scheduled">Scheduled Appointment</option>
                    <option value="completed">Completed Session</option>
                  </select>
                </div>

                {/* Counselor Assignment with Search-enabled dropdown */}
                <div>
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
                    <Sparkles className="w-3.5 h-3.5 text-[#F6CE46]" />
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
                      Time Window
                    </span>
                    <span className="text-neutral-700 font-medium">
                      {formState.preferredTime}
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

                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                      Assigned To
                    </span>
                    <span className="text-neutral-700 font-medium">
                      {formState.assignedTo || "— Unassigned —"}
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
