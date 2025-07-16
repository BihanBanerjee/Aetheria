// src/lib/inngest/functions/index.ts
import { projectFunctions } from "./project";
import { meetingFunctions } from "./meeting";

// Export all functions as a single array for Inngest
export const functions = [
  ...projectFunctions,
  ...meetingFunctions
];

// Export individual function arrays
export { projectFunctions, meetingFunctions };

// Export individual functions for direct import
export { 
  processProjectCreation,
  processSingleCommit 
} from "./project";

export { 
  processMeetingFunction 
} from "./meeting";