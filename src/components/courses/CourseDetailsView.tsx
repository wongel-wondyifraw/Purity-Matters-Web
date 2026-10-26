"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Layers,
  FileText,
  Download,
  CheckCircle2,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCode,
  Music,
  Video,
  FileArchive,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminData } from "@/context/AdminDataContext";
import { fetchCourseDetailsApi } from "@/services/adminApi";
import {
  CourseCatalogItem,
  CourseModuleItem,
  CourseSectionItem,
  CourseMaterialItem,
} from "@/types/admin";
import { EditCourseModal } from "./EditCourseModal";
import { CreateModuleModal } from "./CreateModuleModal";
import { EditModuleModal } from "./EditModuleModal";
import { CreateSectionModal } from "./CreateSectionModal";
import { UploadMaterialModal } from "./UploadMaterialModal";

interface CourseDetailsViewProps {
  courseId: number;
}

export function CourseDetailsView({ courseId }: CourseDetailsViewProps) {
  const router = useRouter();
  const { apiUrl, deleteCourse, deleteCourseModule, deleteCourseSection, deleteCourseMaterial } =
    useAdminData();

  const [course, setCourse] = useState<CourseCatalogItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModuleItem | null>(null);
  const [creatingSectionModuleId, setCreatingSectionModuleId] = useState<number | null>(null);
  const [uploadingSection, setUploadingSection] = useState<{
    moduleId: number;
    sectionId: number;
    sectionTitle: string;
  } | null>(null);

  // Collapsed modules state
  const [collapsedModules, setCollapsedModules] = useState<Record<number, boolean>>({});

  const toggleModuleCollapse = (moduleId: number) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const loadCourse = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCourseDetailsApi(courseId);
      if (!data) {
        setError(`Course #${courseId} was not found.`);
      } else {
        setCourse(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load course details.");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (
      window.confirm(
        `Are you sure you want to delete "${course.name}"? This will permanently delete all its modules, sections, and stored files.`
      )
    ) {
      const success = await deleteCourse(course.id);
      if (success) {
        router.push("/courses");
      }
    }
  };

  const handleDeleteModule = async (moduleId: number, title: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete module "${title}" and all its sections and materials?`
      )
    ) {
      const success = await deleteCourseModule(courseId, moduleId);
      if (success) {
        loadCourse();
      }
    }
  };

  const handleDeleteSection = async (sectionId: number, title: string) => {
    if (window.confirm(`Delete section "${title}"?`)) {
      const success = await deleteCourseSection(sectionId);
      if (success) {
        loadCourse();
      }
    }
  };

  const handleDeleteMaterial = async (materialId: number, title: string) => {
    if (window.confirm(`Remove material "${title}"?`)) {
      const success = await deleteCourseMaterial(materialId);
      if (success) {
        loadCourse();
      }
    }
  };

  const getFullFileUrl = (filePath: string) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http")) return filePath;
    return `${apiUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-rose-500" />;
      case "audio":
        return <Music className="w-4 h-4 text-indigo-500" />;
      case "video":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "archive":
        return <FileArchive className="w-4 h-4 text-amber-500" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileCode className="w-4 h-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col gap-4 p-4 max-w-6xl mx-auto w-full animate-pulse">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-56 w-full rounded-3xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#202328] mb-1">Course Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-md mb-4">{error || "Could not retrieve course data."}</p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#202328] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Courses</span>
        </Link>
      </div>
    );
  }

  const modules = course.modules || [];
  const bannerUrl = course.bannerImage ? getFullFileUrl(course.bannerImage) : null;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 pb-24">
      {/* 1. TOP BREADCRUMB / BACK LINK */}
      <div className="flex items-center justify-between">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-[#202328] transition-colors group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white/80 border border-black/10 flex items-center justify-center group-hover:bg-[#202328] group-hover:text-white transition-all shadow-2xs">
            <ArrowLeft className="w-3.5 h-3.5" />
          </div>
          <span>Back to All Courses</span>
        </Link>

        {/* Course Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditCourseOpen(true)}
            className="rounded-full text-xs h-8 px-3.5 bg-white/80 border-black/10 hover:border-black/30 font-semibold cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-neutral-700" />
            <span>Edit Course</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDeleteCourse}
            className="rounded-full text-xs h-8 px-3 text-red-600 bg-white/80 border-red-200 hover:bg-red-50 font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* 2. COURSE HERO BANNER & HEADER */}
      <div className="relative rounded-3xl overflow-hidden border border-black/[0.08] shadow-md bg-[#202328] text-white">
        {bannerUrl ? (
          <div className="relative w-full h-48 sm:h-64">
            <img
              src={bannerUrl}
              alt={course.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#202328] via-[#202328]/60 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-36 bg-gradient-to-br from-[#202328] to-neutral-800" />
        )}

        <div className="p-5 sm:p-7 relative -mt-20 sm:-mt-24">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F6CE46] text-[#202328] text-xs font-black shadow-xs tracking-wide">
              {course.theme}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                course.type === "free"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {course.type === "free"
                ? "Free Course"
                : `${course.price.toLocaleString()} ${course.currency}`}
            </span>
            <span className="text-xs text-neutral-300 font-medium ml-auto">
              {modules.length} {modules.length === 1 ? "Module" : "Modules"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {course.name}
          </h1>

          {course.description && (
            <p className="text-xs sm:text-sm text-neutral-300 max-w-3xl mt-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>
      </div>

      {/* 3. GENERAL OBJECTIVE & LEARNING OUTCOMES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* General Objective */}
        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#F6CE46]/20 text-[#202328] flex items-center justify-center">
              <Target className="w-4 h-4 text-[#202328]" />
            </div>
            <h3 className="text-sm font-bold text-[#202328]">General Objective</h3>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed flex-1 mt-1">
            {course.generalObjective ||
              "Equip and empower learners to walk in divine identity, emotional wholeness, and sustainable purity."}
          </p>
        </Card>

        {/* Learning Outcomes */}
        <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-[#202328]">Learning Outcomes</h3>
          </div>
          {course.learningOutcomes && course.learningOutcomes.length > 0 ? (
            <ul className="space-y-1.5 mt-1">
              {course.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-neutral-400 italic mt-1">
              No specific learning outcomes added yet. Click &quot;Edit Course&quot; to define knowledge and skills.
            </p>
          )}
        </Card>
      </div>

      {/* 4. MODULES & CURRICULUM MANAGEMENT */}
      <Card className="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold text-[#202328] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6CE46]" />
              <span>Curriculum & Learning Modules</span>
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500 mt-0.5">
              Organise course modules, define sections, and attach study guides, audio, and slides.
            </CardDescription>
          </div>

          <Button
            type="button"
            onClick={() => setIsCreateModuleOpen(true)}
            className="bg-[#202328] hover:bg-black text-white text-xs h-9 px-4 rounded-full cursor-pointer shadow-2xs font-bold flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
            <span>Add Module</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {modules.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mb-2">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#202328]">No Modules Defined Yet</h4>
              <p className="text-xs text-neutral-500 max-w-sm mt-1 mb-4">
                Start structuring this course by adding its first module. Each module can have sections and attached learning files.
              </p>
              <Button
                type="button"
                onClick={() => setIsCreateModuleOpen(true)}
                className="bg-[#202328] hover:bg-black text-white rounded-full text-xs font-bold px-4 h-9 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
                <span>Create First Module</span>
              </Button>
            </div>
          ) : (
            modules.map((mod, modIdx) => {
              const isCollapsed = !!collapsedModules[mod.id];
              const sections = mod.sections || [];
              const modBanner = mod.bannerImage ? getFullFileUrl(mod.bannerImage) : null;

              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs transition-all"
                >
                  {/* Module Header Bar */}
                  <div
                    onClick={() => toggleModuleCollapse(mod.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50/70 hover:bg-neutral-50 cursor-pointer border-b border-black/[0.06] gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-[#202328] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {modIdx + 1}
                      </span>
                      {modBanner && (
                        <img
                          src={modBanner}
                          alt={mod.title}
                          className="w-10 h-7 rounded-md object-cover border border-black/10 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#202328] truncate flex items-center gap-2">
                          <span>{mod.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700 shrink-0">
                            {sections.length} {sections.length === 1 ? "Section" : "Sections"}
                          </span>
                        </h4>
                        {mod.description && (
                          <p className="text-xs text-neutral-500 truncate mt-0.5">
                            {mod.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Module Actions */}
                    <div
                      className="flex items-center gap-1.5 self-end sm:self-auto shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setCreatingSectionModuleId(mod.id)}
                        className="text-xs h-7 px-2.5 font-bold text-[#202328] hover:bg-black/5 rounded-full flex items-center gap-1 cursor-pointer"
                        title="Add Section"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#F6CE46]" />
                        <span>Section</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingModule(mod)}
                        className="h-7 w-7 p-0 text-neutral-500 hover:text-[#202328] hover:bg-black/5 rounded-full cursor-pointer"
                        title="Edit Module"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteModule(mod.id, mod.title)}
                        className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>

                      <button
                        type="button"
                        onClick={() => toggleModuleCollapse(mod.id)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer ml-1"
                        aria-label="Toggle Module"
                      >
                        {isCollapsed ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Module Content / Sections List */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 space-y-4">
                      {sections.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-black/10 rounded-xl bg-neutral-50/50">
                          <p className="text-xs text-neutral-500 mb-2">
                            No sections created for this module yet.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setCreatingSectionModuleId(mod.id)}
                            className="bg-neutral-200 hover:bg-neutral-300 text-[#202328] text-xs font-semibold rounded-full h-8 px-3 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            <span>Add Section</span>
                          </Button>
                        </div>
                      ) : (
                        sections.map((sec, secIdx) => {
                          const materials = sec.materials || [];

                          return (
                            <div
                              key={sec.id}
                              className="rounded-xl border border-black/[0.06] p-3.5 sm:p-4 bg-white/70 hover:border-black/15 transition-colors space-y-3"
                            >
                              {/* Section Title & Header */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs font-black text-neutral-400">
                                    {modIdx + 1}.{secIdx + 1}
                                  </span>
                                  <h5 className="text-xs sm:text-sm font-bold text-[#202328] truncate">
                                    {sec.title}
                                  </h5>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setUploadingSection({
                                        moduleId: mod.id,
                                        sectionId: sec.id,
                                        sectionTitle: sec.title,
                                      })
                                    }
                                    className="text-[11px] h-7 px-2.5 rounded-full font-bold bg-[#F6CE46]/20 hover:bg-[#F6CE46]/40 text-[#202328] border-[#F6CE46]/40 cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3 text-[#202328]" />
                                    <span>Material</span>
                                  </Button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSection(sec.id, sec.title)}
                                    className="p-1 text-neutral-300 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                                    title="Delete Section"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Additional Content / Notes */}
                              {sec.additionalContent && (
                                <p className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-black/5 leading-relaxed">
                                  {sec.additionalContent}
                                </p>
                              )}

                              {/* Attached Learning Materials */}
                              <div>
                                <div className="text-[11px] font-bold text-neutral-400 mb-1.5 flex items-center justify-between">
                                  <span>Attached Learning Materials ({materials.length})</span>
                                  <span className="text-[10px] text-neutral-400">
                                    Storage: <code>uploads/courses/{course.slug}/{mod.slug}/</code>
                                  </span>
                                </div>

                                {materials.length === 0 ? (
                                  <div className="text-xs text-neutral-400 italic p-2 bg-neutral-50/50 rounded-lg border border-dashed border-black/5 flex items-center justify-between">
                                    <span>No files attached yet.</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setUploadingSection({
                                          moduleId: mod.id,
                                          sectionId: sec.id,
                                          sectionTitle: sec.title,
                                        })
                                      }
                                      className="text-xs font-bold text-[#202328] hover:underline cursor-pointer"
                                    >
                                      + Upload File
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {materials.map((mat) => {
                                      const downloadUrl = getFullFileUrl(mat.filePath);

                                      return (
                                        <div
                                          key={mat.id}
                                          className="flex items-center justify-between gap-2 p-2.5 bg-neutral-50 hover:bg-neutral-100/70 rounded-xl border border-black/5 transition-colors group"
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-2xs">
                                              {renderFileIcon(mat.fileType)}
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-xs font-bold text-[#202328] truncate">
                                                {mat.title || mat.fileName}
                                              </p>
                                              <p className="text-[10px] text-neutral-400 truncate">
                                                {mat.fileName} • {formatSize(mat.fileSizeBytes)}
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0">
                                            <a
                                              href={downloadUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              download={mat.fileName}
                                              className="p-1 text-neutral-500 hover:text-[#202328] hover:bg-white rounded-md transition-colors"
                                              title="Download / Open Material"
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                            </a>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteMaterial(mat.id, mat.title || mat.fileName)
                                              }
                                              className="p-1 text-neutral-400 hover:text-red-500 hover:bg-white rounded-md transition-colors cursor-pointer"
                                              title="Delete file"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* MODALS */}
      <EditCourseModal
        course={course}
        isOpen={isEditCourseOpen}
        onClose={() => {
          setIsEditCourseOpen(false);
          loadCourse();
        }}
      />

      <CreateModuleModal
        courseId={courseId}
        isOpen={isCreateModuleOpen}
        onClose={() => setIsCreateModuleOpen(false)}
        onSuccess={loadCourse}
      />

      <EditModuleModal
        courseId={courseId}
        module={editingModule}
        isOpen={!!editingModule}
        onClose={() => setEditingModule(null)}
        onSuccess={loadCourse}
      />

      {creatingSectionModuleId && (
        <CreateSectionModal
          courseId={courseId}
          moduleId={creatingSectionModuleId}
          isOpen={!!creatingSectionModuleId}
          onClose={() => setCreatingSectionModuleId(null)}
          onSuccess={loadCourse}
        />
      )}

      {uploadingSection && (
        <UploadMaterialModal
          courseId={courseId}
          moduleId={uploadingSection.moduleId}
          sectionId={uploadingSection.sectionId}
          sectionTitle={uploadingSection.sectionTitle}
          isOpen={!!uploadingSection}
          onClose={() => setUploadingSection(null)}
          onSuccess={loadCourse}
        />
      )}
    </div>
  );
}
