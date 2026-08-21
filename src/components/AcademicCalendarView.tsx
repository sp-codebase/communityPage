import React, { useState } from "react";
import { AcademicDeadline, Milestone, User } from "../types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Filter,
  Check,
  Award,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDueDate, triggerAcademicCelebration } from "../utils/confetti";

interface AcademicCalendarViewProps {
  deadlines: AcademicDeadline[];
  currentUser: User;
  onOpenNewDeadline: () => void;
  onToggleCompleteDeadline: (deadlineId: string) => void;
  onToggleMilestone: (deadlineId: string, milestoneId: string) => void;
  onOpenChatbotWithPrompt: (prompt: string, subject: string) => void;
}

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({
  deadlines,
  currentUser,
  onOpenNewDeadline,
  onToggleCompleteDeadline,
  onToggleMilestone,
  onOpenChatbotWithPrompt,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayString, setSelectedDayString] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [expandedMilestones, setExpandedMilestones] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Unique list of courses for filter
  const courseList = Array.from(new Set(deadlines.map((d) => d.course)));

  // Filter deadlines
  const filteredDeadlines = deadlines.filter((d) => {
    const matchCourse = selectedCourseFilter === "All" || d.course === selectedCourseFilter;
    const matchStatus =
      selectedStatusFilter === "all"
        ? true
        : selectedStatusFilter === "completed"
        ? d.completed
        : !d.completed;
    return matchCourse && matchStatus;
  });

  // Deadlines for selected day in calendar
  const selectedDayDeadlines = deadlines.filter((d) => d.dueDate === selectedDayString);

  // Group deadlines by urgency for the agenda view
  const pendingSorted = [...filteredDeadlines]
    .filter((d) => !d.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const completedList = [...filteredDeadlines]
    .filter((d) => d.completed)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const handleComplete = (id: string, currentCompleted: boolean) => {
    if (!currentCompleted) {
      triggerAcademicCelebration();
    }
    onToggleCompleteDeadline(id);
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5 text-indigo-400" />
                Semester Deadlines & Pacing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Deadlines & Schedule
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Synchronize assignments, lab reports, midterm exams, and research papers with AI study milestone breakdown.
            </p>
          </div>

          <button
            onClick={onOpenNewDeadline}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            <PlusCircle className="h-4 w-4" />
            Add Deadline / Project
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Calendar, Right side Upcoming Agenda & Milestone Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Month Calendar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            
            {/* Month Nav Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {monthNames[month]} {year}
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {deadlines.filter((d) => {
                    const dObj = new Date(d.dueDate);
                    return dObj.getFullYear() === year && dObj.getMonth() === month;
                  }).length} Tasks This Month
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty padding days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[85px] bg-slate-950/40 rounded-xl border border-slate-900/50 p-1 opacity-30" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                const isSelected = dateStr === selectedDayString;
                const isToday = dateStr === new Date().toISOString().split("T")[0];

                const dayDeadlines = deadlines.filter((d) => d.dueDate === dateStr);
                const hasHighPriority = dayDeadlines.some((d) => d.priority === "high" && !d.completed);
                const hasMediumPriority = dayDeadlines.some((d) => d.priority === "medium" && !d.completed);
                const allCompleted = dayDeadlines.length > 0 && dayDeadlines.every((d) => d.completed);

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDayString(dateStr)}
                    className={`min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/30"
                        : isToday
                        ? "bg-slate-800/90 border-slate-600"
                        : "bg-slate-850/60 hover:bg-slate-800 border-slate-800"
                    }`}
                  >
                    {/* Day number & today marker */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-indigo-300"
                            : isToday
                            ? "h-5 w-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px]"
                            : "text-slate-300"
                        }`}
                      >
                        {dayNum}
                      </span>

                      {/* Dots indicator for tasks */}
                      {dayDeadlines.length > 0 && (
                        <div className="flex items-center gap-0.5">
                          {hasHighPriority ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          ) : hasMediumPriority ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          ) : allCompleted ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Deadline chips preview */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayDeadlines.slice(0, 2).map((dl) => (
                        <div
                          key={dl.id}
                          className={`text-[9px] truncate px-1 py-0.5 rounded font-medium ${
                            dl.completed
                              ? "bg-emerald-950/40 text-emerald-300 line-through opacity-70"
                              : dl.priority === "high"
                              ? "bg-rose-950/60 text-rose-200 border-l border-rose-500"
                              : "bg-indigo-950/60 text-indigo-200"
                          }`}
                        >
                          {dl.title}
                        </div>
                      ))}
                      {dayDeadlines.length > 2 && (
                        <div className="text-[8px] text-slate-400 font-semibold px-1">
                          +{dayDeadlines.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Day Overview Sub-bar */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  Events on {new Date(selectedDayString + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="text-xs text-slate-400">
                  ({selectedDayDeadlines.length} scheduled)
                </span>
              </div>
              <button
                onClick={onOpenNewDeadline}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add to this day
              </button>
            </div>

            {/* Details of Selected Day */}
            {selectedDayDeadlines.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedDayDeadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                          {dl.type.replace("_", " ")}
                        </span>
                        <span className="text-xs text-slate-400">{dl.course}</span>
                        {dl.dueTime && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {dl.dueTime}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-white mt-1">{dl.title}</div>
                      {dl.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{dl.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleComplete(dl.id, dl.completed)}
                      className={`p-2 rounded-xl transition ${
                        dl.completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-slate-600"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Deadlines Agenda & AI Study Plan Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Filter Bar for Deadlines */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                Deadlines Agenda ({filteredDeadlines.length})
              </h3>
              
              {/* Status toggle */}
              <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedStatusFilter("all")}
                  className={`px-2 py-1 rounded ${
                    selectedStatusFilter === "all" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStatusFilter("pending")}
                  className={`px-2 py-1 rounded ${
                    selectedStatusFilter === "pending" ? "bg-indigo-600 text-white font-bold" : "text-slate-400"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setSelectedStatusFilter("completed")}
                  className={`px-2 py-1 rounded ${
                    selectedStatusFilter === "completed" ? "bg-emerald-600 text-white font-bold" : "text-slate-400"
                  }`}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Course Dropdown Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Course:</span>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All Courses ({deadlines.length})</option>
                {courseList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Deadlines with Milestones progress */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {pendingSorted.length === 0 && completedList.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800 p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-white">All caught up!</div>
                <div className="text-[11px] text-slate-400 mt-1">No deadlines found with this filter.</div>
              </div>
            ) : (
              <>
                {/* Pending Tasks */}
                {pendingSorted.map((dl) => {
                  const { label: dueLabel, urgency } = formatDueDate(dl.dueDate);
                  const isExpanded = expandedMilestones[dl.id];
                  const totalMilestones = dl.milestones?.length || 0;
                  const completedMilestones = dl.milestones?.filter((m) => m.completed).length || 0;
                  const progressPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

                  return (
                    <div
                      key={dl.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition space-y-3"
                    >
                      {/* Top Row: Course + Urgency Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-indigo-400 truncate max-w-[200px]">
                          {dl.course}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            urgency === "urgent"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                              : urgency === "soon"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {dueLabel}
                        </span>
                      </div>

                      {/* Main Title & Type */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {dl.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {dl.type.replace("_", " ")}
                            </span>
                            {dl.weightage && <span>• {dl.weightage}</span>}
                            {dl.dueTime && <span>• {dl.dueTime}</span>}
                          </div>
                        </div>

                        {/* Complete Checkbox Button */}
                        <button
                          onClick={() => handleComplete(dl.id, dl.completed)}
                          className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700"
                          title="Mark Assignment Complete"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Milestones Progress Bar (if available) */}
                      {totalMilestones > 0 && (
                        <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-semibold flex items-center gap-1">
                              <span>Milestones</span>
                              <span className="text-slate-500">
                                ({completedMilestones}/{totalMilestones})
                              </span>
                            </span>
                            <button
                              onClick={() => toggleExpand(dl.id)}
                              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5 text-[10px]"
                            >
                              {isExpanded ? (
                                <>
                                  Hide Details <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  View Steps <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          {/* Expanded milestones list */}
                          {isExpanded && (
                            <div className="space-y-1.5 pt-1 border-t border-slate-800">
                              {dl.milestones?.map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => onToggleMilestone(dl.id, m.id)}
                                  className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] cursor-pointer transition ${
                                    m.completed
                                      ? "bg-emerald-950/20 text-emerald-300 line-through opacity-70"
                                      : "bg-slate-800/80 text-slate-200 hover:bg-slate-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={m.completed}
                                      onChange={() => {}}
                                      className="rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                                    />
                                    <span>{m.title}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {m.targetDate ? new Date(m.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick AI Study Plan Generator Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-500 font-mono text-[10px]">
                          Due: {dl.dueDate}
                        </span>
                        <button
                          onClick={() =>
                            onOpenChatbotWithPrompt(
                              `I need an effective study & revision plan to prepare for this deadline: "${dl.title}" for ${dl.course}, due on ${dl.dueDate}. What are the key concepts and daily checklist?`,
                              dl.course
                            )
                          }
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          Generate AI Study Plan
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Completed Section (if any) */}
                {completedList.length > 0 && selectedStatusFilter !== "pending" && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Completed ({completedList.length})
                    </div>
                    {completedList.map((dl) => (
                      <div
                        key={dl.id}
                        className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between gap-2 opacity-60 hover:opacity-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <div>
                            <div className="text-xs font-bold text-slate-300 line-through">
                              {dl.title}
                            </div>
                            <div className="text-[10px] text-slate-500">{dl.course}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onToggleCompleteDeadline(dl.id)}
                          className="text-[10px] text-slate-400 hover:text-indigo-300"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
