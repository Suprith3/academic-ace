
export enum FileType {
  QUESTION_PAPER = 'question_paper',
  NOTES = 'notes',
  SYLLABUS = 'syllabus'
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface UploadedDocument {
  id: string;
  userId: string;
  filename: string;
  fileType: FileType;
  extractedText: string;
  uploadedAt: string;
}

export interface Topic {
  name: string;
  weight: number; // 1-10
  description: string;
}

export interface QuestionSolution {
  question: string;
  answer: string;
  foundInNotes: boolean;
}

export interface QuestionPaperAnalysis {
  id: string;
  documentId: string;
  topicBreakdown: Topic[];
  difficultyAnalysis: {
    level: 'Easy' | 'Medium' | 'Hard';
    reasoning: string;
  };
  importantQuestions: string[];
  solutions?: QuestionSolution[];
}

export interface StudyDay {
  day: number;
  topics: string[];
  tasks: string[];
  focusArea: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  inputs: {
    difficulty: string;
    knowledgeLevel: string;
    daysLeft: number;
  };
  generatedPlan: StudyDay[];
  lastModified: string;
}
