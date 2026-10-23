"use client";

import React, { useState, useEffect } from "react";
import { Settings, CheckCircle2, Smartphone, Building2 } from "lucide-react";
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

  // Telebirr state: Phone Number and Account Name only
  const [telebirrAccountName, setTelebirrAccountName] = useState("");
  const [telebirrAccountNumber, setTelebirrAccountNumber] = useState("");

  // CBE state: Account Number and Account Name only
  const [cbeAccountName, setCbeAccountName] = useState("");
  const [cbeAccountNumber, setCbeAccountNumber] = useState("");

  useEffect(() => {
    if (paymentSettings) {
      if (paymentSettings.telebirr) {
        setTelebirrAccountName(paymentSettings.telebirr.accountName || "");
        setTelebirrAccountNumber(paymentSettings.telebirr.accountNumber || "");
      }
      if (paymentSettings.cbe) {
        setCbeAccountName(paymentSettings.cbe.accountName || "");
        setCbeAccountNumber(paymentSettings.cbe.accountNumber || "");
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
          isActive: true,
        },
        cbe: {
          accountName: cbeAccountName.trim(),
          accountNumber: cbeAccountNumber.trim(),
          isActive: true,
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
      <DialogTrigger
        id="btn-open-payment-settings"
        className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-[#202328] border border-black/10 flex items-center justify-center cursor-pointer transition-all shadow-2xs shrink-0"
        title="Payment Settings"
        aria-label="Payment Settings"
      >
        <Settings className="w-4 h-4 text-[#202328]" />
      </DialogTrigger>

      <DialogContent
        id="modal-payment-settings"
        className="bg-white border border-black/[0.08] text-[#202328] w-[95vw] sm:max-w-lg md:max-w-xl shadow-2xl rounded-2xl p-5 sm:p-6 max-h-[90vh] flex flex-col overflow-hidden"
      >
        <DialogHeader className="pb-3 border-b border-black/[0.06] shrink-0">
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
              <span>Ministry Payment Accounts</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 mt-0.5">
              Configure official Telebirr and CBE accounts for resource purchases.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 pt-3 flex-1 min-h-0 overflow-y-auto pr-1"
        >
          {/* Telebirr Section Card */}
          <div
            id="card-payment-telebirr"
            className="border border-black/[0.08] rounded-xl p-3.5 sm:p-4 bg-neutral-50/60 space-y-3"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
              <div className="w-7 h-7 rounded-lg bg-[#005cb9]/10 text-[#005cb9] flex items-center justify-center font-bold text-xs shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#202328]">
                  Telebirr Account
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Ethio Telecom Mobile Money
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Phone Number <span className="text-red-500">*</span>
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
                  Name <span className="text-red-500">*</span>
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
          </div>

          {/* CBE Section Card */}
          <div
            id="card-payment-cbe"
            className="border border-black/[0.08] rounded-xl p-3.5 sm:p-4 bg-neutral-50/60 space-y-3"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.06]">
              <div className="w-7 h-7 rounded-lg bg-[#6a1b9a]/10 text-[#6a1b9a] flex items-center justify-center font-bold text-xs shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#202328]">
                  Commercial Bank of Ethiopia (CBE)
                </h4>
                <p className="text-[10px] text-neutral-500">
                  Bank Account Transfer
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202328] block mb-1">
                  Account Number <span className="text-red-500">*</span>
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
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/[0.06]">
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
