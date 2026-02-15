import { z } from "zod";
import type { ProviderRegistry } from "../providers/index.js";
import { logger } from "../utils/logger.js";

export const dispatchAgentSchema = {
  prompt: z.string().min(1),
  ticket_id: z.string().min(1),
  provider: z.string().optional().default("codex"),
  model: z.string().optional(),
  working_directory: z.string().optional(),
  context_files: z.array(z.string()).optional()
};

interface DispatchArgs {
  prompt: string;
  ticket_id: string;
  provider?: string;
  model?: string;
  working_directory?: string;
  context_files?: string[];
}

export async function dispatchAgentTool(args: DispatchArgs, registry: ProviderRegistry): Promise<{ content: [{ type: "text"; text: string }] }> {
  try {
    const provider = registry.getProvider(args.provider ?? "codex");
    const available = await provider.isAvailable();
    if (!available) {
      return { content: [{ type: "text", text: JSON.stringify({ error: `Provider not available: ${provider.name}` }) }] };
    }

    const result = await provider.dispatch({
      prompt: args.prompt,
      ticketId: args.ticket_id,
      model: args.model,
      workingDirectory: args.working_directory ?? process.cwd(),
      contextFiles: args.context_files
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          job_id: result.jobId,
          provider: result.provider,
          pid: result.pid,
          status: result.status
        })
      }]
    };
  } catch (error) {
    logger.error("dispatch_agent failed", { error: error instanceof Error ? error.message : String(error) });
    return { content: [{ type: "text", text: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }) }] };
  }
}
