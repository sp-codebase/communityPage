import React from "react";
import { AcademicDeadline, User } from "../types";
import {
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  Calendar,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { formatDueDate } from "../utils/confetti";

interface AcademicOverviewBarProps {
  deadlines: AcademicDeadline[];
  currentUser: User;
  onNavigateToCalendar: () => void;
  onNavigateToCommunity: () => void;
  onOpenChatbot: () => void;
}

export const AcademicOverviewBar: React.FC<AcademicOverviewBarProps> = ({
  deadlines,
  currentUser,
  onNavigateToCalendar,
  onNavigateToCommunity,
  onOpenChatbot,
}) => {
  // Urgent deadlines in next 3 days
  const pendingUrgent = deadlines
    .filter((d) => !d.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      
      {/* Left: Active Persona Status */}
      <div className="flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{currentUser.name}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                currentUser.role === "teacher"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : currentUser.role === "ta"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              }`}
            >
              {currentUser.role}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {currentUser.institution} • <span className="text-amber-400 font-semibold">{currentUser.reputation} Academic Karma</span>
          </div>
        </div>
      </div>

      {/* Center: Urgent Upcoming Deadlines Carousel/Chips */}
      <div className="flex-1 overflow-x-auto py-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            Next Due:
          </span>

          {pendingUrgent.length === 0 ? (
            <span className="text-xs text-slate-400">No urgent deadlines pending.</span>
          ) : (
            pendingUrgent.map((dl) => {
              const { label, urgency } = formatDueDate(dl.dueDate);
              return (
                <button
                  key={dl.id}
                  onClick={onNavigateToCalendar}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 transition text-left whitespace-nowrap"
                >
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[150px]">
                    {dl.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                      urgency === "urgent"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Quick ScholarBot Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenChatbot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow transition whitespace-nowrap"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span>Ask ScholarBot AI</span>
        </button>
      </div>

    </div>
  );
};
