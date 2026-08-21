import React, { useState } from "react";
import { DiscussionPost, PostComment, User } from "../types";
import {
  X,
  ThumbsUp,
  MessageSquare,
  CheckCircle,
  Award,
  Sparkles,
  Send,
  Code,
  Share2,
  Bookmark,
  Check,
  GraduationCap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface PostDetailModalProps {
  post: DiscussionPost;
  currentUser: User;
  onClose: () => void;
  onUpvotePost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onUpvoteComment: (postId: string, commentId: string) => void;
  onToggleEndorseComment: (postId: string, commentId: string) => void;
  onToggleAcceptSolution: (postId: string, commentId: string) => void;
  onSendToAiBot?: (prompt: string, subject: string) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  currentUser,
  onClose,
  onUpvotePost,
  onAddComment,
  onUpvoteComment,
  onToggleEndorseComment,
  onToggleAcceptSolution,
  onSendToAiBot,
}) => {
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTeacherOrTa = currentUser.role === "teacher" || currentUser.role === "ta";
  const isPostAuthor = currentUser.id === post.author.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {post.category}
            </span>
            {post.isResolved && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                Solved by Community
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition text-xs flex items-center gap-1"
              title="Copy Link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Post Header & Author */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {post.title}
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                    <span>{post.author.name}</span>
                    {post.author.role === "teacher" && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                        Professor
                      </span>
                    )}
                    {post.author.role === "ta" && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">
                        TA
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {post.author.institution} • {post.createdAt}
                  </div>
                </div>
              </div>
            </div>

            {/* Upvote Post Button */}
            <button
              onClick={() => onUpvotePost(post.id)}
              className={`flex flex-col items-center justify-center min-w-[54px] p-2.5 rounded-xl border transition ${
                post.upvotedByUser
                  ? "bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold"
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:bg-slate-800"
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${post.upvotedByUser ? "fill-indigo-400" : ""}`} />
              <span className="text-xs mt-1">{post.upvotes}</span>
            </button>
          </div>

          {/* Post Content */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-800 leading-relaxed prose prose-invert max-w-none text-slate-200 text-sm">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Quick Action: Ask AI Doubt Solver about this question */}
          {onSendToAiBot && (
            <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-slate-900 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white">Need an instant pedagogical breakdown?</div>
                  <div className="text-[11px] text-slate-400">Ask ScholarBot AI to solve this step-by-step or generate practice problems</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onSendToAiBot(
                    `Can you provide a rigorous step-by-step academic explanation and solution approach for the following question?\n\nTitle: ${post.title}\nDetails: ${post.content}`,
                    post.category
                  );
                  onClose();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                Consult ScholarBot AI
              </button>
            </div>
          )}

          {/* Comments / Community Answers Section */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                Answers & Insights ({post.comments.length})
              </h3>
              <span className="text-xs text-slate-400">
                Verified faculty responses are highlighted with special badges
              </span>
            </div>

            {/* List of answers */}
            <div className="space-y-4">
              {post.comments.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/30 rounded-xl border border-slate-800 text-slate-400 text-sm">
                  No answers yet. Be the first to share your academic solution or derivation!
                </div>
              ) : (
                post.comments.map((comment: PostComment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-xl border transition ${
                      comment.isAcceptedSolution
                        ? "bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/30"
                        : comment.isTeacherEndorsed
                        ? "bg-indigo-950/20 border-indigo-500/30"
                        : "bg-slate-800/40 border-slate-800"
                    }`}
                  >
                    {/* Badges bar */}
                    {(comment.isAcceptedSolution || comment.isTeacherEndorsed) && (
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {comment.isAcceptedSolution && (
                          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                            Author Accepted Solution
                          </span>
                        )}
                        {comment.isTeacherEndorsed && (
                          <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            <Award className="h-3 w-3 text-indigo-400" />
                            Faculty / Teacher Endorsed
                          </span>
                        )}
                      </div>
                    )}

                    {/* Author info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                            <span>{comment.author.name}</span>
                            {comment.author.role === "teacher" && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                                Professor
                              </span>
                            )}
                            {comment.author.role === "ta" && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">
                                TA
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {comment.author.title} • {comment.createdAt}
                          </div>
                        </div>
                      </div>

                      {/* Comment Upvote */}
                      <button
                        onClick={() => onUpvoteComment(post.id, comment.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                          comment.upvotedByUser
                            ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        <ThumbsUp className={`h-3 w-3 ${comment.upvotedByUser ? "fill-indigo-400" : ""}`} />
                        <span>{comment.upvotes}</span>
                      </button>
                    </div>

                    {/* Comment text */}
                    <div className="text-xs leading-relaxed text-slate-300 prose prose-invert max-w-none my-2">
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>

                    {/* Teacher & Author Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
                      {isTeacherOrTa && (
                        <button
                          onClick={() => onToggleEndorseComment(post.id, comment.id)}
                          className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                            comment.isTeacherEndorsed
                              ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
                              : "text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
                          }`}
                        >
                          <Award className="h-3.5 w-3.5" />
                          {comment.isTeacherEndorsed ? "Remove Faculty Endorsement" : "Endorse as Faculty"}
                        </button>
                      )}

                      {isPostAuthor && (
                        <button
                          onClick={() => onToggleAcceptSolution(post.id, comment.id)}
                          className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                            comment.isAcceptedSolution
                              ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                              : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
                          }`}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {comment.isAcceptedSolution ? "Accepted Solution" : "Mark as Accepted Solution"}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Answer Input Box */}
            <form onSubmit={handleSubmitComment} className="pt-2">
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={`Write your academic answer or explanation as ${currentUser.name}... (Supports Markdown)`}
                  rows={3}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-slate-400">
                    Be constructive, cite formulas, and explain derivations clearly.
                  </span>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Answer
                  </button>
                </div>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
