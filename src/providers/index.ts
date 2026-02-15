import type { AgentProvider } from "./base.js";
import { JobManager } from "../jobs/manager.js";
import { CodexProvider } from "./codex.js";
import { ClaudeCliProvider } from "./claude-cli.js";

export class ProviderRegistry {
  private readonly providers: Map<string, AgentProvider>;

  constructor(jobManager: JobManager) {
    const codex = new CodexProvider(jobManager);
    const claudeCli = new ClaudeCliProvider(jobManager);
    this.providers = new Map([
      [codex.name, codex],
      [claudeCli.name, claudeCli]
    ]);
  }

  getProvider(name: string): AgentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Unsupported provider: ${name}`);
    }
    return provider;
  }

  getProviderForJob(providerName: string): AgentProvider {
    return this.getProvider(providerName);
  }

  listProviders(): string[] {
    return [...this.providers.keys()];
  }
}
