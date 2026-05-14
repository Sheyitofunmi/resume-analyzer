export const demoFeedback = {
  overallScore: 72,
  ATS: {
    score: 68,
    tips: [
      {
        type: "improve",
        tip: "Missing Key Action Verbs",
        explanation:
          "Your resume lacks strong action verbs like 'architected', 'spearheaded', or 'optimized'. ATS systems and recruiters look for these to gauge impact.",
      },
      {
        type: "improve",
        tip: "Add Quantifiable Metrics",
        explanation:
          "Statements like 'improved performance' are vague. Replace with specific numbers e.g. 'reduced load time by 40%' to pass ATS scoring thresholds.",
      },
      {
        type: "good",
        tip: "Clean Formatting",
        explanation:
          "Your resume uses standard fonts and avoids tables/graphics that confuse ATS parsers. This ensures all content is correctly extracted.",
      },
      {
        type: "improve",
        tip: "Keyword Density Too Low",
        explanation:
          "Several important keywords from the job description appear only once or not at all. Naturally increase frequency across your experience section.",
      },
    ],
    keywords: {
      found: ["React", "TypeScript", "REST API", "Git", "Agile"],
      missing: ["CI/CD", "Docker", "unit testing", "system design", "Node.js"],
    },
  },
  toneAndStyle: {
    score: 75,
    tips: [
      {
        type: "good",
        tip: "Professional Language",
        explanation:
          "Your resume maintains a consistently professional tone throughout, avoiding casual language or first-person pronouns.",
      },
      {
        type: "improve",
        tip: "Passive Voice Overuse",
        explanation:
          "Phrases like 'was responsible for' weaken your narrative. Replace with active constructions: 'Led', 'Delivered', 'Built'.",
      },
      {
        type: "improve",
        tip: "Inconsistent Tense",
        explanation:
          "Current role descriptions mix present and past tense. Use present tense for current roles and past tense for previous ones.",
      },
      {
        type: "good",
        tip: "Concise Bullet Points",
        explanation:
          "Most bullet points are under two lines, which is ideal. Recruiters spend an average of 7 seconds on a resume — brevity wins.",
      },
    ],
  },
  content: {
    score: 70,
    tips: [
      {
        type: "improve",
        tip: "Weak Summary Section",
        explanation:
          "Your summary reads as generic. Tailor it directly to the target role by mentioning the specific company or job title and your most relevant achievement.",
      },
      {
        type: "good",
        tip: "Relevant Work Experience",
        explanation:
          "Your experience section is well-aligned with the seniority level of the role. The progression from junior to mid-level is clearly communicated.",
      },
      {
        type: "improve",
        tip: "Missing Impact Statements",
        explanation:
          "Several roles list responsibilities but no outcomes. For every role, aim to include at least one result: 'increased conversions by X%', 'shipped N features per quarter'.",
      },
      {
        type: "improve",
        tip: "Education Section Needs Detail",
        explanation:
          "Add relevant coursework, GPA (if above 3.5), or academic projects that align with this role — especially if you have limited work experience.",
      },
    ],
  },
  structure: {
    score: 80,
    tips: [
      {
        type: "good",
        tip: "Logical Section Order",
        explanation:
          "Summary → Experience → Skills → Education is the optimal order for experienced candidates and your resume follows this correctly.",
      },
      {
        type: "good",
        tip: "Appropriate Length",
        explanation:
          "At one page, your resume respects recruiter time. Two pages is acceptable only with 7+ years of experience.",
      },
      {
        type: "improve",
        tip: "Skills Section Placement",
        explanation:
          "Moving your skills section higher (right after the summary) helps ATS systems and human reviewers quickly identify your core competencies.",
      },
      {
        type: "improve",
        tip: "No Links or Portfolio",
        explanation:
          "Add a GitHub URL, portfolio link, or LinkedIn profile. For technical roles, this is often as important as the resume itself.",
      },
    ],
  },
  skills: {
    score: 65,
    tips: [
      {
        type: "improve",
        tip: "Skill Categories Unlabeled",
        explanation:
          "Group your skills into categories: Languages, Frameworks, Tools, Platforms. This makes scanning faster and signals organisational thinking.",
      },
      {
        type: "improve",
        tip: "Outdated Technologies Listed",
        explanation:
          "Listing technologies that are no longer industry-standard (e.g. jQuery as a primary skill) can signal a stale skill set. Prioritise modern alternatives.",
      },
      {
        type: "good",
        tip: "Core Stack Present",
        explanation:
          "Your primary stack matches well with the job requirements. The listed technologies are relevant and current.",
      },
      {
        type: "improve",
        tip: "Soft Skills Missing",
        explanation:
          "For senior or collaborative roles, including soft skills like 'cross-functional collaboration' or 'technical mentorship' adds context ATS keyword matching picks up.",
      },
    ],
  },
};

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
        keywords: {
          found: string[]; //important keywords from the job description that are present in the resume
          missing: string[]; //important keywords from the job description that are missing from the resume
        };
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      Provide the feedback using the following format:
      ${AIResponseFormat}
      Return the analysis as an JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;
