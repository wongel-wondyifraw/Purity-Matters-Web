"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { ResourcesTable } from "@/components/resources/ResourcesTable";

export default function ResourcesPage() {
  return (
    <AdminShell>
      <ResourcesTable />
    </AdminShell>
  );
}
