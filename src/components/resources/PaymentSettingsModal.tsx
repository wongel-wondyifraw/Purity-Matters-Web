"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, CheckCircle2, ShieldCheck, Smartphone, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminData } from "@/context/AdminDataContext";
import { PaymentAccountDetail } from "@/types/admin";

export function PaymentSettingsModal() {
  const { paymentSettings, updatePaymentSettings } = useAdminData();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Telebirr state
  const [telebirrAccountName, setTelebirrAccountName] = useState("");
  const [telebirrAccountNumber, setTelebirrAccountNumber] = useState("");
  const [telebirrShortcode, setTelebirrShortcode] = useState("");
  const [telebirrInstructions, setTelebirrInstructions] = useState("");
  const [telebirrIsActive, setTelebirrIsActive] = useState(true);

  // CBE state
  const [cbeAccountName, setCbeAccountName] = useState("");
  const [cbeAccountNumber, setCbeAccountNumber] = useState("");
  const [cbeBranch, setCbeBranch] = useState("");
  const [cbeInstructions, setCbeInstructions] = useState("");
  const [cbeIsActive, setCbeIsActive] = useState(true);

  useEffect(() => {
    if (paymentSettings) {
      if (paymentSettings.telebirr) {
        setTelebirrAccountName(paymentSettings.telebirr.accountName || "");
        setTelebirrAccountNumber(paymentSettings.telebirr.accountNumber || "");
        setTelebirrShortcode(paymentSettings.telebirr.branchOrShortcode || "");
        setTelebirrInstructions(paymentSettings.telebirr.instructions || "");
        setTelebirrIsActive(paymentSettings.telebirr.isActive ?? true);
      }
      if (paymentSettings.cbe) {
        setCbeAccountName(paymentSettings.cbe.accountName || "");
        setCbeAccountNumber(paymentSettings.cbe.accountNumber || "");
        setCbeBranch(paymentSettings.cbe.branchOrShortcode || "");
        setCbeInstructions(paymentSettings.cbe.instructions || "");
        setCbeIsActive(paymentSettings.cbe.isActive ?? true);
      }
    }
  }, [paymentSettings, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: {
        telebirr: Partial<PaymentAccountDetail>;
        cbe: Partial<PaymentAccountDetail>;
      } = {
        telebirr: {
          accountName: telebirrAccountName.trim(),
          accountNumber: telebirrAccountNumber.trim(),
          branchOrShortcode: telebirrShortcode.trim() || undefined,
          instructions: telebirrInstructions.trim() || undefined,
          isActive: telebirrIsActive,
        },
        cbe: {
          accountName: cbeAccountName.trim(),
          accountNumber: cbeAccountNumber.trim(),
          branchOrShortcode: cbeBranch.trim() || undefined,
          instructions: cbeInstructions.trim() || undefined,
          isActive: cbeIsActive,
        },
      };

      const success = await updatePaymentSettings(payload);
      if (success) {
        setIsOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger id="btn-open-payment-settings" className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-semibold flex items-center gap-1.5 transition-all shrink-0">
        <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
        <span>Payment</span>
      </DialogTrigger>

      <DialogContent id="modal-payment-settings" className="bg-white border border-black/[0.08] text-[#202328] w-full sm:max-w-xl md:max-w-2xl shadow-2xl rounded-2xl p-6 max-h-[88vh] flex flex-col overflow-hidden">
        {/* Decorative Top-Right Watermark */}
        <div className="absolute -top-16 -right-16 pointer-events-none select-none text-black/[0.04] z-0">
          <CreditCard className="w-36 h-36" strokeWidth={1.2} />
        </div>

        <DialogHeader className="pb-3 border-b border-black/[0.06] relative z-10 shrink-0">
          <div>
            <DialogTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Ministry Payment Accounts</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              Set official Telebirr and CBE accounts displayed on Telegram bot for resource purchases.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3 flex-1 min-h-0 overflow-y-auto pr-1.5">
          {/* Telebirr Section Card */}
          <div className="border border-black/[0.08] rounded-xl p-4 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#005cb9]/10 text-[#005cb9] flex items-center justify-center font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#202328]">Telebirr Mobile Payment</h4>
                  <p className="text-[10px] text-neutral-500">Instant Ethio Telecom Mobile Money</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTelebirrIsActive(!telebirrIsActive)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all flex items-center gap-1 ${
                  telebirrIsActive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-neutral-200 text-neutral-600 border border-neutral-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${telebirrIsActive ? "bg-emerald-600" : "bg-neutral-500"}`} />
                <span>{telebirrIsActive ? "Active on Bot" : "Disabled"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Account / Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 0911234567"
                  value={telebirrAccountNumber}
                  onChange={(e) => setTelebirrAccountNumber(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328] font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Account Name / Receiver <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Purity Matters Ministry"
                  value={telebirrAccountName}
                  onChange={(e) => setTelebirrAccountName(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Shortcode / Merchant ID (Optional)
                </label>
                <Input
                  placeholder="e.g. 482910"
                  value={telebirrShortcode}
                  onChange={(e) => setTelebirrShortcode(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Checkout Instruction Note
                </label>
                <Input
                  placeholder="e.g. Include your Telegram name in remarks"
                  value={telebirrInstructions}
                  onChange={(e) => setTelebirrInstructions(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328]"
                />
              </div>
            </div>
          </div>

          {/* CBE Section Card */}
          <div className="border border-black/[0.08] rounded-xl p-4 bg-neutral-50/50 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6a1b9a]/10 text-[#6a1b9a] flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#202328]">Commercial Bank of Ethiopia (CBE)</h4>
                  <p className="text-[10px] text-neutral-500">CBE Birr / Direct Bank Account Transfer</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCbeIsActive(!cbeIsActive)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all flex items-center gap-1 ${
                  cbeIsActive
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-neutral-200 text-neutral-600 border border-neutral-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cbeIsActive ? "bg-emerald-600" : "bg-neutral-500"}`} />
                <span>{cbeIsActive ? "Active on Bot" : "Disabled"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Bank Account Number <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 1000123456789"
                  value={cbeAccountNumber}
                  onChange={(e) => setCbeAccountNumber(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328] font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Purity Matters Ministry"
                  value={cbeAccountName}
                  onChange={(e) => setCbeAccountName(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Branch Name (Optional)
                </label>
                <Input
                  placeholder="e.g. Finfine Branch / Addis Ababa"
                  value={cbeBranch}
                  onChange={(e) => setCbeBranch(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Checkout Instruction Note
                </label>
                <Input
                  placeholder="e.g. Upload screenshot or confirm reference on bot"
                  value={cbeInstructions}
                  onChange={(e) => setCbeInstructions(e.target.value)}
                  className="bg-white border-black/15 rounded-xl h-9 px-3 text-xs text-[#202328]"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-between border-t border-black/[0.06]">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accounts update in real-time on Telegram bot</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="rounded-full text-xs h-9 px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#202328] hover:bg-black text-white rounded-full text-xs font-semibold h-9 px-5 shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#F6CE46]" />
                <span>{isSubmitting ? "Saving..." : "Save Settings"}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
