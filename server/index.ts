import { buildApp } from "./app";

const built = await buildApp();

try {
  await built.app.listen({ host: built.config.host, port: built.config.port });
  console.log(`agentdock-daemon listening on http://${built.config.host}:${built.config.port}`);
} catch (error) {
  built.app.log.error(error);
  process.exit(1);
}
