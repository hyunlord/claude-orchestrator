import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { AgentProvider, DispatchParams, DispatchResult, JobResult, JobStatus } from "./base.js";
import { JobManager } from "../jobs/manager.js";
import { isPidAlive, spawnDetachedProcess } from "../utils/process.js";
import { logger } from "../utils/logger.js";

const execFileAsync = promisify(execFile);

export class ClaudeCliProvider implements AgentProvider {
  readonly name = "claude-cli";

  constructor(private readonly jobManager: JobManager) {}

  async isAvailable(): Promise<boolean> {
    try {
      await execFileAsync("which", ["claude"]);
      return true;
    } catch {
      return false;
    }
  }

  async dispatch(params: DispatchParams): Promise<DispatchResult> {
    const jobId = this.jobManager.generateJobId();
    const args = [
      "-p",
      this.buildPrompt(params),
      "--allowedTools",
      "Write,Read,Edit,Bash,Glob,Grep"
    ];

    const { child } = spawnDetachedProcess({
      command: "claude",
      args,
      cwd: params.workingDirectory
    });

    this.jobManager.addJob({
      jobId,
      provider: this.name,
      ticketId: params.ticketId,
      pid: child.pid,
      status: "running",
      startedAt: new Date().toISOString(),
      workingDirectory: params.workingDirectory,
      prompt: params.prompt,
      stdout: "",
      stderr: ""
    });

    child.stdout?.on("data", (chunk: Buffer) => {
      const job = this.jobManager.getJob(jobId);
      if (job) {
        this.jobManager.updateJob(jobId, { stdout: job.stdout + chunk.toString("utf8") });
      }
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      const job = this.jobManager.getJob(jobId);
      if (job) {
        this.jobManager.updateJob(jobId, { stderr: job.stderr + chunk.toString("utf8") });
      }
    });

    child.on("close", (code) => {
      const status = code === 0 ? "completed" : "failed";
      this.jobManager.updateJob(jobId, {
        status,
        exitCode: code ?? undefined,
        completedAt: new Date().toISOString()
      });
      logger.info("Claude CLI job closed", { jobId, code: code ?? -1, status });
    });

    return { jobId, provider: this.name, pid: child.pid, status: "running" };
  }

  async getStatus(jobId: string): Promise<JobStatus> {
    const job = this.mustGetJob(jobId);
    const isRunning = job.status === "running" && isPidAlive(job.pid);
    if (!isRunning && job.status === "running") {
      this.jobManager.updateJob(jobId, { status: "failed", completedAt: new Date().toISOString() });
    }
    const latest = this.mustGetJob(jobId);
    return {
      jobId: latest.jobId,
      provider: latest.provider,
      ticketId: latest.ticketId,
      status: latest.status,
      startedAt: latest.startedAt,
      completedAt: latest.completedAt,
      exitCode: latest.exitCode
    };
  }

  async getResult(jobId: string): Promise<JobResult> {
    const job = this.mustGetJob(jobId);
    const filesChanged = await this.getFilesChanged(job.workingDirectory);
    return {
      jobId: job.jobId,
      provider: job.provider,
      ticketId: job.ticketId,
      status: job.status,
      output: job.stdout,
      error: job.stderr || undefined,
      filesChanged
    };
  }

  async kill(jobId: string): Promise<void> {
    const job = this.mustGetJob(jobId);
    if (job.pid && isPidAlive(job.pid)) {
      process.kill(job.pid, "SIGTERM");
    }
    this.jobManager.updateJob(jobId, { status: "killed", completedAt: new Date().toISOString() });
  }

  private mustGetJob(jobId: string) {
    const job = this.jobManager.getJob(jobId);
    if (!job || job.provider !== this.name) {
      throw new Error(`Job not found for provider '${this.name}': ${jobId}`);
    }
    return job;
  }

  private async getFilesChanged(cwd: string): Promise<string[]> {
    try {
      const { stdout } = await execFileAsync("git", ["diff", "--name-only"], { cwd });
      return stdout.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
    } catch {
      return [];
    }
  }

  private buildPrompt(params: DispatchParams): string {
    if (!params.contextFiles || params.contextFiles.length === 0) {
      return params.prompt;
    }
    const context = params.contextFiles.join(", ");
    return `Read these files first: ${context}\n\n${params.prompt}`;
  }
}
