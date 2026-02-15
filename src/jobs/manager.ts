import { nanoid } from "nanoid";
import type { Job, JobStatusType } from "./types.js";

export class JobManager {
  private readonly jobs: Map<string, Job> = new Map();

  addJob(job: Job): void {
    this.jobs.set(job.jobId, job);
  }

  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  getJobsByStatus(status: JobStatusType): Job[] {
    return [...this.jobs.values()].filter((job) => job.status === status);
  }

  getAllJobs(): Job[] {
    return [...this.jobs.values()];
  }

  updateJob(jobId: string, update: Partial<Job>): void {
    const current = this.jobs.get(jobId);
    if (!current) {
      return;
    }
    this.jobs.set(jobId, { ...current, ...update });
  }

  generateJobId(): string {
    return `job_${nanoid(10)}`;
  }
}
