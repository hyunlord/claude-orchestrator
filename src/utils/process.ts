import { spawn, type ChildProcess } from "node:child_process";

export interface SpawnResult {
  child: ChildProcess;
}

export interface SpawnParams {
  command: string;
  args: string[];
  cwd: string;
}

export function spawnDetachedProcess(params: SpawnParams): SpawnResult {
  const child = spawn(params.command, params.args, {
    cwd: params.cwd,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.unref();
  return { child };
}

export function isPidAlive(pid?: number): boolean {
  if (!pid) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
