"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { UsersManagement } from "@/components/users/UsersManagement";

export default function UsersPage() {
  return (
    <AdminShell>
      <UsersManagement />
    </AdminShell>
  );
}
