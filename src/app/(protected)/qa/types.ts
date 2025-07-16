// Common types used throughout the QA components

export interface User {
  imageUrl: string | null;
  firstName?: string | null;
}

export interface FileReference {
  fileName: string;
  sourceCode: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
  user: User;
  filesReferences?: FileReference[] | null;
}