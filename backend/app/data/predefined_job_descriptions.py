from __future__ import annotations

from typing import TypedDict


class PredefinedJobDescription(TypedDict):
    jd_id: str
    job_title: str
    experience: str
    location: str
    summary: str
    key_responsibilities: list[str]
    required_skills: list[str]
    preferred_skills: list[str]
    qualification: list[str]


PREDEFINED_JOB_DESCRIPTIONS: list[PredefinedJobDescription] = [
    {
        "jd_id": "mern-stack-developer",
        "job_title": "MERN Stack Developer",
        "experience": "0-3 Years",
        "location": "[Company Location / Hybrid / Remote]",
        "summary": (
            "We are looking for a passionate MERN Stack Developer to join our development team. "
            "The candidate should have a strong understanding of web application development using "
            "MongoDB, Express.js, React.js, and Node.js. You will be responsible for developing "
            "scalable applications, APIs, and user-friendly interfaces."
        ),
        "key_responsibilities": [
            "Develop and maintain web applications using the MERN stack",
            "Build reusable frontend components using React.js",
            "Design and develop REST APIs using Node.js and Express.js",
            "Work with MongoDB for database operations and schema design",
            "Collaborate with UI/UX designers and backend developers",
            "Debug, optimize, and improve application performance",
            "Write clean, scalable, and maintainable code",
            "Participate in code reviews and testing activities",
        ],
        "required_skills": [
            "JavaScript",
            "HTML",
            "CSS",
            "React.js",
            "Node.js",
            "Express.js",
            "MongoDB",
            "REST APIs",
            "JSON",
            "Git",
            "GitHub",
            "Responsive Design",
            "Debugging",
        ],
        "preferred_skills": [
            "Redux",
            "TypeScript",
            "Next.js",
            "AWS",
            "Azure",
            "Authentication",
            "Security Practices",
            "Full-stack Internship/Projects",
        ],
        "qualification": [
            "Bachelor's degree in Computer Science, IT, or related field",
            "Freshers with strong projects can also apply",
        ],
    },
    {
        "jd_id": "qa-engineer",
        "job_title": "QA Engineer / Software Test Engineer",
        "experience": "0-3 Years",
        "location": "[Company Location / Hybrid / Remote]",
        "summary": (
            "We are seeking a detail-oriented QA Engineer to ensure the quality and reliability of "
            "our software applications. The ideal candidate should have knowledge of manual testing, "
            "bug tracking, and software testing methodologies."
        ),
        "key_responsibilities": [
            "Perform manual testing of web and mobile applications",
            "Create and execute test cases and test scenarios",
            "Identify, report, and track bugs using bug management tools",
            "Collaborate with developers to resolve issues",
            "Conduct regression, functional, and UI testing",
            "Validate APIs and backend responses",
            "Participate in requirement analysis and quality reviews",
            "Ensure applications meet quality standards before release",
        ],
        "required_skills": [
            "SDLC",
            "STLC",
            "Manual Testing",
            "Bug Tracking",
            "Jira",
            "Bugzilla",
            "API Testing",
            "Postman",
            "Analytical Skills",
            "Documentation",
            "Attention to Detail",
        ],
        "preferred_skills": [
            "Selenium",
            "Cypress",
            "Playwright",
            "SQL",
            "Database Testing",
            "Agile",
            "Scrum",
            "Performance Testing",
            "Security Testing",
        ],
        "qualification": [
            "Bachelor's degree in Computer Science, IT, or related field",
            "Freshers with testing certification/projects can also apply",
        ],
    },
    {
        "jd_id": "ui-ux-designer",
        "job_title": "UI/UX Designer",
        "experience": "0-3 Years",
        "location": "[Company Location / Hybrid / Remote]",
        "summary": (
            "We are looking for a creative UI/UX Designer to design intuitive and visually appealing "
            "digital experiences. The candidate should have a strong eye for design, usability, and "
            "user-centric thinking."
        ),
        "key_responsibilities": [
            "Design user-friendly web and mobile interfaces",
            "Create wireframes, mockups, and prototypes",
            "Conduct user research and usability analysis",
            "Collaborate with developers and product teams",
            "Maintain design consistency and design systems",
            "Improve user experience through feedback and testing",
            "Design responsive layouts and interactive components",
        ],
        "required_skills": [
            "Figma",
            "Adobe XD",
            "UI/UX Principles",
            "Typography",
            "Color Theory",
            "Layout Design",
            "Responsive Design",
            "Mobile-first Design",
            "Wireframing",
            "Prototyping",
            "Creative Thinking",
            "Attention to Detail",
        ],
        "preferred_skills": [
            "HTML",
            "CSS",
            "Design Systems",
            "Component Libraries",
            "User Research",
            "Usability Testing",
            "Motion Design",
            "Animation",
        ],
        "qualification": [
            "Bachelor's degree in Design, Computer Science, or related field",
            "Strong portfolio of UI/UX projects preferred",
        ],
    },
]
