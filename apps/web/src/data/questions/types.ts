export type AptitudeCategory = "QUANTITATIVE" | "LOGICAL" | "VERBAL";
export type TestDifficulty = "EASY" | "MEDIUM" | "HARD";
export type QuestionSection = "CODING_MCQ" | "DSA";

export interface QuestionBankItem {
  id: string;
  category: AptitudeCategory;
  subCategory: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: TestDifficulty;
  section?: QuestionSection;
}
