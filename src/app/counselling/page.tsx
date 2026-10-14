"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { CounselingTable } from "@/components/counselling/CounselingTable";

export default function CounselingPage() {
  return (
    <AdminShell>
      <CounselingTable />
    </AdminShell>
  );
}
