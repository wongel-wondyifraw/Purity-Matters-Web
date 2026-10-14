"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { ClientsTable } from "@/components/clients/ClientsTable";

export default function ClientsPage() {
  return (
    <AdminShell>
      <ClientsTable />
    </AdminShell>
  );
}
