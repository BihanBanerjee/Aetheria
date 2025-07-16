// src/lib/inngest/functions/project/index.ts
import { processProjectCreation } from "./creation";
import { processSingleCommit } from "./commit";

export const projectFunctions = [
  processProjectCreation,
  processSingleCommit
];

export { 
  processProjectCreation,
  processSingleCommit 
};