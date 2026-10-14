"use client";

import React from "react";
import { AdminShell } from "@/components/shell/AdminShell";
import { ActivitiesView } from "@/components/activities/ActivitiesView";

export default function ActivitiesPage() {
  return (
    <AdminShell>
      <ActivitiesView />
    </AdminShell>
  );
}
