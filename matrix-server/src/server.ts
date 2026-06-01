import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { initSocket } from './sockets';
import { startDeadlineJob } from './jobs/deadlines'; 

async function main() {
  await connectDatabase();
  const app = createApp();
  const server = http.createServer(app);

  initSocket(server);
  startDeadlineJob(); 

  server.listen(env.port, () => {
    console.log(`[server] http://localhost:${env.port}`);
    console.log(`[server] mode: ${env.nodeEnv}`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
