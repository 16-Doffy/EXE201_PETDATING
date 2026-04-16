require('child_process').spawn(
  process.execPath,
  [
    'keep-cloudflare-tunnel.js',
    '--name',
    'page',
    '--url',
    `http://127.0.0.1:${process.env.PORT || 8787}`,
    '--check-path',
    '/',
  ],
  {
    cwd: __dirname,
    stdio: 'inherit',
  }
);
