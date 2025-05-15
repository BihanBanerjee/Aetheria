import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
// import { Document } from "@langchain/core/documents";
import { generateEmbedding, summariseCode, delay } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const getFileCount = async (path: string, octokit: Octokit, githubOwner: string, githubRepo: string, acc:number = 0) => {
    const { data } = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path
    });
    if(!Array.isArray(data) && data.type === 'file') {
        return acc + 1
    }
    if(Array.isArray(data)) {
        let fileCount = 0;
        const directories: string[] = []

        for (const item of data) {
            if(item.type === 'dir') {
                directories.push(item.path)
            } else {
                fileCount ++
            }
        }

        if(directories.length > 0) {
            const directoryCounts = await Promise.all(directories.map(directory => getFileCount(directory, octokit, githubOwner, githubRepo, 0)))
            fileCount += directoryCounts.reduce((acc, count) => acc + count, 0)
        }
        return acc + fileCount
    }
    return acc
}

/*
export const checkCredits = async (githubUrl: string, githubtoken: string) => {
    // find out how many files are in the repo
    const octokit = new Octokit({
        auth: githubtoken,
    })
    const githubOwner = githubUrl.split("/")[3];
    const githubRepo = githubUrl.split("/")[4];

    if(!githubOwner || !githubRepo) {
        return 0
    }
    
    const fileCount = await getFileCount("", octokit, githubOwner, githubRepo, 0);
    return fileCount
}
*/

export const checkCredits = async (githubUrl: string, githubToken: string) => {
    // find out how many files are in the repo
    const octokit = new Octokit({
        auth: githubToken || process.env.GITHUB_TOKEN, // Fall back to env if no user token.
    })
    const githubOwner = githubUrl.split("/")[3];
    const githubRepo = githubUrl.split("/")[4];

    if(!githubOwner || !githubRepo) {
        return 0
    }
    
    try {
        // Get the default branch
        const { data: repoData } = await octokit.rest.repos.get({
            owner: githubOwner,
            repo: githubRepo
        });
        
        const defaultBranch = repoData.default_branch;
        
        // Get the commit SHA of the head of the default branch
        const { data: refData } = await octokit.rest.git.getRef({
            owner: githubOwner,
            repo: githubRepo,
            ref: `heads/${defaultBranch}`
        });
        
        const commitSha = refData.object.sha;
        
        // Get the entire file tree in one request
        const { data: treeData } = await octokit.rest.git.getTree({
            owner: githubOwner,
            repo: githubRepo,
            tree_sha: commitSha,
            recursive: '1'
        });
        
        // Count only files (not directories)
        const fileCount = treeData.tree.filter(item => item.type === 'blob').length;
        
        return fileCount;
    } catch (error) {
        console.error("Error counting files:", error);
        // Fall back to the previous method if the Git Trees API fails
        // (This could happen with very large repositories)
        try {
            console.log("Falling back to directory traversal method");
            return await getFileCount("", octokit, githubOwner, githubRepo, 0);
        } catch (fallbackError) {
            console.error("Both file counting methods failed:", fallbackError);
            throw error;
        }
    }
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    try {
        const loader = new GithubRepoLoader(githubUrl, {
            accessToken: githubToken || '',
            branch: 'main',
            ignoreFiles: [
                'package-lock.json', 
                'pnpm-lock.yaml', 
                'yarn.lock', 
                'bun.lockb',
                // Add more file patterns to ignore
                '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.ttf', '.woff', '.woff2',
                '.mp4', '.webm', '.mp3', '.wav', '.ogg',
                '.xls', '.xlsx', '.ppt', '.pptx'
            ],
            recursive: true,
            unknown: 'warn',
            maxConcurrency: 3, // Reduced concurrency to prevent rate limiting
        });
        
        const docs = await loader.load();
        console.log(`Loaded ${docs.length} files from repository`);
        return docs;
    } catch (error) {
        console.error("Error loading GitHub repo:", error);
        throw new Error(`Failed to load GitHub repository: ${error}`);
    }
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    try {
        const docs = await loadGithubRepo(githubUrl, githubToken);
        console.log(`Starting to process ${docs.length} files`);
        
        // Process files in batches to avoid overwhelming the API
        const BATCH_SIZE = 5;
        const results = [];
        
        for (let i = 0; i < docs.length; i += BATCH_SIZE) {
            console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(docs.length/BATCH_SIZE)}`);
            const batch = docs.slice(i, i + BATCH_SIZE);
            
            // Process each batch
            const batchResults = await Promise.allSettled(batch.map(async (doc) => {
                try {
                    const summary = await summariseCode(doc);
                    
                    // Skip processing if we got an empty summary
                    if (!summary || summary.trim() === "") {
                        console.warn(`Empty summary for ${doc.metadata.source}, skipping`);
                        return null;
                    }
                    
                    const embedding = await generateEmbedding(summary);
                    return { 
                        summary, 
                        embedding, 
                        sourceCode: doc.pageContent, 
                        fileName: doc.metadata.source
                    };
                } catch (error) {
                    console.error(`Error processing file ${doc.metadata.source}:`, error);
                    return null;
                }
            }));
            
            // Extract successful results and filter out nulls
            const successfulResults = batchResults
                .filter(result => result.status === 'fulfilled' && result.value !== null)
                .map(result => (result as PromiseFulfilledResult<any>).value);
            
            results.push(...successfulResults);
            
            // Add a delay between batches to avoid rate limiting
            if (i + BATCH_SIZE < docs.length) {
                console.log("Pausing between batches to avoid rate limiting...");
                await delay(2000); // 2 second delay between batches
            }
        }
        
        console.log(`Successfully processed ${results.length} files out of ${docs.length}`);
        
        // Save results to database
        for (const embedding of results) {
            try {
                const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                    data: {
                        summary: embedding.summary,
                        sourceCode: JSON.stringify(embedding.sourceCode), // Ensure proper serialization
                        fileName: embedding.fileName,
                        projectId,
                    }
                });

                await db.$executeRaw`
                UPDATE "SourceCodeEmbedding"
                SET "summaryEmbedding" = ${embedding.embedding}::vector
                WHERE "id" = ${sourceCodeEmbedding.id}
                `;
                
                console.log(`Saved embedding for ${embedding.fileName}`);
            } catch (dbError) {
                console.error(`Database error for ${embedding.fileName}:`, dbError);
            }
        }
        
        return results.length;
    } catch (error) {
        console.error("Error indexing GitHub repo:", error);
        throw new Error(`Failed to index GitHub repository: ${error}`);
    }
}