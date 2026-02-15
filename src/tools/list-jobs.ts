import { z } from "zod";
import type { JobManager } from "../jobs/manager.js";
import type { JobStatusType } from "../providers/base.js";
import { logger } from "../utils/logger.js";

const statusFilterSchema = z.enum(["queued", "running", "completed", "failed", "killed", "all"]).optional();

export const listJobsSchema = {
  status_filter: statusFilterSchema
};

interface ListJobsArgs {
  status_filter?: JobStatusType | "all";
}

export async function listJobsTool(args: ListJobsArgs, jobManager: JobManager): Promise<{ content: [{ type: "text"; text: string }] }> {
  try {
    const filter = args.status_filter ?? "all";
    const source = filter === "all" ? jobManager.getAllJobs() : jobManager.getJobsByStatus(filter);

    const jobs = source.map((job) => ({
      job_id: job.jobId,
      provider: job.provider,
      ticket_id: job.ticketId,
      status: job.status,
      elapsed_seconds: Math.floor((Date.now() - new Date(job.startedAt).getTime()) / 1000)
    }));

    const summary = {
      running: jobManager.getJobsByStatus("running").length,
      completed: jobManager.getJobsByStatus("completed").length,
      failed: jobManager.getJobsByStatus("failed").length
    };

    return { content: [{ type: "text", text: JSON.stringify({ jobs, summary }) }] };
  } catch (error) {
    logger.error("list_jobs failed", { error: error instanceof Error ? error.message : String(error) });
    return { content: [{ type: "text", text: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }) }] };
  }
}
