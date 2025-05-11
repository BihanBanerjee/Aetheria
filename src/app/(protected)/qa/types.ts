// Common types used throughout the QA components

export interface User {
  imageUrl: string;
  firstName?: string;
}

export interface FileReference {
  fileName: string;
  sourceCode: string;
}

export interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  user: User;
  filesReferences?: FileReference[];
}