
import { GoogleGenAI, Type } from "@google/genai";
import { Topic, StudyDay, QuestionSolution } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeQuestionPaper = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the provided exam paper text.
    
    1. Extract core topics.
    2. Assign a weight for each topic. THE SUM OF ALL WEIGHTS MUST BE EXACTLY 6. 
    3. Identify "Frequent Question Patterns" - these should be specific descriptions of recurring question styles, phrasing, or core concepts that appear often.
    
    PAPER TEXT:
    ${text}
    
    Respond STRICTLY in JSON:
    {
      "topicBreakdown": [{"name": "string", "weight": number, "description": "string"}],
      "difficultyAnalysis": {"level": "Easy" | "Medium" | "Hard", "reasoning": "string"},
      "importantQuestions": ["string"]
    }`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateSolutionsFromNotes = async (questions: string[], notesText: string): Promise<QuestionSolution[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a specialized academic tutor. Solve the following exam questions using ONLY the provided study notes.
    
    STRICT RULES:
    - Your primary source MUST be the study notes provided.
    - If the answer is found in the notes, set "foundInNotes" to true.
    - If the notes DO NOT contain enough information for a question, search your internal knowledge but YOU MUST prefix the answer with "[Sourced from External Knowledge]".
    - Be extremely thorough and accurate.
    
    QUESTIONS:
    ${JSON.stringify(questions)}
    
    STUDY NOTES CONTENT:
    ${notesText}
    
    Respond STRICTLY in JSON array: 
    [{"question": "string", "answer": "string", "foundInNotes": boolean}]`,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || '[]');
};

export const generateStudyPlan = async (
  topics: Topic[],
  daysLeft: number,
  knowledgeLevel: string,
  difficulty: string,
  notesContext?: string
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a detailed daily study schedule for ${daysLeft} days. 
    Topics & Weights: ${JSON.stringify(topics)}
    Student Level: ${knowledgeLevel}
    Course Difficulty: ${difficulty}
    
    IF NOTES CONTENT IS PROVIDED BELOW:
    - You MUST include specific citations for where to study each task. 
    - Citations should look like "Source: [Filename], Page X-Y" or "Source: [Filename], Section [Name]".
    - If page numbers aren't visible, use section headings.
    
    STUDY MATERIAL CONTEXT (includes file markers):
    ${notesContext || 'No notes available.'}
    
    Respond STRICTLY in JSON: 
    { "days": [{"day": number, "topics": ["string"], "tasks": ["string"], "focusArea": "string"}] }`,
    config: {
      responseMimeType: "application/json"
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return parsed.days || [];
};

export const refineStudyPlan = async (
  currentPlan: StudyDay[],
  userPrompt: string
) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Modify this study plan based on: "${userPrompt}"
    Current Plan: ${JSON.stringify(currentPlan)}
    Respond STRICTLY in JSON: { "days": [...] }`,
    config: {
      responseMimeType: "application/json"
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return parsed.days || [];
};
