import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aisummariseCommit, delay } from "./gemini";
import type { CommitProcessingStatus } from "@prisma/client";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

type CommitResponse = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
};


// Get commit hashes from a GitHub repository

export const getCommitHashes = async (githubUrl: string): Promise<CommitResponse[]> => {
    try {
        // Extract owner and repo from GitHub URL
        const urlParts = githubUrl.split('/');
        const owner = urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];
        
        if (!owner || !repo) {
            throw new Error('Invalid GitHub URL: ' + githubUrl);
        }
        
        console.log(`Fetching commits for ${owner}/${repo}`);
        
        const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: 25 // Increase limit to get more commits if needed
        });

        const sortedCommits = data.sort((a: any, b: any) => 
            new Date(b.commit.author?.date || 0).getTime() - 
            new Date(a.commit.author?.date || 0).getTime()
        );

        return sortedCommits.slice(0, 15).map((commit: any) => ({
            commitHash: commit.sha as string,
            commitMessage: commit.commit.message ?? "",
            commitAuthorName: commit.commit?.author?.name ?? "",
            commitAuthorAvatar: commit?.author?.avatar_url ?? "",
            commitDate: commit.commit?.author?.date ?? ""
        }));
    } catch (error) {
        console.error("Error fetching commit hashes:", error);
        throw new Error(`Failed to fetch commits: ${error}`);
    }
};


// Poll commits for a project and process them :->

export const pollCommits = async (projectId: string) => {
  try {
    console.log(`Polling commits for project ${projectId}`);
    
    const { githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    console.log(`Found ${commitHashes.length} total commits from GitHub`);
    
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
    console.log(`Found ${unprocessedCommits.length} commits needing (re)processing`);
    
    if (unprocessedCommits.length === 0) {
      console.log("No commits need processing");
      return { count: 0 };
    }
    
    // Mark commits as PROCESSING before starting
    for (const commit of unprocessedCommits) {
      try {
        await db.commit.upsert({
          where: {
            projectId_commitHash: {
              projectId,
              commitHash: commit.commitHash
            }
          },
          update: {
            processingStatus: 'PROCESSING'
          },
          create: {
            projectId,
            commitHash: commit.commitHash,
            commitMessage: commit.commitMessage,
            commitAuthorName: commit.commitAuthorName,
            commitAuthorAvatar: commit.commitAuthorAvatar,
            commitDate: commit.commitDate,
            summary: "Processing in progress...",
            processingStatus: 'PROCESSING'
          }
        });
      } catch (error) {
        console.error(`Error marking commit ${commit.commitHash} as processing:`, error);
      }
    }
    
    // Process commits in batches
    const BATCH_SIZE = 3;
    const processedCommits: any[] = [];
    
    for (let i = 0; i < unprocessedCommits.length; i += BATCH_SIZE) {
      console.log(`Processing commit batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(unprocessedCommits.length/BATCH_SIZE)}`);
      
      const batch = unprocessedCommits.slice(i, i + BATCH_SIZE);
      const commitPromiseResults = await Promise.allSettled(batch.map(async (commit) => {
        try {
          const diffData = await fetchCommitDiff(githubUrl, commit.commitHash);
          
          if (diffData.length > 100000) {
            console.warn(`Commit ${commit.commitHash} has a very large diff (${diffData.length} bytes), truncating...`);
          }
          
          // Get summary with retries
          let summary = "";
          let processingStatus: CommitProcessingStatus = 'FAILED';
          let retries = 0;
          const MAX_RETRIES = 2;
          
          while (retries <= MAX_RETRIES) {
            try {
              summary = await aisummariseCommit(diffData) || "";
              if (summary && summary.trim().length > 0 && !summary.includes("Failed to")) {
                processingStatus = 'COMPLETED';
                break; // Success!
              }
              console.warn(`Poor quality summary for commit ${commit.commitHash}, retrying (${retries + 1}/${MAX_RETRIES + 1})...`);
            } catch (summaryError) {
              console.error(`Error getting summary for commit ${commit.commitHash}, retry ${retries + 1}/${MAX_RETRIES + 1}:`, summaryError);
            }
            
            retries++;
            if (retries <= MAX_RETRIES) {
              await delay(2000);
            }
          }
          
          // Set final summary and status
          if (processingStatus === 'FAILED' || !summary || summary.trim().length === 0) {
            summary = `Processing failed: Unable to generate AI summary for this commit. View the full diff for details.`;
            processingStatus = 'FAILED';
          }
          
          return {
            projectId,
            commitHash: commit.commitHash,
            commitMessage: commit.commitMessage,
            commitAuthorName: commit.commitAuthorName,
            commitAuthorAvatar: commit.commitAuthorAvatar,
            commitDate: commit.commitDate,
            summary,
            processingStatus
          };
        } catch (error) {
          console.error(`Error processing commit ${commit.commitHash}:`, error);
          return {
            projectId,
            commitHash: commit.commitHash,
            commitMessage: commit.commitMessage,
            commitAuthorName: commit.commitAuthorName,
            commitAuthorAvatar: commit.commitAuthorAvatar,
            commitDate: commit.commitDate,
            summary: `Processing failed: ${error.message || 'Unknown error'}`,
            processingStatus: 'FAILED' as CommitProcessingStatus
          };
        }
      }));
      
      // Extract fulfilled results
      commitPromiseResults.forEach(result => {
        if (result.status === 'fulfilled') {
          processedCommits.push(result.value);
        } else {
          console.error("Failed to process a commit:", result.reason);
        }
      });
      
      // Add delay between batches
      if (i + BATCH_SIZE < unprocessedCommits.length) {
        console.log("Pausing between batches to avoid rate limiting...");
        await delay(3000);
      }
    }
    
    // Update all processed commits in database
    console.log(`Updating ${processedCommits.length} processed commits in database`);
    
    for (const commitData of processedCommits) {
      try {
        await db.commit.upsert({
          where: {
            projectId_commitHash: {
              projectId: commitData.projectId,
              commitHash: commitData.commitHash
            }
          },
          update: {
            summary: commitData.summary,
            processingStatus: commitData.processingStatus,
            updatedAt: new Date()
          },
          create: commitData
        });
        
        console.log(`✅ Updated commit ${commitData.commitHash.substring(0, 8)} with status: ${commitData.processingStatus}`);
      } catch (dbError) {
        console.error(`Database error updating commit ${commitData.commitHash}:`, dbError);
      }
    }
    
    const successfulCount = processedCommits.filter(c => c.processingStatus === 'COMPLETED').length;
    const failedCount = processedCommits.filter(c => c.processingStatus === 'FAILED').length;
    
    console.log(`Processing completed: ${successfulCount} successful, ${failedCount} failed`);
    return { 
      count: processedCommits.length, 
      successful: successfulCount, 
      failed: failedCount 
    };
  } catch (error) {
    console.error("Error in pollCommits:", error);
    throw new Error(`Failed to poll commits: ${error.message}`);
  }
};


// Fetch the diff for a specific commit

async function fetchCommitDiff(githubUrl: string, commitHash: string): Promise<string> {
    try {
        const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
            headers: {
                Accept: `application/vnd.github.v3.diff`
            },
            timeout: 10000 // 10 second timeout
        });
        
        return data || "";
    } catch (error) {
        console.error(`Error fetching diff for commit ${commitHash}:`, error);
        
        // Try an alternative approach if the first one failed
        try {
            console.log(`Trying alternative approach for fetching diff for commit ${commitHash}`);
            
            // Extract owner and repo from GitHub URL
            const urlParts = githubUrl.split('/');
            const owner = urlParts[urlParts.length - 2];
            const repo = urlParts[urlParts.length - 1];
            
            const { data } = await octokit.rest.repos.getCommit({
                owner,
                repo,
                ref: commitHash
            });
            
            // Manually construct a diff-like format from the commit data
            let diff = "";
            
            if (data.files && Array.isArray(data.files)) {
                for (const file of data.files) {
                    diff += `diff --git a/${file.filename} b/${file.filename}\n`;
                    diff += `--- a/${file.filename}\n`;
                    diff += `+++ b/${file.filename}\n`;
                    
                    if (file.patch) {
                        diff += file.patch + "\n\n";
                    } else {
                        diff += `Binary file or large change (no patch available)\n\n`;
                    }
                }
            }
            
            return diff || "No diff data available";
        } catch (alternativeError) {
            console.error(`Alternative approach also failed for commit ${commitHash}:`, alternativeError);
            return "Failed to fetch commit diff";
        }
    }
}


//  Fetch project GitHub URL from database
 
async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: {
            githubUrl: true
        }
    });
    
    if (!project?.githubUrl) {
        throw new Error(`Project ${projectId} has no GitHub URL`);
    }
    
    return { githubUrl: project.githubUrl };
}


// Filter out commits that have already been processed

async function filterUnprocessedCommits(projectId: string, commitHashes: CommitResponse[]): Promise<CommitResponse[]> {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
    select: { 
      commitHash: true, 
      summary: true, 
      processingStatus: true 
    }
  });
  
  const successfullyProcessedHashes = new Set<string>();
  
  processedCommits.forEach(commit => {
    // Only consider it "successfully processed" if:
    // 1. Status is COMPLETED, AND
    // 2. Summary doesn't contain failure indicators, AND  
    // 3. Summary has reasonable length (not just error message)
    const isValidSummary = !commit.summary.includes("Failed to") && 
                          !commit.summary.includes("API error") &&
                          !commit.summary.includes("Failed to process") &&
                          !commit.summary.includes("Processing failed") &&
                          commit.summary.length > 20;
    
    if (commit.processingStatus === 'COMPLETED' && isValidSummary) {
      successfullyProcessedHashes.add(commit.commitHash);
    }
  });
  
  const unprocessedCommits = commitHashes.filter(commit => 
    !successfullyProcessedHashes.has(commit.commitHash)
  );
  
  console.log(`Found ${processedCommits.length} total commits in database`);
  console.log(`Found ${successfullyProcessedHashes.size} successfully processed commits`);
  console.log(`Found ${unprocessedCommits.length} commits that need (re)processing`);
  
  return unprocessedCommits;
}