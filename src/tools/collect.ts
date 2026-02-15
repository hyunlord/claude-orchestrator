import { z } from "zod";
import type { JobManager } from "../jobs/manager.js";
import type { ProviderRegistry } from "../providers/index.js";
import { logger } from "../utils/logger.js";

export const collectResultsSchema = {
  job_ids: z.array(z.string()).optional()
};

interface CollectArgs {
  job_ids?: string[];
}

export async function collectResultsTool(args: CollectArgs, jobManager: JobManager, registry: ProviderRegistry): Promise<{ content: [{ type: "text"; text: string }] }> {
  try {
    const jobs = args.job_ids
      ? args.job_ids.map((id) => jobManager.getJob(id)).filter((job): job is NonNullable<typeof job> => Boolean(job))
      : jobManager.getJobsByStatus("completed");

    const results = [];
    for (const job of jobs) {
      const provider = registry.getProviderForJob(job.provider);
      const result = await provider.getResult(job.jobId);
      results.push({
        job_id: result.jobId,
        provider: result.provider,
        ticket_id: result.ticketId,
        status: result.status,
        output: result.output,
        files_changed: result.filesChanged ?? []
      });
    }

    return { content: [{ type: "text", text: JSON.stringify({ results }) }] };
  } catch (error) {
    logger.error("collect_results failed", { error: error instanceof Error ? error.message : String(error) });
    return { content: [{ type: "text", text: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }) }] };
  }
}
