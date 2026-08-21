import React from "react";
import { User } from "../types";
import { SAMPLE_USERS } from "../data/initialData";
import {
  GraduationCap,
  MessageSquareText,
  CalendarDays,
  Bot,
  BookOpen,
  Sparkles,
  PlusCircle,
  Award,
  CheckCircle2,
} from "lucide-react";

interface NavbarProps {
  activeTab: "community" | "calendar" | "chatbot" | "resources";
  setActiveTab: (tab: "community" | "calendar" | "chatbot" | "resources") => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  onOpenNewPost: () => void;
  onOpenNewDeadline: () => void;
  urgentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onOpenNewPost,
  onOpenNewDeadline,
  urgentCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  ScholarSphere
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                    Academic Hub
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Community Discussions • AI Doubt Solver • Deadlines Calendar
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="nav-tab-community"
              onClick={() => setActiveTab("community")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "community"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <MessageSquareText className="h-4 w-4" />
              <span>Community Discussions</span>
            </button>

            <button
              id="nav-tab-calendar"
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === "calendar"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              <span>Deadlines Calendar</span>
              {urgentCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-sm">
                  {urgentCount}
                </span>
              )}
            </button>

            <button
              id="nav-tab-chatbot"
              onClick={() => setActiveTab("chatbot")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "chatbot"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm font-semibold"
                  : "text-cyan-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="flex items-center gap-1">
                ScholarBot AI
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
            </button>

            <button
              id="nav-tab-resources"
              onClick={() => setActiveTab("resources")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "resources"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Resource Vault</span>
            </button>
          </nav>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Action Trigger */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                id="btn-quick-new-post"
                onClick={onOpenNewPost}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
                Ask Doubt / Post
              </button>
              <button
                id="btn-quick-new-deadline"
                onClick={onOpenNewDeadline}
                className="flex items-center gap-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <CalendarDays className="h-3.5 w-3.5 text-indigo-300" />
                Add Deadline
              </button>
            </div>

            {/* Switch User Simulation Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl cursor-pointer hover:border-slate-600 transition">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-indigo-500"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    {currentUser.name}
                    {currentUser.role === "teacher" && (
                      <span title="Verified Professor">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        currentUser.role === "teacher"
                          ? "bg-emerald-400"
                          : currentUser.role === "ta"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      }`}
                    />
                    {currentUser.role === "teacher" ? "Faculty / Prof" : currentUser.role === "ta" ? "Teaching Asst" : "Student"}
                  </div>
                </div>
              </div>

              {/* User Dropdown Selector */}
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  Switch Active Persona:
                </div>
                <div className="space-y-1 mt-1">
                  {SAMPLE_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setCurrentUser(u)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 transition ${
                        currentUser.id === u.id
                          ? "bg-indigo-600/30 text-white border border-indigo-500/40"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="h-6 w-6 rounded-full object-cover" />
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate flex items-center justify-between">
                          <span>{u.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                              u.role === "teacher"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : u.role === "ta"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-blue-500/20 text-blue-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/80 gap-1 text-xs">
          <button
            onClick={() => setActiveTab("community")}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === "community" ? "text-indigo-400 font-bold" : "text-slate-400"
            }`}
          >
            <MessageSquareText className="h-4 w-4" />
            <span>Community</span>
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg relative ${
              activeTab === "calendar" ? "text-indigo-400 font-bold" : "text-slate-400"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Calendar</span>
            {urgentCount > 0 && (
              <span className="absolute top-0 right-1 h-3.5 w-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                {urgentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("chatbot")}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === "chatbot" ? "text-cyan-400 font-bold" : "text-slate-400"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Bot</span>
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
              activeTab === "resources" ? "text-indigo-400 font-bold" : "text-slate-400"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Vault</span>
          </button>
        </div>
      </div>
    </header>
  );
};
