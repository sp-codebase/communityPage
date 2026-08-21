import React, { useState } from "react";
import { CategoryType, DiscussionPost, User } from "../types";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  CheckCircle2,
  Award,
  Pin,
  Filter,
  Flame,
  Clock,
  HelpCircle,
  Sparkles,
  PlusCircle,
  GraduationCap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface CommunityFeedProps {
  posts: DiscussionPost[];
  currentUser: User;
  onSelectPost: (post: DiscussionPost) => void;
  onOpenNewPost: () => void;
  onUpvotePost: (postId: string) => void;
  onOpenChatbotWithPrompt: (prompt: string, subject: string) => void;
}

const CATEGORIES: CategoryType[] = [
  "All",
  "Mathematics & Statistics",
  "Computer Science & AI",
  "Physics & Engineering",
  "Chemistry & Biology",
  "Humanities & Social Sciences",
  "Research & Papers",
  "Exam & Finals Prep",
  "Faculty Office Hours",
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  currentUser,
  onSelectPost,
  onOpenNewPost,
  onUpvotePost,
  onOpenChatbotWithPrompt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"trending" | "recent" | "unsolved" | "endorsed">("trending");

  // Filtering
  const filteredPosts = posts
    .filter((post) => {
      const matchCategory = selectedCategory === "All" || post.category === selectedCategory;
      const matchSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (sortBy === "unsolved") return matchCategory && matchSearch && !post.isResolved;
      if (sortBy === "endorsed") {
        return (
          matchCategory &&
          matchSearch &&
          post.comments.some((c) => c.isTeacherEndorsed || c.isAcceptedSolution)
        );
      }
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Trending sort
      return b.upvotes + b.comments.length * 2 - (a.upvotes + a.comments.length * 2);
    });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                Inter-Disciplinary Academic Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic Excellence Community
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Collaborate on tough problem sets, engage with professors and TAs, resolve rigorous mathematical derivations, and share research insights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewPost}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4 w-4" />
              Ask Academic Doubt / Post
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, formulas, professors, topics, #tags..."
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto text-xs">
          <button
            onClick={() => setSortBy("trending")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === "trending"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Trending
          </button>
          <button
            onClick={() => setSortBy("recent")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === "recent"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Recent
          </button>
          <button
            onClick={() => setSortBy("unsolved")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === "unsolved"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Needs Answer
          </button>
          <button
            onClick={() => setSortBy("endorsed")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition ${
              sortBy === "endorsed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            Faculty Endorsed
          </button>
        </div>

      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post Feed List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
            <div className="h-12 w-12 rounded-full bg-slate-800 text-indigo-400 mx-auto flex items-center justify-center mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">No discussions found in this filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Try adjusting your search terms, selecting another subject category, or post a new academic doubt!
            </p>
            <button
              onClick={onOpenNewPost}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
            >
              Start New Discussion
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const hasAccepted = post.comments.some((c) => c.isAcceptedSolution);
            const hasEndorsed = post.comments.some((c) => c.isTeacherEndorsed);

            return (
              <div
                key={post.id}
                onClick={() => onSelectPost(post)}
                className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 shadow-lg transition duration-200 cursor-pointer overflow-hidden"
              >
                {post.pinned && (
                  <div className="absolute top-0 right-0 bg-indigo-600/20 border-l border-b border-indigo-500/40 px-3 py-0.5 rounded-bl-xl text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned Faculty Notice
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Upvote side button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpvotePost(post.id);
                    }}
                    className={`hidden sm:flex flex-col items-center justify-center min-w-[50px] p-2 rounded-xl border transition ${
                      post.upvotedByUser
                        ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                        : "bg-slate-800 border-slate-700 text-slate-400 group-hover:border-slate-600"
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${post.upvotedByUser ? "fill-indigo-400" : ""}`} />
                    <span className="text-xs font-bold mt-1">{post.upvotes}</span>
                  </button>

                  {/* Main card body */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Header line: Category + Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {post.category}
                      </span>
                      {hasAccepted && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          Accepted Solution
                        </span>
                      )}
                      {hasEndorsed && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <Award className="h-3 w-3 text-indigo-400" />
                          Faculty Endorsed
                        </span>
                      )}
                    </div>

                    {/* Post Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Content Snippet */}
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {post.content.replace(/[#*`$]/g, "")}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      {post.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-mono"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Bottom Metadata: Author + Answers count + AI trigger */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-300">{post.author.name}</span>
                        <span className="text-[10px] text-slate-500 hidden md:inline">
                          ({post.author.institution})
                        </span>
                        <span className="text-[10px] text-slate-500">• {post.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-slate-300 font-medium">
                          <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{post.comments.length} Answers</span>
                        </div>

                        {/* Quick AI Solver Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChatbotWithPrompt(
                              `Explain this academic doubt with a complete step-by-step derivation:\n\nTitle: ${post.title}\nContext: ${post.content}`,
                              post.category
                            );
                          }}
                          className="flex items-center gap-1 text-[11px] bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg transition"
                          title="Ask ScholarBot AI"
                        >
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          <span className="hidden sm:inline">AI Solution</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
