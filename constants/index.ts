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

export interface JobContext {
  jobTitle: string;
  jobDescription: string;
}

// Output length is what the user waits on: the response streams token by
// token, so every extra word of prose is extra seconds on the progress bar.
// Tips are capped at 3 and explanations at one sentence for that reason —
// loosen these and the analysis gets measurably slower.
//
// For the same reason the five sections are scored by TWO prompts run in
// parallel (see `streamSplitFeedback` in `lib/puter.ts`) rather than one that
// emits all of them: each half is roughly half the tokens, so the user waits
// on the slower half instead of on the sum. Keep the halves balanced — moving
// a section across changes which one dominates.
const SECTION_SHAPE = `
      // Section = {
      //   score: number (0-100),
      //   tips: exactly 3 of {
      //     type: "good" | "improve",
      //     tip: string,          // short title, max 8 words
      //     explanation: string,  // ONE sentence, max 25 words
      //   },
      // }`;

const rules = ({ jobTitle, jobDescription }: JobContext) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis. Your job is to give HONEST, ACCURATE feedback.

      CRITICAL RULES — follow these before scoring anything:
      1. If the resume provided is not a real resume (e.g. it is blank, random text, a photo, a meme, or unrelated content), set ALL scores to 0 and explain in every tip that valid resume content was not detected.
      2. If the job title or job description appears to be random characters, nonsense, or clearly fake (e.g. "asdfjkl", "qqqqq", "test test", "blah blah"), set ALL scores below 20 and note in every tip that a valid job description was not provided.
      3. If the resume content has no meaningful relation to the provided job title or job description, all scores should reflect that mismatch — do NOT inflate scores out of politeness.
      4. Be brutally honest. If the resume is weak, scores should be low (20–40). Only give high scores (80+) for genuinely strong, well-matched resumes.
      5. Never fabricate keywords or skills not actually present in the resume.
      6. Be terse. Every tip is one short title plus ONE sentence of at most 25 words — no preamble, no restating the rubric, no repeating a point across sections.

      The job title is: ${jobTitle}
      The job description is: ${jobDescription}`;

const closing = `
      Return ONLY that JSON object — no other text, no comments, no backticks.`;

/** Half one of the parallel analysis: machine-readability and skill match. */
export const prepareAtsInstructions = (job: JobContext) =>
  `${rules(job)}

      Score ONLY these two dimensions of the resume:
      ${SECTION_SHAPE}
      {
        "ATS": Section & {
          // score reflects how well an applicant tracking system can parse and match this resume
          "keywords": {
            "found": string[],   // max 8 job-description keywords present in the resume
            "missing": string[]  // max 8 job-description keywords absent from the resume
          }
        },
        "skills": Section  // depth and relevance of the skills on offer vs the job
      }${closing}`;

/** Half two of the parallel analysis: how the resume is written. */
export const prepareWritingInstructions = (job: JobContext) =>
  `${rules(job)}

      Score ONLY these three dimensions of the resume:
      ${SECTION_SHAPE}
      {
        "toneAndStyle": Section, // voice, confidence, professionalism
        "content": Section,      // substance of the achievements and their relevance to the job
        "structure": Section     // layout, ordering, section headings, length
      }${closing}`;
