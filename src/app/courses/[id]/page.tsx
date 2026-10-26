"use client";

import React from "react";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/shell/AdminShell";
import { CourseDetailsView } from "@/components/courses/CourseDetailsView";

export default function CourseDetailPage() {
  const params = useParams();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const courseId = Number(idStr) || 0;

  return (
    <AdminShell>
      <CourseDetailsView courseId={courseId} />
    </AdminShell>
  );
}
