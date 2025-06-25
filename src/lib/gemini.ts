import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { RateLimiter } from "limiter";

// Rate limiter to prevent hitting API limits
// Adjust these values based on your API tier limits
const rateLimiter = new RateLimiter({
  tokensPerInterval: 20, // Number of requests allowed
  interval: "minute", // Time interval
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aisummariseCommit = async (diff: string) => {
  // Avoid processing empty diffs
  if (!diff || diff.trim().length === 0) {
    console.warn("Empty diff provided to aisummariseCommit");
    return "No diff content to summarize";
  }

  try {
    // Wait for a token from the rate limiter
    await rateLimiter.removeTokens(1);

    const response = await model.generateContent([
      `
            You are an expert programmer, and you are trying to summarize a git diff.
            Reminders about the git diff format:
            For every file, there are a few metadata lines, like (for example):
            \`\`\`
            diff --git a/lib/index.js b/lib/index.js
            index aadf691..bfef603 100644
            --- a/lib/index.js
            +++ b/lib/index.js
            \`\`\`
            This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
            Then there is a specifier of the lines that were modified.
            A line starting with \`+\` means it was added.
            A line starting with \`-\` means it was deleted.
            A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
            It is not part of the diff.
            [...]
            EXAMPLE SUMMARY COMMENTS:
            \`\`\`
            * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
            * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
            * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
            * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
            * Lowered the numeric tolerance for test files
            \`\`\`
            Most commits will have less comments than this examples list.
            The last comment does not include the file names,
            because there were more than two relevant files in the hypothetical commit.
            Do not include parts of the example in your summary.
            It is given only as an example of appropriate comments.`,
      `Please summarise the following diff file: \n\n${diff.slice(0, 30000)}`, // Limit input size
    ]);
    return response.response.text();
  } catch (error) {
    console.error("Error in aisummariseCommit:", error);
    return "Failed to summarize commit due to API error";
  }
};

export async function summariseCode(doc: Document) {
  console.log("Getting the summary for", doc.metadata.source);

  // Skip binary files, package-lock files, etc.
  const skipExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".min.js",
    ".min.css",
  ];
  if (
    skipExtensions.some((ext) =>
      doc.metadata.source.toLowerCase().endsWith(ext),
    )
  ) {
    console.log("Skipping binary or minified file:", doc.metadata.source);
    return "Binary or minified file (skipped for summarization)";
  }

  try {
    // Try to detect if content is binary/non-text by checking for null bytes
    if (doc.pageContent.includes("\0")) {
      console.log("Detected binary content in:", doc.metadata.source);
      return "Binary file content (not suitable for summarization)";
    }

    // Wait for a token from the rate limiter
    await rateLimiter.removeTokens(1);

    // Limit code to a reasonable size to avoid token limits
    const code = doc.pageContent.slice(0, 10000);

    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specializes in onboarding junior software engineers onto projects.`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
    Here is the code:
    ---
    ${code}
    ---
            Give a summary no more than 100 words of the code above.`,
    ]);
    return response.response.text();
  } catch (error) {
    console.error(`Error summarizing ${doc.metadata.source}:`, error);
    return `Failed to summarize ${doc.metadata.source.split("/").pop() || ""}`;
  }
}

export async function generateEmbedding(summary: string) {
  if (!summary || summary.trim().length === 0) {
    console.warn("Empty summary provided to generateEmbedding");
    // Return a zero vector as fallback
    return Array(768).fill(0);
  }

  try {
    // Wait for a token from the rate limiter
    await rateLimiter.removeTokens(1);

    const embeddingModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });
    const result = await embeddingModel.embedContent(summary);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return a zero vector as fallback on error
    return Array(768).fill(0);
  }
}

// Utility function to wait between API calls
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
