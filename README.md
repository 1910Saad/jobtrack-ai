# JobTrack AI 🚀

AI-powered job search and application tracking platform built with Next.js.

JobTrack AI helps job seekers manage job applications, analyze job descriptions, and compare their resumes against specific job requirements.

## ✨ Features

### 📋 Job Application Tracker

Track applications throughout the hiring process using a Kanban-style workflow.

Current statuses:

- Wishlist
- Applied
- OA
- Interview
- HR
- Offer
- Rejected

Each application can store:

- Company
- Job title
- Location
- Job URL
- Salary
- Applied date
- Notes

### 🤖 AI Job Analyzer

Paste a job description and use AI to extract:

- Job title
- Summary
- Required skills
- Preferred skills
- Important keywords
- Responsibilities
- Preparation topics
- Experience requirements
- Education requirements

### 📄 AI Resume Matcher

Compare a resume with a job description and receive:

- Match score
- Candidate skills
- Matching skills
- Missing skills
- Job requirements
- AI recommendations
- Overall summary

### 🕒 Analysis History

Previous analyses are saved and can be viewed later.

#### Job Analyzer

```text
/analyzer
```

Create a new job analysis.

```text
/analyzer/history
```

View previous analyses.

```text
/analyzer/history/[id]
```

View a specific analysis.

#### Resume Matcher

```text
/resume-matcher
```

Create a resume match analysis.

```text
/resume-matcher/history
```

View previous resume analyses.

```text
/resume-matcher/history/[id]
```

View a specific resume analysis.

### 🔐 Authentication

Authentication is handled using Clerk.

Each user's applications and AI analysis history are associated with their authenticated user ID.

---

## 🛠️ Tech Stack

### Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js App Router
- Next.js API Routes
- TypeScript

### Authentication

- Clerk

### Database

- PostgreSQL
- Neon

### ORM

- Drizzle ORM
- Drizzle Kit

### AI

- Google Gemini API
- `@google/genai`

---

## 🏗️ Project Structure

```text
jobtrack-ai/
│
├── app/
│   ├── (app)/
│   │   ├── analyzer/
│   │   │   ├── history/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── resume-matcher/
│   │   │   ├── history/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── applications/
│   │   ├── dashboard/
│   │   └── layout.tsx
│   │
│   └── api/
│       ├── analyzer/
│       ├── resume-matcher/
│       └── applications/
│
├── db/
│   ├── index.ts
│   └── schema.ts
│
├── drizzle/
│   └── migrations/
│
├── public/
│
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/1910Saad/jobtrack-ai.git
cd jobtrack-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your_neon_database_url"

GEMINI_API_KEY="your_gemini_api_key"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

CLERK_SECRET_KEY="your_clerk_secret_key"
```

Never commit your `.env` file.

### 4. Generate database migrations

```bash
npx drizzle-kit generate
```

### 5. Apply migrations

```bash
npx drizzle-kit migrate
```

### 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🔄 How It Works

### AI Job Analyzer

```text
Job Description
       ↓
Next.js API Route
       ↓
Google Gemini
       ↓
Structured JSON
       ↓
PostgreSQL
       ↓
Analysis UI
```

### AI Resume Matcher

```text
Resume + Job Description
          ↓
   Next.js API Route
          ↓
     Google Gemini
          ↓
     Match Analysis
          ↓
      PostgreSQL
          ↓
      Match Result
```

### Application Tracking

```text
Create Application
        ↓
   Job Board
        ↓
┌──────────┬─────────┬─────┬───────────┐
│ Wishlist │ Applied │ OA  │ Interview │
└──────────┴─────────┴─────┴───────────┘
                    ↓
              HR → Offer
                    ↓
                 Rejected
```

---

## 🗄️ Database

JobTrack AI uses PostgreSQL with Drizzle ORM.

Current main tables:

### `applications`

Stores job application information.

### `job_analyzers`

Stores AI-generated job description analyses.

### `resume_matchers`

Stores AI-generated resume-to-job matching results.

---

## 🚧 Roadmap

### Job Applications

- [x] Application creation
- [x] Application tracking
- [x] Kanban statuses
- [x] Application editing
- [ ] Application detail page
- [ ] Search and filtering
- [ ] Application statistics
- [ ] Interview tracking
- [ ] Offer tracking

### AI Features

- [x] AI Job Analyzer
- [x] AI Resume Matcher
- [x] Analysis history
- [ ] AI resume improvement
- [ ] AI resume tailoring
- [ ] AI cover letter generation
- [ ] AI interview preparation
- [ ] AI-generated interview questions
- [ ] Skill-gap learning roadmap

### Dashboard

- [ ] Application statistics
- [ ] Interview statistics
- [ ] Success rate
- [ ] Application analytics
- [ ] AI-powered job search insights

---

## 🔒 Security

JobTrack AI uses:

- Clerk authentication
- User-specific database queries
- Server-side API routes
- Environment variables for secrets
- Drizzle ORM for database access

Do not commit:

```text
.env
.env.local
API keys
Database credentials
Clerk secret keys
```

---

## 🚀 Production Build

Test the production build with:

```bash
npm run build
```

Start the production server with:

```bash
npm start
```

The application can be deployed using Vercel with Neon PostgreSQL.

---

## 👨‍💻 Author

**Saad Khan**

Computer Engineering Graduate  
AI Developer • Full Stack Developer

GitHub:  
https://github.com/1910Saad