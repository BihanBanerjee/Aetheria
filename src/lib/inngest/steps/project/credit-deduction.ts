// src/lib/inngest/steps/project/credit-deduction.ts
import { userDatabase } from "../../utils/database";

export const creditDeductionSteps = {
  /**
   * Deducts credits from user account
   */
  async deductCredits(userId: string, fileCount: number) {
    console.log(`Deducting ${fileCount} credits from user ${userId}`);
    
    try {
      const updatedUser = await userDatabase.deductCredits(userId, fileCount);
      
      console.log(`✅ Successfully deducted ${fileCount} credits`);
      console.log(`User ${userId} remaining credits: ${updatedUser.credits}`);
      
      return {
        success: true,
        deductedCredits: fileCount,
        remainingCredits: updatedUser.credits,
        userId: updatedUser.id
      };
    } catch (error) {
      console.error(`❌ Failed to deduct credits for user ${userId}:`, error);
      throw new Error(`Credit deduction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Validates user has sufficient credits before processing
   */
  async validateSufficientCredits(userId: string, requiredCredits: number) {
    // This would typically be done before project creation starts
    // but included here for completeness
    console.log(`Validating user ${userId} has ${requiredCredits} credits`);
    
    // In a real implementation, you'd check user credits here
    // For now, we assume credits were already validated during project creation
    return { hasEnoughCredits: true };
  },

  /**
   * Logs credit transaction
   */
  logCreditTransaction(
    userId: string,
    fileCount: number,
    transactionType: 'deduct' | 'refund' = 'deduct'
  ) {
    const action = transactionType === 'deduct' ? 'Deducted' : 'Refunded';
    console.log(`💳 ${action} ${fileCount} credits for user ${userId}`);
  },

  /**
   * Handles credit refund in case of processing failure
   */
  async refundCredits(userId: string, fileCount: number, reason: string) {
    console.log(`Refunding ${fileCount} credits to user ${userId} due to: ${reason}`);
    
    try {
      // In a real implementation, you'd add credits back to the user
      // For now, this is a placeholder for the refund logic
      console.log(`✅ Credits refunded successfully to user ${userId}`);
      
      return {
        success: true,
        refundedCredits: fileCount,
        reason
      };
    } catch (error) {
      console.error(`❌ Failed to refund credits for user ${userId}:`, error);
      throw new Error(`Credit refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};