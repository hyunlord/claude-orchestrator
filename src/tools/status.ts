import { z } from "zod";
import type { JobManager } from "../jobs/manager.js";
import type { ProviderRegistry } from "../providers/index.js";
import { logger } from "../utils/logger.js";

export const agentStatusSchema = {
  job_id: z.string().min(1)
};

interface StatusArgs {
  job_id: string;
}

export async function agentStatusTool(args: StatusArgs, jobManager: JobManager, registry: ProviderRegistry): Promise<{ content: [{ type: "text"; text: string }] }> {
  try {
    const job = jobManager.getJob(args.job_id);
    if (!job) {
      return { content: [{ type: "text", text: JSON.stringify({ error: `Job not found: ${args.job_id}` }) }] };
    }

    const provider = registry.getProviderForJob(job.provider);
    const status = await provider.getStatus(args.job_id);
    const elapsedSeconds = Math.floor((Date.now() - new Date(status.startedAt).getTime()) / 1000);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          job_id: status.jobId,
          provider: status.provider,
          ticket_id: status.ticketId,
          status: status.status,
          elapsed_seconds: elapsedSeconds
        })
      }]
    };
  } catch (error) {
    logger.error("agent_status failed", { error: error instanceof Error ? error.message : String(error) });
    return { content: [{ type: "text", text: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }) }] };
  }
}
