import React, { useState } from "react";
import { AcademicDeadline, DeadlineType, Milestone, User } from "../types";
import {
  X,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface NewDeadlineModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (deadline: Omit<AcademicDeadline, "id">) => void;
}

const COURSES = [
  "PHYS 301 - Modern Quantum Mechanics",
  "CS 161 - Design & Analysis of Algorithms",
  "CS 244B - Distributed Systems",
  "CHEM 130 - Advanced Organic Lab",
  "MATH 53 - Multivariable Calculus",
  "PHIL 215 - Tech & Human Values",
  "BIO 204 - Molecular Genetics",
  "ECON 101 - Microeconomic Theory",
  "Other Course",
];

export const NewDeadlineModal: React.FC<NewDeadlineModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState(COURSES[0]);
  const [customCourse, setCustomCourse] = useState("");
  const [type, setType] = useState<DeadlineType>("assignment");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [dueTime, setDueTime] = useState("23:59");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("high");
  const [weightage, setWeightage] = useState("15% of total grade");
  const [instructor, setInstructor] = useState(
    currentUser.role === "teacher" ? currentUser.name : "Course Instructor"
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["AcademicDeadline"]);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isGeneratingMilestones, setIsGeneratingMilestones] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: `m-custom-${Date.now()}`,
        title: "New study milestone",
        targetDate: dueDate,
        estimatedHours: 2,
        completed: false,
      },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleUpdateMilestone = (index: number, field: keyof Milestone, val: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: val };
    setMilestones(updated);
  };

  // AI Milestone generator
  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      setAiError("Please enter a Title for your assignment first.");
      return;
    }
    setAiError("");
    setIsGeneratingMilestones(true);

    try {
      const response = await fetch("/api/breakdown-deadline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          course: course === "Other Course" ? customCourse : course,
          dueDate,
          description,
          type,
        }),
      });

      const data = await response.json();
      if (data.milestones && Array.isArray(data.milestones)) {
        const mapped: Milestone[] = data.milestones.map((m: any, idx: number) => ({
          id: `m-ai-${Date.now()}-${idx}`,
          title: m.title || `Milestone ${idx + 1}`,
          targetDate: m.targetDate || dueDate,
          estimatedHours: m.estimatedHours || 3,
          notes: m.notes,
          completed: false,
        }));
        setMilestones(mapped);
      }
    } catch (err: any) {
      console.error(err);
      setAiError("Could not auto-generate milestones at this time.");
    } finally {
      setIsGeneratingMilestones(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      course: course === "Other Course" && customCourse ? customCourse : course,
      type,
      dueDate,
      dueTime,
      priority,
      completed: false,
      tags: tags.length > 0 ? tags : ["Deadline"],
      instructor: instructor || currentUser.name,
      weightage: weightage || "Standard",
      milestones,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              Add Academic Deadline & Project Milestones
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track assignments, exams, research papers, and set AI study pacing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-200 text-xs overflow-y-auto flex-1">
          
          {/* Title & Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Deadline Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Systems Lab 3: Raft Consensus"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Course / Subject
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {course === "Other Course" && (
                <input
                  type="text"
                  value={customCourse}
                  onChange={(e) => setCustomCourse(e.target.value)}
                  placeholder="Enter custom course name..."
                  className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder-slate-400"
                />
              )}
            </div>
          </div>

          {/* Type & Priority & Weightage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Deliverable Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeadlineType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white capitalize"
              >
                <option value="assignment">Assignment / Problem Set</option>
                <option value="project">Project Deliverable</option>
                <option value="exam">Midterm / Final Exam</option>
                <option value="paper_submission">Research Paper / Essay</option>
                <option value="lab_report">Lab Report</option>
                <option value="quiz">Quiz</option>
                <option value="presentation">Presentation</option>
                <option value="study_group">Study Group Session</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "high" | "medium" | "low")}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white capitalize"
              >
                <option value="high">High Priority 🔴</option>
                <option value="medium">Medium Priority 🟡</option>
                <option value="low">Low Priority 🟢</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Grade Weightage
              </label>
              <input
                type="text"
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
                placeholder="e.g. 20% of final grade"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-400"
              />
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description & Syllabus notes */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Instructions & Syllabus Criteria
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rubric notes, required chapters, submission format (PDF/Github), etc."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-400 resize-none"
            />
          </div>

          {/* Milestones & AI Smart Breakdown Section */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-indigo-400" />
                  Study Milestones & Intermediate Deadlines
                </h4>
                <p className="text-[11px] text-slate-400">
                  Break large tasks into manageable study checkpoints
                </p>
              </div>

              {/* AI Auto-generate button */}
              <button
                type="button"
                onClick={handleAiBreakdown}
                disabled={isGeneratingMilestones}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isGeneratingMilestones ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Generating Milestones...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                    AI Smart Breakdown
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {aiError}
              </p>
            )}

            {/* List of Milestones */}
            <div className="space-y-2">
              {milestones.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-xs border border-dashed border-slate-700 rounded-lg">
                  No intermediate milestones added. Click "AI Smart Breakdown" or add manually below.
                </div>
              ) : (
                milestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-700/80"
                  >
                    <span className="text-[10px] font-bold text-indigo-400 min-w-[24px]">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                      placeholder="Milestone title..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                    <input
                      type="date"
                      value={m.targetDate}
                      onChange={(e) => handleUpdateMilestone(idx, "targetDate", e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={m.estimatedHours || 2}
                        onChange={(e) =>
                          handleUpdateMilestone(idx, "estimatedHours", parseInt(e.target.value) || 1)
                        }
                        title="Estimated Hours"
                        className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs text-center"
                      />
                      <span className="text-[10px] text-slate-400">hrs</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="p-1 text-slate-400 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 mt-1"
              >
                <Plus className="h-3 w-3" />
                Add custom milestone step
              </button>
            </div>

          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !dueDate}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg transition"
            >
              Save to Academic Calendar
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
