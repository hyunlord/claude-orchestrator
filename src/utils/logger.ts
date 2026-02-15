type Meta = Record<string, string | number | boolean | undefined>;

function write(level: "INFO" | "WARN" | "ERROR", message: string, meta?: Meta): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ?? {})
  };
  process.stderr.write(`${JSON.stringify(payload)}\n`);
}

export const logger = {
  info(message: string, meta?: Meta): void {
    write("INFO", message, meta);
  },
  warn(message: string, meta?: Meta): void {
    write("WARN", message, meta);
  },
  error(message: string, meta?: Meta): void {
    write("ERROR", message, meta);
  }
};
