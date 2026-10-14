"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { User, Search, Check, ChevronDown, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAdminData } from "@/context/AdminDataContext";

export interface SearchableCounselorSelectProps {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableCounselorSelect({
  id = "counselor-select",
  value,
  onChange,
  placeholder = "Select Counselor",
  className = "",
  disabled = false,
}: SearchableCounselorSelectProps) {
  const { user: currentUser } = useAuth();
  const { systemUsers, clients } = useAdminData();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Current user's full name
  const myName = useMemo(() => {
    if (!currentUser) return "";
    return (
      currentUser.fullName ||
      `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
    );
  }, [currentUser]);

  // Deduplicated list of available registered users in the system
  const userOptions = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      role?: string;
      emailOrPhone?: string;
      isCurrentUser?: boolean;
    }> = [];
    const seen = new Set<string>();

    // 1. Current user first if available
    if (myName) {
      seen.add(myName.toLowerCase());
      list.push({
        id: "current-user",
        name: myName,
        role: currentUser?.role || "Staff",
        emailOrPhone: currentUser?.email,
        isCurrentUser: true,
      });
    }

    // 2. Console system users (/api/users)
    if (Array.isArray(systemUsers)) {
      systemUsers.forEach((u) => {
        const name = (
          u.fullName ||
          `${u.firstName} ${u.lastName || ""}`.trim()
        ).trim();
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({
            id: `sys-${u.id}`,
            name,
            role: u.role || "Staff",
            emailOrPhone: u.email,
          });
        }
      });
    }

    // 3. Registered clients/counselors from database
    if (Array.isArray(clients)) {
      clients.forEach((c) => {
        const name = (c.fullName || "").trim();
        if (name && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          list.push({
            id: `client-${c.id}`,
            name,
            role: c.role || "Client",
            emailOrPhone: c.phone && c.phone !== "Not shared" ? c.phone : undefined,
          });
        }
      });
    }

    // Fallback standard counselors if none found
    const defaults = ["Pastor Samuel", "Pastor Daniel", "Dr. Selam"];
    defaults.forEach((defName, idx) => {
      if (!seen.has(defName.toLowerCase())) {
        seen.add(defName.toLowerCase());
        list.push({
          id: `def-${idx}`,
          name: defName,
          role: "Counselor",
        });
      }
    });

    return list;
  }, [systemUsers, clients, currentUser, myName]);

  // Filter based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return userOptions;
    const q = searchQuery.toLowerCase().trim();
    return userOptions.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.emailOrPhone && u.emailOrPhone.toLowerCase().includes(q))
    );
  }, [userOptions, searchQuery]);

  const handleSelect = (selectedName: string) => {
    onChange(selectedName);
    setIsOpen(false);
  };

  const displayText = value || placeholder;

  return (
    <div
      ref={dropdownRef}
      id={`${id}-container`}
      className={`relative w-full text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-white hover:bg-neutral-50/80 border border-black/15 text-[#202328] h-9.5 px-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#202328] cursor-pointer transition-all"
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate">{displayText}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={`${id}-menu`}
          className="absolute z-50 mt-1 w-full min-w-[240px] rounded-xl bg-white border border-black/10 shadow-xl p-1.5 text-[#202328] overflow-hidden no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Search Input */}
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              id={`${id}-search-input`}
              type="text"
              placeholder="Search counselor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-black/10 rounded-lg pl-8 pr-7 py-1.5 text-xs text-[#202328] focus:outline-none focus:bg-white focus:border-[#202328] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#202328]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div
            className="max-h-56 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 space-y-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >

            {/* List of Registered Users */}
            {filteredOptions.length === 0 ? (
              <div className="p-2.5 text-center text-xs text-neutral-400">
                No users found
              </div>
            ) : (
              filteredOptions.map((u) => {
                const isSelected =
                  value.trim().toLowerCase() === u.name.trim().toLowerCase();
                return (
                  <div
                    key={u.id}
                    id={`${id}-opt-${u.id}`}
                    onClick={() => handleSelect(u.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? "bg-[#202328] text-white font-semibold"
                        : "hover:bg-neutral-100 text-[#202328]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{u.name}</span>
                      {u.role && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium capitalize ${
                            isSelected
                              ? "bg-white/20 text-neutral-200"
                              : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {u.role}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                  </div>
                );
              })
            )}

            {/* Custom counselor name entry if searched */}
            {searchQuery.trim().length > 1 &&
              !userOptions.some(
                (u) =>
                  u.name.toLowerCase().trim() ===
                  searchQuery.toLowerCase().trim()
              ) && (
                <div
                  id={`${id}-custom-entry`}
                  onClick={() => handleSelect(searchQuery.trim())}
                  className="mt-1 pt-1 border-t border-black/10 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer text-xs flex items-center justify-between text-[#202328]"
                >
                  <span className="truncate">
                    Assign &quot;{searchQuery.trim()}&quot;
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-500">
                    Custom
                  </span>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
