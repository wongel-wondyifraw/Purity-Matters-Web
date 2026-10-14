"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Clock,
  Send,
  ShieldAlert,
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
import { useAdminData } from "@/context/AdminDataContext";
import { useAuth } from "@/context/AuthContext";
import { AnonymousQuestionRecord } from "@/types/admin";

export function AnonymousQuestionsTable() {
  const { anonymousQuestions, answerAnonymousQuestion } = useAdminData();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedQuestion, setSelectedQuestion] =
    useState<AnonymousQuestionRecord | null>(null);
  const [answerDraft, setAnswerDraft] = useState<string>("");

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

  const handleOpenAnswer = (q: AnonymousQuestionRecord) => {
    setSelectedQuestion(q);
    setAnswerDraft(q.answer || "");
  };

  const handleSendAnswer = () => {
    if (!selectedQuestion || !answerDraft.trim()) return;
    answerAnonymousQuestion(selectedQuestion.id, answerDraft.trim(), counselorName);
    setSelectedQuestion(null);
    setAnswerDraft("");
  };

  return (
    <Card className="flex-1 flex flex-col min-h-0 h-full bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-2xl shadow-2xs overflow-hidden">
      <CardHeader className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-[#202328] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F6CE46] shrink-0" />
            <span>Anonymous Questions & Confidential Inquiries</span>
          </CardTitle>
          <CardDescription className="text-xs text-neutral-500 font-normal mt-0.5">
            Sensitive purity, intimacy, and spiritual questions submitted anonymously via the Telegram bot.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search question, topic, ref..."
              className="bg-white/80 border-black/10 rounded-full pl-9 h-9 text-xs text-[#202328] shadow-2xs focus:border-[#202328] focus:ring-0"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          {/* Filter Dropdown */}
          <select
            className="bg-white/80 border border-black/10 text-xs rounded-full px-3.5 py-1.5 text-[#202328] font-medium shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#202328] cursor-pointer h-9"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">All Questions</option>
            <option value="pending">Pending Response</option>
            <option value="answered">Answered / Replied</option>
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-4 p-4 overflow-hidden">
        {/* Table Container fitting viewport height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden border border-black/[0.06] rounded-2xl bg-white/50 shadow-2xs">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-neutral-100/95 backdrop-blur-xs shadow-2xs">
                <TableRow className="border-b border-black/[0.06] hover:bg-transparent">
                  <TableHead className="text-[#202328] font-bold text-xs py-3 px-4 w-28">
                    Ref #
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 w-48">
                    Category
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3">
                    Question Content
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 w-36">
                    Received
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 w-32">
                    Status
                  </TableHead>
                  <TableHead className="text-[#202328] font-bold text-xs py-3 text-right px-4 w-32">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.length === 0 ? (
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
                  filteredQuestions.map((q) => (
                    <TableRow
                      key={q.id}
                      className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors"
                    >
                      <TableCell className="font-mono text-xs font-bold text-[#202328] px-4">
                        {q.referenceNumber}
                      </TableCell>
                      <TableCell>
                        <span className="bg-[#202328]/5 border border-black/10 text-[#202328] font-semibold text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap">
                          {q.category}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-xs text-[#202328] font-medium line-clamp-2">
                          "{q.question}"
                        </p>
                        {q.answer && (
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1 italic">
                            ↳ Answer: {q.answer}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-neutral-500 text-xs font-medium">
                        {q.submittedAt}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right px-4">
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
                          <DialogContent className="max-w-lg bg-white rounded-2xl border border-black/10 max-h-[88vh] flex flex-col overflow-hidden">
                            {/* Top-Right 1/4th Quadrant Watermark Icon under Close button */}
                            <div className="absolute -top-18 -right-18 pointer-events-none select-none text-black/[0.05] z-0">
                              <HelpCircle className="w-36 h-36" strokeWidth={1.2} />
                            </div>

                            <DialogHeader className="relative z-10 shrink-0">
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
                              <DialogDescription className="text-xs text-neutral-500">
                                Submitted {q.submittedAt}. The sender's identity is strictly anonymous.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2 flex-1 min-h-0 overflow-y-auto pr-1">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
