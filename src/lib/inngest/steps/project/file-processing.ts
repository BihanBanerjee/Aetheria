// src/lib/inngest/steps/project/file-processing.ts
import { loadGithubRepo } from "@/lib/github-loader";
import { summariseCode, generateEmbedding } from "@/lib/gemini";
import { sourceCodeDatabase } from "../../utils/database";
import { batchProcessingUtils } from "../../utils/batch-processing";
import { BATCH_PROCESSING_CONFIG } from "../../utils/constants";

export const fileProcessingSteps = {
  /**
   * Loads repository files from GitHub
   */
  async loadRepositoryFiles(githubUrl: string, githubToken?: string) {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    console.log(`Loaded ${docs.length} files from repository`);
    return docs;
  },

  /**
   * Processes a single file for embeddings
   */
  async processSingleFile(
    doc: any,
    projectId: string
  ): Promise<{ success: boolean; fileName: string; error?: string }> {
    try {
      console.log(`Processing file: ${doc.metadata.source}`);
      
      const summary = await summariseCode(doc);
      if (!summary || summary.trim() === "") {
        console.warn(`Empty summary for ${doc.metadata.source}, skipping`);
        return { success: false, fileName: doc.metadata.source, error: "Empty summary" };
      }
      
      const embedding = await generateEmbedding(summary);
      
      const sourceCodeEmbedding = await sourceCodeDatabase.createEmbedding({
        summary: summary,
        sourceCode: JSON.stringify(doc.pageContent),
        fileName: doc.metadata.source,
        projectId,
      });

      await sourceCodeDatabase.updateEmbedding(sourceCodeEmbedding.id, embedding);
      
      console.log(`✅ Processed: ${doc.metadata.source}`);
      return { success: true, fileName: doc.metadata.source };
    } catch (error) {
      console.error(`❌ Error processing ${doc.metadata.source}:`, error);
      return { 
        success: false, 
        fileName: doc.metadata.source, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Processes a batch of files
   */
  async processFileBatch(
    batch: any[],
    projectId: string,
    batchIndex: number
  ): Promise<{ processed: number; errors: Array<{ fileName: string; error: string }> }> {
    const errors: Array<{ fileName: string; error: string }> = [];
    let processed = 0;

    for (const doc of batch) {
      const result = await this.processSingleFile(doc, projectId);
      
      if (result.success) {
        processed++;
      } else if (result.error) {
        errors.push({ fileName: result.fileName, error: result.error });
      }
    }

    return { processed, errors };
  },

  /**
   * Processes all files in small batches
   */
  async processAllFiles(
    docs: any[],
    projectId: string,
    progressUpdater: (processedCount: number) => Promise<void>
  ): Promise<{ totalProcessed: number; totalErrors: number }> {
    const { smallBatchSize } = BATCH_PROCESSING_CONFIG;
    let totalProcessed = 0;
    let totalErrors = 0;

    await batchProcessingUtils.processFileBatches(
      docs,
      smallBatchSize,
      async (batch, batchIndex) => {
        const result = await this.processFileBatch(batch, projectId, batchIndex);
        totalProcessed += result.processed;
        totalErrors += result.errors.length;
        
        if (result.errors.length > 0) {
          console.warn(`Batch ${batchIndex + 1} had ${result.errors.length} errors:`, result.errors);
        }
      },
      progressUpdater
    );

    return { totalProcessed, totalErrors };
  }
};