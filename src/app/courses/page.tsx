"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { CoursesTable } from "@/components/courses/CoursesTable";

export default function CoursesPage() {
  return (
    <AdminShell>
      <CoursesTable />
    </AdminShell>
  );
}
