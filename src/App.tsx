import React, { useState, useEffect } from "react";
import { User, DiscussionPost, AcademicDeadline, CategoryType } from "./types";
import { SAMPLE_USERS, INITIAL_POSTS, INITIAL_DEADLINES } from "./data/initialData";
import { Navbar } from "./components/Navbar";
import { AcademicOverviewBar } from "./components/AcademicOverviewBar";
import { CommunityFeed } from "./components/CommunityFeed";
import { PostDetailModal } from "./components/PostDetailModal";
import { NewPostModal } from "./components/NewPostModal";
import { AcademicCalendarView } from "./components/AcademicCalendarView";
import { NewDeadlineModal } from "./components/NewDeadlineModal";
import { AiDoubtChatbot } from "./components/AiDoubtChatbot";
import { ResourceVault } from "./components/ResourceVault";
import { formatDueDate } from "./utils/confetti";

export default function App() {
  // Current active user persona
  const [currentUser, setCurrentUser] = useState<User>(SAMPLE_USERS[0]);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"community" | "calendar" | "chatbot" | "resources">("community");

  // State with LocalStorage fallbacks
  const [posts, setPosts] = useState<DiscussionPost[]>(() => {
    try {
      const saved = localStorage.getItem("academic_posts_v1");
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [deadlines, setDeadlines] = useState<AcademicDeadline[]>(() => {
    try {
      const saved = localStorage.getItem("academic_deadlines_v1");
      return saved ? JSON.parse(saved) : INITIAL_DEADLINES;
    } catch {
      return INITIAL_DEADLINES;
    }
  });

  // Modals
  const [selectedPost, setSelectedPost] = useState<DiscussionPost | null>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isNewDeadlineOpen, setIsNewDeadlineOpen] = useState(false);

  // Chatbot handoff prompt
  const [chatbotPrompt, setChatbotPrompt] = useState<string>("");
  const [chatbotSubject, setChatbotSubject] = useState<string>("");

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("academic_posts_v1", JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem("academic_deadlines_v1", JSON.stringify(deadlines));
    } catch (e) {
      console.error(e);
    }
  }, [deadlines]);

  // Urgent deadlines count
  const urgentCount = deadlines.filter((d) => {
    if (d.completed) return false;
    const { urgency } = formatDueDate(d.dueDate);
    return urgency === "urgent" || urgency === "soon";
  }).length;

  // Post handlers
  const handleUpvotePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const upvoted = !p.upvotedByUser;
          return {
            ...p,
            upvotes: upvoted ? p.upvotes + 1 : p.upvotes - 1,
            upvotedByUser: upvoted,
          };
        }
        return p;
      })
    );
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              upvotes: !prev.upvotedByUser ? prev.upvotes + 1 : prev.upvotes - 1,
              upvotedByUser: !prev.upvotedByUser,
            }
          : null
      );
    }
  };

  const handleAddComment = (postId: string, content: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      postId,
      author: currentUser,
      content,
      createdAt: "Just now",
      upvotes: 0,
      upvotedByUser: false,
      isTeacherEndorsed: false,
      isAcceptedSolution: false,
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : null
      );
    }
  };

  const handleUpvoteComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id === commentId) {
                const upvoted = !c.upvotedByUser;
                return {
                  ...c,
                  upvotes: upvoted ? c.upvotes + 1 : c.upvotes - 1,
                  upvotedByUser: upvoted,
                };
              }
              return c;
            }),
          };
        }
        return p;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) => {
                if (c.id === commentId) {
                  const upvoted = !c.upvotedByUser;
                  return {
                    ...c,
                    upvotes: upvoted ? c.upvotes + 1 : c.upvotes - 1,
                    upvotedByUser: upvoted,
                  };
                }
                return c;
              }),
            }
          : null
      );
    }
  };

  const handleToggleEndorseComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map((c) =>
              c.id === commentId ? { ...c, isTeacherEndorsed: !c.isTeacherEndorsed } : c
            ),
          };
        }
        return p;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === commentId ? { ...c, isTeacherEndorsed: !c.isTeacherEndorsed } : c
              ),
            }
          : null
      );
    }
  };

  const handleToggleAcceptSolution = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isCurrentlyAccepted = p.comments.find((c) => c.id === commentId)?.isAcceptedSolution;
          const updatedComments = p.comments.map((c) => ({
            ...c,
            isAcceptedSolution: c.id === commentId ? !isCurrentlyAccepted : false,
          }));
          return {
            ...p,
            isResolved: !isCurrentlyAccepted,
            comments: updatedComments,
          };
        }
        return p;
      })
    );

    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost((prev) => {
        if (!prev) return null;
        const isCurrentlyAccepted = prev.comments.find((c) => c.id === commentId)?.isAcceptedSolution;
        return {
          ...prev,
          isResolved: !isCurrentlyAccepted,
          comments: prev.comments.map((c) => ({
            ...c,
            isAcceptedSolution: c.id === commentId ? !isCurrentlyAccepted : false,
          })),
        };
      });
    }
  };

  const handleCreatePost = (
    postData: Omit<DiscussionPost, "id" | "createdAt" | "upvotes" | "views" | "isResolved" | "comments">
  ) => {
    const newPost: DiscussionPost = {
      ...postData,
      id: `post-${Date.now()}`,
      createdAt: "Just now",
      upvotes: 1,
      upvotedByUser: true,
      views: 1,
      isResolved: false,
      comments: [],
    };

    setPosts([newPost, ...posts]);
  };

  // Deadline handlers
  const handleCreateDeadline = (deadlineData: Omit<AcademicDeadline, "id">) => {
    const newDeadline: AcademicDeadline = {
      ...deadlineData,
      id: `dl-${Date.now()}`,
    };
    setDeadlines([newDeadline, ...deadlines]);
  };

  const handleToggleCompleteDeadline = (deadlineId: string) => {
    setDeadlines((prev) =>
      prev.map((d) => (d.id === deadlineId ? { ...d, completed: !d.completed } : d))
    );
  };

  const handleToggleMilestone = (deadlineId: string, milestoneId: string) => {
    setDeadlines((prev) =>
      prev.map((d) => {
        if (d.id === deadlineId && d.milestones) {
          const updatedMilestones = d.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          return { ...d, milestones: updatedMilestones };
        }
        return d;
      })
    );
  };

  // Chatbot prompt navigation handoff
  const handleOpenChatbotWithPrompt = (prompt: string, subject: string) => {
    setChatbotPrompt(prompt);
    setChatbotSubject(subject);
    setActiveTab("chatbot");
  };

  // Share AI answer back as community post
  const handleShareAiToCommunity = (title: string, content: string, category: string) => {
    const validCategory = (category || "Mathematics & Statistics") as CategoryType;
    handleCreatePost({
      title,
      content,
      author: currentUser,
      category: validCategory,
      tags: ["AIInsight", "ScholarBot", "StudyNotes"],
      pinned: false,
    });
    setActiveTab("community");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenNewPost={() => setIsNewPostOpen(true)}
        onOpenNewDeadline={() => setIsNewDeadlineOpen(true)}
        urgentCount={urgentCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Academic Status & Urgency Glance Bar */}
        <AcademicOverviewBar
          deadlines={deadlines}
          currentUser={currentUser}
          onNavigateToCalendar={() => setActiveTab("calendar")}
          onNavigateToCommunity={() => setActiveTab("community")}
          onOpenChatbot={() => setActiveTab("chatbot")}
        />

        {/* Tab View Switching */}
        {activeTab === "community" && (
          <CommunityFeed
            posts={posts}
            currentUser={currentUser}
            onSelectPost={(p) => setSelectedPost(p)}
            onOpenNewPost={() => setIsNewPostOpen(true)}
            onUpvotePost={handleUpvotePost}
            onOpenChatbotWithPrompt={handleOpenChatbotWithPrompt}
          />
        )}

        {activeTab === "calendar" && (
          <AcademicCalendarView
            deadlines={deadlines}
            currentUser={currentUser}
            onOpenNewDeadline={() => setIsNewDeadlineOpen(true)}
            onToggleCompleteDeadline={handleToggleCompleteDeadline}
            onToggleMilestone={handleToggleMilestone}
            onOpenChatbotWithPrompt={handleOpenChatbotWithPrompt}
          />
        )}

        {activeTab === "chatbot" && (
          <AiDoubtChatbot
            currentUser={currentUser}
            onShareToCommunity={handleShareAiToCommunity}
            initialPrompt={chatbotPrompt}
            initialSubject={chatbotSubject}
            onClearInitialPrompt={() => {
              setChatbotPrompt("");
              setChatbotSubject("");
            }}
          />
        )}

        {activeTab === "resources" && (
          <ResourceVault
            currentUser={currentUser}
            onOpenChatbotWithPrompt={handleOpenChatbotWithPrompt}
          />
        )}

      </main>

      {/* Modals */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          currentUser={currentUser}
          onClose={() => setSelectedPost(null)}
          onUpvotePost={handleUpvotePost}
          onAddComment={handleAddComment}
          onUpvoteComment={handleUpvoteComment}
          onToggleEndorseComment={handleToggleEndorseComment}
          onToggleAcceptSolution={handleToggleAcceptSolution}
          onSendToAiBot={handleOpenChatbotWithPrompt}
        />
      )}

      {isNewPostOpen && (
        <NewPostModal
          currentUser={currentUser}
          onClose={() => setIsNewPostOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {isNewDeadlineOpen && (
        <NewDeadlineModal
          currentUser={currentUser}
          onClose={() => setIsNewDeadlineOpen(false)}
          onSubmit={handleCreateDeadline}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ScholarSphere • Academic Excellence & Collaborative Research Network</span>
          <span className="text-slate-400">Empowering students, educators, & researchers</span>
        </div>
      </footer>

    </div>
  );
}
