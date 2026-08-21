import confetti from "canvas-confetti";

export function triggerAcademicCelebration() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#6366f1"],
  });
}

export function formatDueDate(dateStr: string): { label: string; urgency: "urgent" | "soon" | "normal" | "past" } {
  if (!dateStr) return { label: "No date", urgency: "normal" };

  const target = new Date(dateStr);
  const now = new Date();
  // reset hours to midnight for date comparison
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = targetMidnight.getTime() - nowMidnight.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Overdue by ${Math.abs(diffDays)}d`, urgency: "past" };
  } else if (diffDays === 0) {
    return { label: "Due Today!", urgency: "urgent" };
  } else if (diffDays === 1) {
    return { label: "Due Tomorrow", urgency: "urgent" };
  } else if (diffDays <= 3) {
    return { label: `Due in ${diffDays} days`, urgency: "soon" };
  } else {
    return {
      label: target.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      urgency: "normal",
    };
  }
}
