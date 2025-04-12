
import { toast } from "sonner";

/**
 * Generate a summary message for the processing results
 */
export const generateSummaryMessage = (
  processedCount: number,
  successCount: number,
  failureCount: number,
  skippedCount: number,
  results: {id: string, name: string, result: number | string | boolean}[]
) => {
  let summaryMessage = `Processed ${processedCount} items:\n`;
  summaryMessage += `✅ ${successCount} calculations successful\n`;
  summaryMessage += `❌ ${failureCount} calculations failed\n`;
  
  if (skippedCount > 0) {
    summaryMessage += `⚠️ ${skippedCount} items skipped (missing or invalid data)\n`;
  }
  
  // Show some example results
  const exampleCount = Math.min(5, results.length);
  if (exampleCount > 0) {
    summaryMessage += "\nExample results:\n";
    for (let i = 0; i < exampleCount; i++) {
      const result = results[i];
      summaryMessage += `- ${result.name}: ${result.result}\n`;
    }
  }
  
  // Show the results
  toast.success("Board processing complete", {
    description: summaryMessage,
    duration: 10000
  });
};
