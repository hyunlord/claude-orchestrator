import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { JobManager } from "./jobs/manager.js";
import { ProviderRegistry } from "./providers/index.js";
import { collectResultsSchema, collectResultsTool } from "./tools/collect.js";
import { dispatchAgentSchema, dispatchAgentTool } from "./tools/dispatch.js";
import { listJobsSchema, listJobsTool } from "./tools/list-jobs.js";
import { agentStatusSchema, agentStatusTool } from "./tools/status.js";
import { logger } from "./utils/logger.js";

const jobManager = new JobManager();
const registry = new ProviderRegistry(jobManager);

const server = new McpServer({
  name: "claude-orchestrator",
  version: "0.1.0"
});

server.tool("dispatch_agent", dispatchAgentSchema, async (args) => dispatchAgentTool(args, registry));
server.tool("agent_status", agentStatusSchema, async (args) => agentStatusTool(args, jobManager, registry));
server.tool("list_jobs", listJobsSchema, async (args) => listJobsTool(args, jobManager));
server.tool("collect_results", collectResultsSchema, async (args) => collectResultsTool(args, jobManager, registry));

const shutdown = async (): Promise<void> => {
  logger.info("Shutting down server");
  const runningJobs = jobManager.getJobsByStatus("running");
  for (const job of runningJobs) {
    try {
      await registry.getProviderForJob(job.provider).kill(job.jobId);
    } catch (error) {
      logger.warn("Failed to kill job during shutdown", {
        jobId: job.jobId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("claude-orchestrator MCP server connected");
}

void main();
