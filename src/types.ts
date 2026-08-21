export type UserRole = "student" | "teacher" | "ta" | "researcher" | "peer_mentor";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  title: string;
  institution: string;
  department: string;
  reputation: number;
  badges: string[];
}

export type CategoryType =
  | "All"
  | "Mathematics & Statistics"
  | "Computer Science & AI"
  | "Physics & Engineering"
  | "Chemistry & Biology"
  | "Humanities & Social Sciences"
  | "Research & Papers"
  | "Exam & Finals Prep"
  | "Faculty Office Hours";

export interface PostComment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  upvotes: number;
  upvotedByUser?: boolean;
  isTeacherEndorsed?: boolean;
  isAcceptedSolution?: boolean;
}

export interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  author: User;
  category: CategoryType;
  tags: string[];
  createdAt: string;
  upvotes: number;
  upvotedByUser?: boolean;
  views: number;
  isResolved: boolean;
  comments: PostComment[];
  pinned?: boolean;
}

export type DeadlineType =
  | "assignment"
  | "project"
  | "exam"
  | "paper_submission"
  | "lab_report"
  | "quiz"
  | "presentation"
  | "study_group";

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  estimatedHours?: number;
  notes?: string;
  completed: boolean;
}

export interface AcademicDeadline {
  id: string;
  title: string;
  description: string;
  course: string;
  type: DeadlineType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: "high" | "medium" | "low";
  completed: boolean;
  tags: string[];
  milestones?: Milestone[];
  instructor?: string;
  weightage?: string; // e.g. "25% of final grade"
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  subject?: string;
  mode?: string;
}

export interface StudyResource {
  id: string;
  title: string;
  course: string;
  category: string;
  type: "notes" | "cheatsheet" | "past_paper" | "guide" | "code_repo";
  author: string;
  authorRole: UserRole;
  downloadsCount: number;
  rating: number;
  tags: string[];
  description: string;
  linkText?: string;
}
