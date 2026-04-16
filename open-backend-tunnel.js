require('child_process').spawn(
  process.execPath,
  [
    'keep-cloudflare-tunnel.js',
    '--name',
    'backend',
    '--url',
    `http://127.0.0.1:${process.env.BACKEND_PORT || 4000}`,
    '--check-path',
    '/health',
  ],
  {
    cwd: __dirname,
    stdio: 'inherit',
  }
);
