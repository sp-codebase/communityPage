import React, { useState } from "react";
import { CategoryType, DiscussionPost, User } from "../types";
import { X, Send, Tag, Sparkles, AlertCircle } from "lucide-react";

interface NewPostModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (post: Omit<DiscussionPost, "id" | "createdAt" | "upvotes" | "views" | "isResolved" | "comments">) => void;
}

const CATEGORIES: CategoryType[] = [
  "Mathematics & Statistics",
  "Computer Science & AI",
  "Physics & Engineering",
  "Chemistry & Biology",
  "Humanities & Social Sciences",
  "Research & Papers",
  "Exam & Finals Prep",
  "Faculty Office Hours",
];

export const NewPostModal: React.FC<NewPostModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CategoryType>("Mathematics & Statistics");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["AcademicHelp"]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, "");
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      author: currentUser,
      category,
      tags: tags.length > 0 ? tags : ["GeneralAcademic"],
      pinned: currentUser.role === "teacher" && category === "Faculty Office Hours",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              {currentUser.role === "teacher" ? "Post Academic Notice or Discussion" : "Ask Academic Doubt / Start Discussion"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Posting as <span className="text-indigo-300 font-semibold">{currentUser.name}</span> ({currentUser.title})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-200 text-sm">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Academic Discipline / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryType)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Question Title / Core Topic
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How does Heisenberg's Uncertainty Principle apply in multi-dimensional wave packets?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Detailed Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Detailed Question, Derivation steps, or Discussion Context
            </label>
            <textarea
              required
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explain the problem, mention the specific formula, syllabus, or theorem, and what you have already attempted..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supports Markdown formatting (bold, formulas, lists, code blocks).
            </p>
          </div>

          {/* Tags input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (Press Enter or comma to add)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-800 border border-slate-700 rounded-xl min-h-[42px]">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag (e.g. Calculus, ExamReview)..."
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none flex-1 min-w-[120px]"
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              disabled={!title.trim() || !content.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg transition"
            >
              <Send className="h-3.5 w-3.5" />
              Publish to Community
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
