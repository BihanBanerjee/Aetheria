// src/lib/inngest/index.ts

// Export the main functions array
export { functions } from "./functions";

// Export individual function groups
export { projectFunctions } from "./functions/project";
export { meetingFunctions } from "./functions/meeting";

// Export individual functions
export { 
  processProjectCreation,
  processSingleCommit,
  processMeetingFunction 
} from "./functions";

// Export types
export type * from "./types";

// Export utilities
export { BATCH_PROCESSING_CONFIG, FUNCTION_IDS, EVENT_NAMES } from "./utils/constants";
export { batchProcessingUtils } from "./utils/batch-processing";
export { 
  projectDatabase,
  commitDatabase,
  sourceCodeDatabase,
  userDatabase,
  meetingDatabase 
} from "./utils/database";

// Export client
export { inngest } from "./client";