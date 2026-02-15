import type { JobResult, JobStatusType } from "../providers/base.js";

export interface Job {
  jobId: string;
  provider: string;
  ticketId: string;
  pid?: number;
  status: JobStatusType;
  startedAt: string;
  completedAt?: string;
  exitCode?: number;
  workingDirectory: string;
  prompt: string;
  stdout: string;
  stderr: string;
}

export type { JobStatusType, JobResult };
