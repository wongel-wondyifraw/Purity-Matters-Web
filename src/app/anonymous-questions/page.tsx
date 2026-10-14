"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { AnonymousQuestionsTable } from "@/components/anonymous-questions/AnonymousQuestionsTable";

export default function AnonymousQuestionsPage() {
  return (
    <AdminShell>
      <AnonymousQuestionsTable />
    </AdminShell>
  );
}
