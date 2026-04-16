const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

function getArg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index === process.argv.length - 1) {
    return fallback;
  }
  return process.argv[index + 1];
}

const name = getArg('--name', 'page');
const targetUrl = getArg('--url', 'http://127.0.0.1:8787');
const checkPath = getArg('--check-path', '/');
const restartDelayMs = Number(getArg('--restart-delay-ms', '3000'));
const healthIntervalMs = Number(getArg('--health-interval-ms', '45000'));
const healthTimeoutMs = Number(getArg('--health-timeout-ms', '10000'));
const maxHealthFailures = Number(getArg('--max-health-failures', '3'));
const cloudflaredPath =
  process.env.CLOUDFLARED_PATH || path.join(__dirname, 'cloudflared.exe');

const tunnelDir = path.join(__dirname, '.tunnels');
const logPath = path.join(tunnelDir, `${name}.log`);
const statePath = path.join(tunnelDir, `${name}.json`);
const urlPath = path.join(tunnelDir, `${name}.url.txt`);

let child = null;
let shuttingDown = false;
let currentUrl = '';
let healthFailures = 0;
let healthTimer = null;

fs.mkdirSync(tunnelDir, { recursive: true });

function appendLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logPath, line);
  process.stdout.write(line);
}

function writeState(extra = {}) {
  const payload = {
    name,
    targetUrl,
    currentUrl,
    updatedAt: new Date().toISOString(),
    ...extra,
  };

  fs.writeFileSync(statePath, `${JSON.stringify(payload, null, 2)}\n`);

  if (currentUrl) {
    fs.writeFileSync(urlPath, `${currentUrl}\n`);
  }
}

function extractTryCloudflareUrl(text) {
  const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  return match ? match[0] : '';
}

function stopHealthcheck() {
  if (healthTimer) {
    clearInterval(healthTimer);
    healthTimer = null;
  }
}

function startHealthcheck() {
  stopHealthcheck();

  healthTimer = setInterval(() => {
    if (!currentUrl || !child || child.exitCode !== null) {
      return;
    }

    const request = https.get(`${currentUrl}${checkPath}`, { timeout: healthTimeoutMs }, (response) => {
      response.resume();

      if (response.statusCode && response.statusCode < 500) {
        healthFailures = 0;
        return;
      }

      healthFailures += 1;
      appendLog(`Healthcheck warning (${healthFailures}/${maxHealthFailures}): status ${response.statusCode || 'unknown'}`);

      if (healthFailures >= maxHealthFailures) {
        appendLog('Healthcheck failed too many times. Restarting quick tunnel.');
        child.kill();
      }
    });

    request.on('timeout', () => {
      request.destroy(new Error('timeout'));
    });

    request.on('error', (error) => {
      healthFailures += 1;
      appendLog(`Healthcheck error (${healthFailures}/${maxHealthFailures}): ${error.message}`);

      if (healthFailures >= maxHealthFailures && child) {
        appendLog('Healthcheck could not reach tunnel. Restarting quick tunnel.');
        child.kill();
      }
    });
  }, healthIntervalMs);
}

function attachOutput(stream, label) {
  stream.on('data', (chunk) => {
    const text = chunk.toString();
    appendLog(`${label}: ${text.trimEnd()}`);

    const nextUrl = extractTryCloudflareUrl(text);
    if (nextUrl && nextUrl !== currentUrl) {
      currentUrl = nextUrl;
      healthFailures = 0;
      writeState({ status: 'online' });
      appendLog(`Quick tunnel ready: ${currentUrl}`);
      startHealthcheck();
    }
  });
}

function startTunnel() {
  if (shuttingDown) {
    return;
  }

  if (!fs.existsSync(cloudflaredPath)) {
    appendLog(`cloudflared not found at ${cloudflaredPath}`);
    process.exit(1);
  }

  currentUrl = '';
  healthFailures = 0;
  writeState({ status: 'starting' });

  appendLog(`Starting trycloudflare tunnel for ${name} -> ${targetUrl}`);

  child = spawn(
    cloudflaredPath,
    ['tunnel', '--url', targetUrl, '--protocol', 'quic'],
    {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    }
  );

  attachOutput(child.stdout, 'stdout');
  attachOutput(child.stderr, 'stderr');

  child.on('exit', (code, signal) => {
    appendLog(`Tunnel process exited with code=${code ?? 'null'} signal=${signal ?? 'null'}`);
    stopHealthcheck();
    writeState({ status: 'offline', lastExitCode: code, lastSignal: signal });
    child = null;

    if (!shuttingDown) {
      appendLog(`Restarting tunnel in ${restartDelayMs}ms...`);
      setTimeout(startTunnel, restartDelayMs);
    }
  });
}

function shutdown() {
  shuttingDown = true;
  stopHealthcheck();
  writeState({ status: 'stopping' });

  if (child) {
    child.kill();
  }

  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startTunnel();
