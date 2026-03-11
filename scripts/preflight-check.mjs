import 'dotenv/config';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const target = `${baseUrl.replace(/\/$/, '')}/api/users/sign_in`;

async function run() {
  const started = Date.now();
  try {
    const response = await fetch(target, { method: 'GET' });
    const elapsed = Date.now() - started;
    console.log(`preflight_ok url=${target} status=${response.status} latency_ms=${elapsed}`);
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`preflight_failed url=${target} error=${message}`);
    process.exit(1);
  }
}

run();
