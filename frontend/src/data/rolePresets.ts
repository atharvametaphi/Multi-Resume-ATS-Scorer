import type { RolePreset } from "../types/recruiter";

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "qa-engineer",
    title: "QA Engineer",
    jdPreview:
      "Validate product quality across manual and automation layers, collaborate with engineering, and improve release confidence.",
    jdText:
      "We are hiring a QA Engineer. Required skills: Python, Selenium, SQL, API Testing, Test Case Design, Regression Testing. Must have 3+ years of testing experience and strong communication with cross-functional teams.",
    requiredSkills: ["Python", "Selenium", "SQL", "API Testing"]
  },
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    jdPreview:
      "Design and scale backend services, build reliable APIs, and own performance and availability for production systems.",
    jdText:
      "We are hiring a Backend Engineer. Required skills: Python, FastAPI, SQL, Docker, AWS, REST API design, Unit Testing. Experience required: 4+ years building scalable APIs.",
    requiredSkills: ["Python", "FastAPI", "SQL", "Docker", "AWS"]
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    jdPreview:
      "Translate business questions into measurable insights with SQL and BI tooling, and present data-backed recommendations.",
    jdText:
      "We are hiring a Data Analyst. Required skills: SQL, Excel, Tableau, Python, Data Visualization, Statistics. Experience required: 2+ years in analytics and stakeholder reporting.",
    requiredSkills: ["SQL", "Python", "Tableau", "Statistics"]
  }
];

