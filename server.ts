import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy-initialized GenAI client
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", aiConfigured: Boolean(process.env.GEMINI_API_KEY) });
});

// Academic Chatbot Endpoint (StudyBot / Academia AI)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, subject, mode, contextData } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return a helpful mock response if no API key is set yet
      return res.json({
        reply: `Hello! I am your Academic Excellence AI Assistant (ScholarBot). 

*Note: The Gemini API key is currently loading or in preview mode. Here is an academic guidance structure for your inquiry about ${subject || "your studies"}:*

1. **Core Concept Clarification**: Break the topic down into fundamental definitions and key theorems.
2. **Step-by-Step Problem Solving**: Identify given variables, formula or thesis statement, and method of verification.
3. **Best Practices**: Cite your primary sources, verify calculations with dimensional analysis, and cross-reference peer notes in our community discussions!

Ask any specific question or formula, and I will walk you through the derivation!`,
      });
    }

    const systemPrompt = `You are "ScholarBot", an elite, supportive, and pedagogical Academic Mentor & Doubt Solver built for an academic excellence community connecting students, educators, teaching assistants, and researchers.

Your role:
- Answer student & teacher academic doubts across STEM (Math, Physics, Chemistry, Biology, Computer Science/Data Structures), Humanities, Literature, Social Sciences, Research Methodologies, and Exam Preparation (GRE, SAT, AP, University finals).
- Selected Subject: ${subject || "General Academic / Multi-disciplinary"}.
- Mode: ${mode || "Doubt Solver"} (Options could be: Concept Explainer, Step-by-Step Derivation/Code, Essay & Thesis Critique, Exam Prep & Practice Problems, Study Plan & Deadline Strategist).
- Context Details: ${contextData ? JSON.stringify(contextData) : "None provided"}.

Guidelines:
1. Provide accurate, rigorously clear, and encouraging explanations.
2. Break down complex math, science, or logic problems step-by-step with formulas, markdown tables, and clear explanations.
3. Format math cleanly (e.g. LaTeX-like or clear text formulas like \`f(x) = ...\`, clean exponents \`x^2\`, integrals, bulleted deductions).
4. For programming/CS questions, provide clean, commented code snippets with time/space complexity analysis.
5. For writing/humanities, provide structural critique, citation tips (APA/MLA/Chicago), and analytical clarity.
6. Suggest follow-up self-test questions or practice exercises at the end of key answers to test comprehension.
7. Keep tone respectful, academic, inspiring, and clear.`;

    // Construct conversation history for Gemini
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return res.json({
      reply: response.text || "I was unable to formulate a response. Please try rephrasing your academic question.",
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process academic AI query",
    });
  }
});

// Break down project/assignment into milestones for Calendar
app.post("/api/breakdown-deadline", async (req, res) => {
  try {
    const { title, course, dueDate, description, type } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Provide intelligent rule-based default milestones if AI key is absent
      const targetDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 86400000);
      const now = new Date();
      const diffDays = Math.max(2, Math.round((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const day1 = new Date(now.getTime() + Math.round(diffDays * 0.2) * 86400000).toISOString().split("T")[0];
      const day2 = new Date(now.getTime() + Math.round(diffDays * 0.5) * 86400000).toISOString().split("T")[0];
      const day3 = new Date(now.getTime() + Math.round(diffDays * 0.8) * 86400000).toISOString().split("T")[0];

      return res.json({
        milestones: [
          { title: "Literature Review & Problem Definition", targetDate: day1, estimatedHours: 3, notes: "Gather references, syllabus criteria, and setup workspace" },
          { title: "First Draft / Core Experiment Implementation", targetDate: day2, estimatedHours: 6, notes: "Complete 70% of core deliverables and initial testing" },
          { title: "Review, Polish & Peer Feedback", targetDate: day3, estimatedHours: 2, notes: "Proofread, run formatting checks, and verify rubrics" },
        ],
      });
    }

    const prompt = `You are an expert Academic Advisor. Break down the following ${type || "academic project / assignment"} into 3 to 4 actionable milestones with realistic intermediate dates and estimated study hours leading up to the final deadline.

Task Title: ${title}
Course/Subject: ${course}
Final Due Date: ${dueDate}
Description/Rubric notes: ${description || "Standard course requirements"}
Current Date: ${new Date().toISOString().split("T")[0]}

Respond ONLY with valid JSON array of objects with schema:
[
  {
    "title": "Milestone Title",
    "targetDate": "YYYY-MM-DD",
    "estimatedHours": 3,
    "notes": "Brief tactical advice for completing this milestone"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ milestones: parsed });
  } catch (error: any) {
    console.error("AI Milestone Breakdown Error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate milestones" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Academic Excellence Community Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
