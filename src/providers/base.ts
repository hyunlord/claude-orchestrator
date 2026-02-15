export interface DispatchParams {
  prompt: string;
  ticketId: string;
  workingDirectory: string;
  model?: string;
  contextFiles?: string[];
  timeoutSeconds?: number;
}

export interface DispatchResult {
  jobId: string;
  provider: string;
  pid?: number;
  status: "running";
}

export type JobStatusType = "queued" | "running" | "completed" | "failed" | "killed";

export interface JobStatus {
  jobId: string;
  provider: string;
  ticketId: string;
  status: JobStatusType;
  startedAt: string;
  completedAt?: string;
  exitCode?: number;
}

export interface JobResult {
  jobId: string;
  provider: string;
  ticketId: string;
  status: JobStatusType;
  output: string;
  error?: string;
  filesChanged?: string[];
}

export interface AgentProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  dispatch(params: DispatchParams): Promise<DispatchResult>;
  getStatus(jobId: string): Promise<JobStatus>;
  getResult(jobId: string): Promise<JobResult>;
  kill(jobId: string): Promise<void>;
}
