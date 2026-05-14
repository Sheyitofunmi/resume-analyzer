interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  pageCount?: number;
  jobDescription?: string;
  feedback: Feedback;
}

interface ScoreHistoryEntry {
  date: string;
  overall: number;
  ats: number;
  tone: number;
  content: number;
  structure: number;
  skills: number;
}

interface InterviewQuestion {
  category: string;
  question: string;
}

interface RewriteSuggestion {
  weak: string;
  strong: string;
  why: string;
}

interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
    keywords?: {
      found: string[];
      missing: string[];
    };
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}
