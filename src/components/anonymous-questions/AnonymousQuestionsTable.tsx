"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Clock,
  Send,
  ShieldAlert,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { AnonymousQuestionRecord } from "@/types/admin";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { TablePagination } from "@/components/ui/TablePagination";

export function AnonymousQuestionsTable() {
  const {
    anonymousQuestions,
    answerAnonymousQuestion,
    deleteAnonymousQuestion,
    isQuestionsLoading,
    syncWithRemoteBackend,
    hardRefresh,
    isRefreshing,
  } = useAdminData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuestion, setSelectedQuestion] =
    useState<AnonymousQuestionRecord | null>(null);
  const [answerDraft, setAnswerDraft] = useState<string>("");
  const [postToChannel, setPostToChannel] = useState<boolean>(true);
  const [questionToDelete, setQuestionToDelete] =
    useState<AnonymousQuestionRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const counselorName = useMemo(() => {
    if (!user) return "Admin Pastoral Care";
    return user.fullName || `${user.firstName} ${user.lastName || ""}`.trim() || "Pastoral Counselor";
  }, [user]);

  const filteredQuestions = useMemo(() => {
    return anonymousQuestions.filter((item) => {
      const matchSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [anonymousQuestions, searchQuery, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  const handleOpenAnswer = (q: AnonymousQuestionRecord) => {
    setSelectedQuestion(q);
    setAnswerDraft(q.answer || "");
    setPostToChannel(!q.postedToChannel);
  };

  const handleSendAnswer = () => {
    if (!selectedQuestion || !answerDraft.trim()) return;
    answerAnonymousQuestion(
      selectedQuestion.id,
      answerDraft.trim(),
      counselorName,
      postToChannel
    );
    setSelectedQuestion(null);
    setAnswerDraft("");
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/[0.06] pb-3.5 sm:pb-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Anonymous Questions & Confidential Inquiries</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Sensitive purity, intimacy, and spiritual questions submitted anonymously via the Telegram bot.
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* 1. Search Box: Always on top on mobile */}
          <div className="relative w-full sm:w-56 lg:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search question, topic, ref..."
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0 w-full"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          {/* 2. Below Search on Mobile: All Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Filter Dropdown */}
            <CustomDropdown
              id="select-anonymous-questions-filter"
              value={statusFilter}
              options={[
                { value: "all", label: "All Questions" },
                { value: "pending", label: "Pending Response" },
                { value: "answered", label: "Answered / Replied" },
              ]}
              onChange={setStatusFilter}
              className="shrink-0 flex-1 sm:flex-none"
              triggerClassName="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs h-9"
            />

            {/* Quick Hard Refresh Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => hardRefresh()}
              disabled={isRefreshing}
              className="bg-white/80 border-black/10 rounded-full h-9 px-3 text-xs text-[#202328] hover:bg-white shadow-2xs cursor-pointer flex items-center gap-1.5"
              title="Hard refresh questions from live server"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isRefreshing ? "animate-spin text-[#F6CE46]" : "text-[#202328]"
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        {/* Table Container fitting viewport height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                  <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 w-28 shrink-0">
                    Ref #
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[130px]">
                    Category
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[280px] max-w-[500px]">
                    Question Content
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[120px]">
                    Received
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 min-w-[120px]">
                    Status
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 text-right px-4 min-w-[110px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isQuestionsLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={`aq-skel-${idx}`} className="border-b border-black/[0.04]">
                      <TableCell className="px-4 py-3 align-top"><Skeleton className="h-4 w-16 rounded-md" /></TableCell>
                      <TableCell className="align-top"><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-1">
                          <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                      </TableCell>
                      <TableCell className="align-top"><Skeleton className="h-3.5 w-24" /></TableCell>
                      <TableCell className="align-top"><Skeleton className="h-5 w-18 rounded-full" /></TableCell>
                      <TableCell className="text-right px-4 align-top"><Skeleton className="h-6 w-16 rounded-full ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredQuestions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-neutral-500 text-sm"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <p className="font-semibold text-[#202328] text-sm">
                          No Anonymous Questions
                        </p>
                        <p className="text-xs text-neutral-500">
                          {searchQuery || statusFilter !== "all"
                            ? "No questions match your current search filters."
                            : "No confidential inquiries submitted yet. Questions sent anonymously through the bot will appear here."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedQuestions.map((q) => (
                    <TableRow
                      key={q.id}
                      className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-bold text-[#202328] px-4 py-3.5 align-top">
                        {q.referenceNumber}
                      </TableCell>
                      <TableCell className="py-3.5 align-top min-w-[130px]">
                        <span className="bg-[#202328]/5 border border-black/10 text-[#202328] font-semibold text-[11px] px-2.5 py-1 rounded-full inline-block">
                          {q.category}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 align-top min-w-[280px] max-w-[500px] whitespace-normal">
                        <div className="flex flex-col items-start gap-1.5">
                          <div className="border border-black/10 bg-white text-xs text-[#202328] font-medium px-3 py-1.5 rounded-xl shadow-2xs max-w-full whitespace-normal break-words leading-relaxed text-left">
                            "{q.question}"
                          </div>
                          {q.answer && (
                            <div className="text-[11px] text-neutral-600 bg-neutral-100/90 border border-black/5 rounded-lg px-2.5 py-1 whitespace-normal break-words leading-normal max-w-full text-left">
                              <span className="font-semibold text-neutral-700">↳ Answer:</span> {q.answer}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-500 text-xs font-medium py-3.5 align-top min-w-[120px]">
                        {q.submittedAt}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 items-start">
                          {q.status === "answered" ? (
                            <span className="inline-flex items-center gap-1.5 bg-[#F6CE46]/25 border border-[#F6CE46]/40 text-[#202328] text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-[#202328]" />
                              <span>Answered</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-neutral-100 border border-black/10 text-neutral-600 text-xs font-semibold px-2.5 py-1 rounded-full shadow-2xs">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              <span>Pending</span>
                            </span>
                          )}
                          {q.postedToChannel && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-[#0088cc] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Send className="w-2.5 h-2.5" />
                              <span>Channel</span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Dialog
                            open={selectedQuestion?.id === q.id}
                            onOpenChange={(isOpen) => {
                              if (isOpen) handleOpenAnswer(q);
                              else setSelectedQuestion(null);
                            }}
                          >
                            <DialogTrigger className="inline-flex items-center justify-center rounded-full text-xs font-semibold transition-all bg-[#202328] hover:bg-black text-white h-7 px-3.5 shadow-2xs cursor-pointer border-0">
                              {q.status === "answered" ? "View / Edit" : "Respond"}
                            </DialogTrigger>
                            <DialogContent className="max-w-lg bg-white rounded-2xl border border-black/10 max-h-[88vh] p-6 sm:p-7 flex flex-col overflow-hidden">
                              {/* Top-Right 1/4th Quadrant Watermark Icon under Close button */}
                              <div className="absolute -top-16 -right-16 pointer-events-none select-none text-black/[0.03] z-0">
                                <HelpCircle className="w-36 h-36" strokeWidth={1} />
                              </div>

                              <DialogHeader className="relative z-10 shrink-0 pb-3 border-b border-black/[0.06]">
                                <div className="flex items-center gap-2">
                                  <span className="bg-[#202328] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                    {q.referenceNumber}
                                  </span>
                                  <span className="text-xs text-neutral-500 font-medium">
                                    {q.category}
                                  </span>
                                </div>
                                <DialogTitle className="text-base font-bold text-[#202328] mt-2 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
                                  <span>Anonymous Inquirer Question</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                                  Submitted {q.submittedAt}. The sender's identity is strictly anonymous.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-3 flex-1 min-h-0 overflow-y-auto pr-1">
                                {/* Question display */}
                                <div className="p-3.5 bg-neutral-50 border border-black/[0.08] rounded-xl text-xs text-[#202328] leading-relaxed">
                                  <p className="font-semibold text-neutral-500 text-[11px] mb-1 flex items-center gap-1.5">
                                    <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
                                    Confidential Client Inquiry:
                                  </p>
                                  "{q.question}"
                                </div>

                                {/* Response Draft */}
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-[#202328] flex items-center justify-between">
                                    <span>Pastoral Counsel Response:</span>
                                    {q.answeredAt && (
                                      <span className="text-[11px] text-neutral-400 font-normal">
                                        Last updated: {q.answeredAt}
                                      </span>
                                    )}
                                  </label>
                                  <textarea
                                    rows={4}
                                    placeholder="Type compassionate, scripture-rooted pastoral response..."
                                    className="w-full text-xs p-3 border border-black/10 rounded-xl focus:border-[#202328] focus:ring-0 outline-none resize-none bg-white"
                                    value={answerDraft}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                      setAnswerDraft(e.target.value)
                                    }
                                  />
                                </div>

                                {/* Telegram Channel Broadcast Option */}
                                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc] shrink-0">
                                      <Send className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[#202328] truncate">
                                        Broadcast to Telegram Channel
                                      </p>
                                      <p className="text-[10px] text-neutral-500 truncate">
                                        Publish formatted question & pastoral counsel tagged with topic
                                      </p>
                                    </div>
                                  </div>
                                  <input
                                    type="checkbox"
                                    id={`broadcast-channel-${q.id}`}
                                    checked={postToChannel}
                                    onChange={(e) => setPostToChannel(e.target.checked)}
                                    className="w-4 h-4 rounded text-[#202328] accent-[#202328] cursor-pointer shrink-0"
                                  />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs"
                                    onClick={() => setSelectedQuestion(null)}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-[#202328] hover:bg-black text-white rounded-full text-xs font-semibold px-4 flex items-center gap-1.5"
                                    onClick={handleSendAnswer}
                                    disabled={!answerDraft.trim()}
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>
                                      {q.status === "answered"
                                        ? "Update Response"
                                        : "Send Response"}
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <button
                            type="button"
                            onClick={() => {
                              setQuestionToDelete(q);
                              setIsDeleteModalOpen(true);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title={`Delete Question ${q.referenceNumber}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalItems={filteredQuestions.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="questions"
      />

      {/* Confirmation Modal for Permanent Deletion */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setQuestionToDelete(null);
        }}
        onConfirm={async () => {
          if (!questionToDelete) return;
          setIsDeleting(true);
          try {
            await deleteAnonymousQuestion(questionToDelete.id);
          } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setQuestionToDelete(null);
          }
        }}
        title="Delete Anonymous Question"
        itemName={
          questionToDelete
            ? `${questionToDelete.referenceNumber} — "${questionToDelete.question}"`
            : undefined
        }
        description="Are you sure you want to permanently delete this anonymous question? It will be removed from the pastoral dashboard and community public wisdom answers."
        isDeleting={isDeleting}
      />
    </Card>
  );
}
