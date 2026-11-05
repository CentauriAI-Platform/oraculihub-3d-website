export const pathways = [
  {
    id: "athena",
    name: "Athena",
    roman: "I",
    title: "Find your direction.",
    specialty: "Career & Purpose",
    description:
      "Turn possibility into a plan. Find clarity, build confidence, and take your next career step with a guide beside you.",
    short: "A clearer path to the future you want.",
    color: "#b6a780",
    icon: "compass",
    href: "/pathways/athena",
    tags: ["Career clarity", "Personal coaching", "Your next chapter"],
  },
  {
    id: "apollo",
    name: "Apollo",
    roman: "II",
    title: "Illuminate the unknown.",
    specialty: "AI Foundations",
    description:
      "You don't need a technical background to understand AI. Start with the essentials and discover what you can create.",
    short: "Your first step into the world of AI.",
    color: "#d3a659",
    icon: "sun",
    href: "/pathways/apollo",
    tags: ["AI essentials", "Prompting", "Everyday applications"],
  },
  {
    id: "hephaestus",
    name: "Hephaestus",
    roman: "III",
    title: "Make ideas real.",
    specialty: "Build with AI",
    description:
      "Enter the forge. Learn to code, connect tools, and build useful automations through practical, hands-on projects.",
    short: "From a spark of an idea to something real.",
    color: "#b98163",
    icon: "hammer",
    href: "/pathways/hephaestus",
    tags: ["Automation", "AI development", "Real projects"],
  },
  {
    id: "hermes",
    name: "Hermes",
    roman: "IV",
    title: "Move your work forward.",
    specialty: "AI at Work",
    description:
      "Give your skills a new edge. Bring AI into your workflow, your business, and the work that matters to you.",
    short: "A new advantage for the way you work.",
    color: "#83a89e",
    icon: "feather",
    href: "/pathways/hermes",
    tags: ["Productivity", "Business", "Freelancing"],
  },
] as const;
export type PathwayId = (typeof pathways)[number]["id"];
export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  pathway: string;
  level: string;
  duration: string;
  price: number;
  published: number;
  demo: number;
  outcomes: string;
  prerequisites: string;
  instructor: string;
  image: string;
};
export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  module: string;
  position: number;
  minutes: number;
  content: string;
  video_url: string;
  resource_url: string;
  quiz: string;
  preview: number;
};
export type Quiz = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};
export const money = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
export const seedCourses = [
  {
    id: "ai-foundations",
    slug: "ai-foundations",
    title: "AI, from the beginning",
    subtitle: "Understand the technology. Discover the possibilities.",
    pathway: "apollo",
    level: "Beginner",
    duration: "4 lessons",
    price: 0,
    outcomes: [
      "Explain what generative AI can and cannot do",
      "Write useful prompts with context and constraints",
      "Evaluate an AI response before using it",
      "Build a responsible personal AI workflow",
    ],
    prerequisites: "Curiosity and a browser. No coding experience needed.",
    instructor: "Oraculihub sample curriculum",
    image: "/images/apollo.webp",
  },
  {
    id: "prompt-craft",
    slug: "the-art-of-prompting",
    title: "The art of prompting",
    subtitle: "Better questions. More useful answers.",
    pathway: "apollo",
    level: "Beginner",
    duration: "4 lessons",
    price: 990000,
    outcomes: [
      "Structure prompts around tasks and context",
      "Use examples to improve consistency",
      "Iterate on results with clear evaluation",
      "Create reusable prompt templates",
    ],
    prerequisites: "Basic familiarity with an AI chat tool.",
    instructor: "Oraculihub sample curriculum",
    image: "/images/apollo.webp",
  },
  {
    id: "automation",
    slug: "build-your-first-automation",
    title: "Build your first automation",
    subtitle: "Connect the dots. Let your ideas do the work.",
    pathway: "hephaestus",
    level: "Intermediate",
    duration: "4 lessons",
    price: 1490000,
    outcomes: [
      "Map a repeatable workflow",
      "Design triggers and actions",
      "Handle errors and human approvals",
      "Build and evaluate an automation prototype",
    ],
    prerequisites: "Comfort using web applications and spreadsheets.",
    instructor: "Oraculihub sample curriculum",
    image: "/images/hephaestus.webp",
  },
  {
    id: "workflows",
    slug: "ai-for-your-workday",
    title: "AI for your workday",
    subtitle: "Less busywork. More meaningful work.",
    pathway: "hermes",
    level: "Beginner",
    duration: "4 lessons",
    price: 0,
    outcomes: [
      "Identify suitable AI tasks in your workday",
      "Draft and refine professional communication",
      "Summarize information with source checks",
      "Create a safe repeatable productivity workflow",
    ],
    prerequisites: "A real work task you would like to improve.",
    instructor: "Oraculihub sample curriculum",
    image: "/images/hermes.webp",
  },
];
const foundations = [
  {
    title: "Welcome to a new age",
    module: "01 · The essentials",
    content:
      "AI is a family of methods for finding patterns and producing predictions or outputs. Generative AI creates new text, images, audio, or code from patterns learned during training.\n\nThink of an AI assistant as a capable collaborator whose work still needs review. It can help you explore ideas, draft text, or explain a concept. It does not automatically know what is true, what matters in your situation, or what information is private.\n\nTry this: choose a topic you already understand, such as a subject you study or a task at work. Ask an AI tool to explain it to a beginner. Compare its answer with what you know. Mark one useful point and one statement that needs checking.\n\nYour practice: write down a task you would like AI to help with. Describe the result you want in one sentence.",
    quiz: {
      question: "What is the best way to treat an AI-generated answer?",
      options: [
        "Accept it because it sounds confident",
        "Review it against evidence and your context",
        "Assume it is always incorrect",
      ],
      answer: 1,
      explanation:
        "AI can be useful, but confidence is not evidence. Review important facts and check whether the result fits your situation.",
    },
  },
  {
    title: "The anatomy of a useful prompt",
    module: "01 · The essentials",
    content:
      "A useful prompt usually explains the task, gives relevant context, states constraints, and describes the desired format. You do not need complicated magic words. Clear instructions matter more.\n\nFor example: ‘Help me plan a one-week revision schedule for my A/L exams. I have two hours each weekday and four hours on Sunday. Prioritize mathematics and leave time for practice questions. Return a daily table.’\n\nThe context tells the assistant what situation it is helping with. The constraints define time and priorities. The format makes the answer easier to use.\n\nYour practice: rewrite your task from the previous lesson using these four parts. Remove private information before sharing it with any external tool.",
    quiz: {
      question: "Which addition most improves a vague prompt?",
      options: [
        "Typing in capital letters",
        "Adding unrelated adjectives",
        "Providing relevant context and a clear output format",
      ],
      answer: 2,
      explanation:
        "Relevant context, constraints, and an explicit format help the assistant produce a result you can use.",
    },
  },
  {
    title: "Trust, but verify",
    module: "02 · Put it into practice",
    content:
      "Generative models can produce plausible statements that are inaccurate. They can also reflect bias, misunderstand a question, or invent a reference. A well-written answer still needs checking.\n\nFor important claims, find the original source. Check the date, whether the source supports the exact claim, and whether circumstances have changed. For calculations, recompute the result. For code, test the behavior.\n\nKeep sensitive personal, student, employer, and customer information out of tools unless you have permission and understand the tool's data handling. Replace identifying details with general descriptions.\n\nYour practice: take one AI response and separate it into facts, suggestions, and assumptions. Verify two facts using primary sources.",
    quiz: {
      question: "An AI gives a source link. What should you do?",
      options: [
        "Open it and check that it supports the claim",
        "Assume every link is authentic",
        "Copy the claim without checking",
      ],
      answer: 0,
      explanation:
        "A citation can be wrong or irrelevant. Open the source and verify the exact claim.",
    },
  },
  {
    title: "Build your first AI workflow",
    module: "02 · Put it into practice",
    content:
      "A workflow connects a real need to an action and a review. Start small: pick one repeatable task, define what a good result looks like, and decide where a person should approve the output.\n\nExample: prepare a weekly study plan. Your input is a list of subjects and available hours. The AI drafts a plan. You check deadlines, difficulty, and time estimates. You adjust the plan after trying it for a week.\n\nMeasure something practical: time saved, errors found, or how easy the result is to use. If the workflow makes more work than it saves, change it or stop using it.\n\nYour final project: document your task, prompt, sample output, review checklist, and one improvement. You now have a small, repeatable process you can explain to someone else.",
    quiz: {
      question: "What is a sensible first AI workflow?",
      options: [
        "Automate every decision immediately",
        "Choose a small task with a clear human review step",
        "Ignore errors to save time",
      ],
      answer: 1,
      explanation:
        "A bounded task with a clear review step is easier to evaluate and improve.",
    },
  },
];
export function sampleLessons(course: (typeof seedCourses)[number]) {
  const titles: Record<string, string[]> = {
    "prompt-craft": [
      "Start with the outcome",
      "Context, examples, and constraints",
      "Iterate and evaluate",
      "Your reusable prompt library",
    ],
    automation: [
      "Map a task worth automating",
      "Triggers, actions, and data",
      "Design for errors and approvals",
      "Build and evaluate your prototype",
    ],
    workflows: [
      "Find your everyday AI opportunities",
      "Write with clarity and context",
      "Summarize without losing the source",
      "Design your personal workday workflow",
    ],
  };
  return foundations.map((l, i) => ({
    ...l,
    title: titles[course.id]?.[i] ?? l.title,
    id: `${course.id}-${i + 1}`,
    course_id: course.id,
    position: i,
    minutes: [8, 12, 10, 15][i],
    video_url: "",
    resource_url: "",
    preview: i === 0 ? 1 : 0,
    quiz: JSON.stringify(l.quiz),
    content:
      course.id === "ai-foundations"
        ? l.content
        : `This is an illustrative lesson for “${course.title}”. The exercise below demonstrates the learning interface; replace it with the final course curriculum before selling this course.\n\n${l.content}`,
  }));
}
