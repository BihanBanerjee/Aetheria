import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aisummariseCommit, delay } from "./gemini";

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
        console.log(`Found ${commitHashes.length} total commits`);
        
        const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
        console.log(`Found ${unprocessedCommits.length} unprocessed commits`);
        
        if (unprocessedCommits.length === 0) {
            console.log("No new commits to process");
            return { count: 0 };
        }
        
        // Process commits in batches to avoid rate limiting
        const BATCH_SIZE = 3;
        const processedCommits: any[] = [];
        
        for (let i = 0; i < unprocessedCommits.length; i += BATCH_SIZE) {
            console.log(`Processing commit batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(unprocessedCommits.length/BATCH_SIZE)}`);
            
            const batch = unprocessedCommits.slice(i, i + BATCH_SIZE);
            const commitPromiseResults = await Promise.allSettled(batch.map(async (commit) => {
                try {
                    const diffData = await fetchCommitDiff(githubUrl, commit.commitHash);
                    
                    // Check if diff is too large
                    if (diffData.length > 100000) {
                        console.warn(`Commit ${commit.commitHash} has a very large diff (${diffData.length} bytes), truncating...`);
                    }
                    
                    // Get summary with retries if needed
                    let summary = "";
                    let retries = 0;
                    const MAX_RETRIES = 2;
                    
                    while (retries <= MAX_RETRIES) {
                        try {
                            summary = await aisummariseCommit(diffData) || "";
                            if (summary && summary.trim().length > 0) {
                                break; // Success, exit retry loop
                            }
                            console.warn(`Empty summary for commit ${commit.commitHash}, retrying (${retries + 1}/${MAX_RETRIES + 1})...`);
                        } catch (summaryError) {
                            console.error(`Error getting summary for commit ${commit.commitHash}, retry ${retries + 1}/${MAX_RETRIES + 1}:`, summaryError);
                        }
                        
                        retries++;
                        if (retries <= MAX_RETRIES) {
                            await delay(2000); // Wait before retrying
                        }
                    }
                    
                    // If all retries failed, set a default message
                    if (!summary || summary.trim().length === 0) {
                        summary = `Commit containing changes to multiple files. View the full diff for details.`;
                    }
                    
                    return {
                        projectId,
                        commitHash: commit.commitHash,
                        commitMessage: commit.commitMessage,
                        commitAuthorName: commit.commitAuthorName,
                        commitAuthorAvatar: commit.commitAuthorAvatar,
                        commitDate: commit.commitDate,
                        summary
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
                        summary: "Failed to process commit diff"
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
            
            // Add a delay between batches to avoid rate limiting
            if (i + BATCH_SIZE < unprocessedCommits.length) {
                console.log("Pausing between batches to avoid rate limiting...");
                await delay(3000); // 3 second delay between batches
            }
        }
        
        // Save all processed commits to the database
        console.log(`Saving ${processedCommits.length} processed commits to database`);
        
        // Save commits one by one to handle errors better
        const commitSavePromises = processedCommits.map(commitData => 
            db.commit.create({ data: commitData })
                .catch(dbError => {
                    console.error(`Database error saving commit ${commitData.commitHash}:`, dbError);
                    return null;
                })
        );
        
        const savedResults = await Promise.allSettled(commitSavePromises);
        const savedCommits = savedResults
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => (result.status === 'fulfilled' ? result.value : null))
            .filter(Boolean);
        
        console.log(`Successfully saved ${savedCommits.length} commits`);
        return { count: savedCommits.length };
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

async function filterUnprocessedCommits(projectId: string, commitHashes: CommitResponse[]) {
    const processedCommits = await db.commit.findMany({
        where: { projectId },
        select: { commitHash: true }
    });
    
    const processedHashes = new Set(processedCommits.map(commit => commit.commitHash));
    
    return commitHashes.filter(commit => !processedHashes.has(commit.commitHash));
}