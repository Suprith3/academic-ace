
# Academic Ace - Student Productivity Platform

Academic Ace is an AI-powered student productivity platform built to analyze question papers and generate personalized study schedules using Google Gemini.

## 🚀 Architecture Overview

- **Frontend**: React 18+ (SPA) with TypeScript.
- **Styling**: Tailwind CSS for a modern, responsive UI.
- **AI Engine**: Google Gemini API (`gemini-3-flash-preview` and `gemini-3-pro-preview`).
- **Data Layer**: 
  - Simulated PostgreSQL/Prisma using Browser `localStorage`.
  - Functional service layer (`store.ts`) mimicking REST API interactions.
- **Backend Spec (Ready for implementation)**:
  - Framework: Express or Next.js.
  - ORM: Prisma (Schema included in `schema.prisma`).
  - Auth: JWT (mocked in SPA).

## 🧠 AI Prompt Engineering

Academic Ace uses highly deterministic prompts to ensure consistent JSON outputs:

### 1. Topic Extraction
- **Prompt**: "Analyze the following exam question paper text and extract key information..."
- **Constraints**: Strictly JSON, typed breakdown, weighted difficulty reasoning.

### 2. Study Plan Generation
- **Prompt**: "Create a comprehensive study plan for a student based on these parameters [Topics, Days, Knowledge, Difficulty]..."
- **Features**: Balancing topics, spacing repetitions, and focus areas.

### 3. Plan Refinement
- **Prompt**: "Modify the following study plan based on the user's request..."
- **Interface**: Chat-like interaction for fluid updates.

## 🛠 Setup & Development

1. **Environment Variables**:
   - Ensure `API_KEY` (Gemini) is available in your environment.

2. **Installation**:
   ```bash
   npm install
   ```

3. **Running the App**:
   ```bash
   npm start
   ```

## 📄 Database Schema (Prisma)
The requested Prisma schema is located in `schema.prisma` in the project root. It defines relations for `User`, `UploadedDocument`, `QuestionPaperAnalysis`, and `StudyPlan`.
