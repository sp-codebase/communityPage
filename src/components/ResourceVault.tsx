import React, { useState } from "react";
import { StudyResource, User } from "../types";
import { INITIAL_RESOURCES } from "../data/initialData";
import {
  BookOpen,
  Download,
  Star,
  FileText,
  Bookmark,
  Search,
  Filter,
  PlusCircle,
  Award,
  CheckCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface ResourceVaultProps {
  currentUser: User;
  onOpenChatbotWithPrompt: (prompt: string, subject: string) => void;
}

export const ResourceVault: React.FC<ResourceVaultProps> = ({
  currentUser,
  onOpenChatbotWithPrompt,
}) => {
  const [resources, setResources] = useState<StudyResource[]>(INITIAL_RESOURCES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [downloadedIds, setDownloadedIds] = useState<{ [key: string]: boolean }>({});

  const handleDownload = (id: string) => {
    setDownloadedIds((prev) => ({ ...prev, [id]: true }));
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, downloadsCount: r.downloadsCount + 1 } : r))
    );
  };

  const filtered = resources.filter((r) => {
    const matchType = selectedType === "all" || r.type === selectedType;
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                Verified Academic Material
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Resource Vault & Study Notes
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Access peer study guides, faculty lecture summaries, formulas sheets, and verified exam solution archives.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code, topic, formula sheets, past exams..."
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60 overflow-x-auto text-xs">
          {[
            { id: "all", label: "All Formats" },
            { id: "cheatsheet", label: "Cheat Sheets" },
            { id: "notes", label: "Lecture Notes" },
            { id: "past_paper", label: "Past Exams" },
            { id: "guide", label: "Writing & Toolkits" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedType === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid of Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((res) => {
          const isDownloaded = downloadedIds[res.id];

          return (
            <div
              key={res.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition space-y-4"
            >
              <div>
                {/* Header: Course + Type badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {res.course}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase">
                    {res.type.replace("_", " ")}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {res.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {res.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {res.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">{res.author}</span>
                  {res.authorRole === "teacher" && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                      Faculty
                    </span>
                  )}
                  {res.authorRole === "ta" && (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">
                      TA
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      onOpenChatbotWithPrompt(
                        `Can you summarize the core theorems and formulas typically found in "${res.title}" for ${res.course}?`,
                        res.course
                      )
                    }
                    className="p-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-400 rounded-lg transition"
                    title="Explain with ScholarBot AI"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDownload(res.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                      isDownloaded
                        ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                    }`}
                  >
                    {isDownloaded ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Saved ({res.downloadsCount})</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>Download ({res.downloadsCount})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
