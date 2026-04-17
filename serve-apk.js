const fs = require('fs');
const http = require('http');
const path = require('path');
const appConfig = require('./app.json');

const port = Number(process.env.PORT || 8787);
const apkPath = process.env.APK_PATH
  ? path.resolve(__dirname, process.env.APK_PATH)
  : path.join(__dirname, 'Bossitive-release.apk');
const apkBaseName = process.env.APK_NAME || path.basename(apkPath, path.extname(apkPath)) || 'Bossitive-build';
const appVersion = appConfig.expo?.version || '1.0.0';
const iconPath = path.join(
  __dirname,
  'app',
  'src',
  'main',
  'res',
  'mipmap-xxxhdpi',
  'ic_launcher.webp'
);

function getBuildStamp(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    '-',
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join('');
}

function formatBytes(bytes) {
  if (!bytes) return '0 MB';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDownloadMeta(stats) {
  const stamp = getBuildStamp(stats.mtime);
  return {
    buildLabel: stamp,
    downloadPath: `/download/${apkBaseName}-${stamp}.apk`,
    filename: `${apkBaseName}-${stamp}.apk`,
  };
}

function renderDownloadPage(req, apkSize, downloadMeta) {
  return `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bossitive APK</title>
    <meta name="description" content="Trang tải Bossitive APK để cài thử trên Android." />
    <style>
      :root {
        color-scheme: light;
        --bg: #fff8fb;
        --panel: rgba(255, 255, 255, 0.92);
        --text: #271d2d;
        --muted: #6d6372;
        --accent: #ff5f8f;
        --accent-strong: #ef3f76;
        --line: rgba(77, 33, 58, 0.12);
        --shadow: 0 24px 60px rgba(184, 72, 112, 0.18);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(255, 144, 180, 0.34), transparent 34%),
          radial-gradient(circle at right center, rgba(255, 207, 123, 0.26), transparent 28%),
          linear-gradient(160deg, #fff7fb 0%, #fff2f0 48%, #fffdfa 100%);
        display: grid;
        place-items: center;
        padding: 24px;
      }

      .shell {
        width: min(100%, 920px);
        background: var(--panel);
        backdrop-filter: blur(18px);
        border: 1px solid var(--line);
        border-radius: 32px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .hero {
        display: grid;
        gap: 28px;
        grid-template-columns: 120px 1fr;
        align-items: center;
        padding: 32px;
      }

      .icon-wrap {
        width: 120px;
        height: 120px;
        border-radius: 30px;
        background: linear-gradient(145deg, #ffffff, #ffe1eb);
        border: 1px solid rgba(255, 95, 143, 0.18);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.9);
        display: grid;
        place-items: center;
      }

      .icon-wrap img {
        width: 88px;
        height: 88px;
        border-radius: 22px;
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 5vw, 3.2rem);
        line-height: 0.96;
        letter-spacing: -0.04em;
      }

      .lede {
        margin: 0;
        color: var(--muted);
        font-size: 1.02rem;
        line-height: 1.65;
        max-width: 54ch;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        padding: 0 32px 32px;
      }

      .card {
        border-radius: 22px;
        padding: 18px;
        background: rgba(255,255,255,0.72);
        border: 1px solid var(--line);
      }

      .label {
        display: block;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--muted);
        margin-bottom: 10px;
      }

      .value {
        font-size: 1.05rem;
        font-weight: 700;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        padding: 0 32px 32px;
      }

      .button {
        appearance: none;
        border: 0;
        border-radius: 999px;
        padding: 15px 22px;
        text-decoration: none;
        font-weight: 700;
        font-size: 0.98rem;
        transition: transform 160ms ease, box-shadow 160ms ease;
      }

      .button:hover { transform: translateY(-1px); }

      .button.primary {
        color: white;
        background: linear-gradient(135deg, var(--accent), var(--accent-strong));
        box-shadow: 0 14px 28px rgba(239, 63, 118, 0.28);
      }

      .button.secondary {
        color: var(--text);
        background: white;
        border: 1px solid var(--line);
      }

      .notes {
        border-top: 1px solid var(--line);
        padding: 26px 32px 34px;
        display: grid;
        gap: 10px;
        color: var(--muted);
      }

      .notes strong { color: var(--text); }

      .mono {
        font-family: Consolas, "SFMono-Regular", Menlo, monospace;
        font-size: 0.92rem;
        word-break: break-all;
      }

      @media (max-width: 720px) {
        .hero {
          grid-template-columns: 1fr;
          text-align: center;
        }

        .icon-wrap { margin: 0 auto; }
        .grid { grid-template-columns: 1fr; }
        .actions { flex-direction: column; }
        .button { text-align: center; }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="icon-wrap">
          <img src="/assets/icon.webp" alt="Bossitive icon" />
        </div>
        <div>
          <h1>Bossitive<br />Android Build</h1>
          <p class="lede">
            Tải bản APK release để cài thử trên Android. Bản này đã được đóng gói sẵn,
            không cần Expo Go và không phụ thuộc việc điện thoại ở cùng Wi-Fi với máy build.
          </p>
        </div>
      </section>

      <section class="grid">
        <article class="card">
          <span class="label">Version</span>
          <span class="value">${appVersion}</span>
        </article>
        <article class="card">
          <span class="label">File Size</span>
          <span class="value">${formatBytes(apkSize)}</span>
        </article>
        <article class="card">
          <span class="label">Platform</span>
          <span class="value">Android APK</span>
        </article>
        <article class="card">
          <span class="label">Build</span>
          <span class="value">${downloadMeta.buildLabel}</span>
        </article>
      </section>

      <section class="actions">
        <a class="button primary" href="${downloadMeta.downloadPath}">Tai APK ngay</a>
        <a class="button secondary" id="direct-download" href="${downloadMeta.downloadPath}">Mo link tai truc tiep</a>
      </section>

      <section class="notes">
        <div><strong>Cai dat:</strong> Neu Android chan, hay bat quyen <em>Install unknown apps</em> cho trinh duyet, Zalo, hoac app chat dang mo link.</div>
        <div><strong>Nang cap ban moi:</strong> Neu may da tung cai ban loi truoc do, hay go app Bossitive cu roi cai lai ban build ${downloadMeta.buildLabel}.</div>
        <div><strong>Khac Wi-Fi:</strong> Chi can dung link public tunnel ben duoi, khong can chung mang noi bo.</div>
        <div><strong>Link tai:</strong></div>
        <div class="mono" id="download-link">${downloadMeta.downloadPath}</div>
      </section>
    </main>
    <script>
      (function () {
        var downloadUrl = window.location.origin + '${downloadMeta.downloadPath}';
        var button = document.getElementById('direct-download');
        var link = document.getElementById('download-link');
        if (button) button.href = downloadUrl;
        if (link) link.textContent = downloadUrl;
      })();
    </script>
  </body>
</html>`;
}

function streamFile(filePath, contentType, res, extraHeaders = {}) {
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      ...extraHeaders,
    });

    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, 'http://localhost');
  const { pathname } = requestUrl;

  if (pathname === '/assets/icon.webp') {
    streamFile(iconPath, 'image/webp', res, {
      'Cache-Control': 'public, max-age=86400',
    });
    return;
  }

  if (pathname === '/') {
    fs.stat(apkPath, (error, stats) => {
      const fallbackStats = { size: 0, mtime: new Date() };
      const effectiveStats = error ? fallbackStats : stats;
      const html = renderDownloadPage(req, effectiveStats.size, getDownloadMeta(effectiveStats));
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      res.end(html);
    });
    return;
  }

  fs.stat(apkPath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File not found');
      return;
    }

    const downloadMeta = getDownloadMeta(stats);
  const isDownloadPath =
      pathname === '/download' ||
      pathname === `/${apkBaseName}.apk` ||
      pathname === '/Bossitive-release.apk' ||
      pathname === downloadMeta.downloadPath;

    if (!isDownloadPath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    streamFile(apkPath, 'application/vnd.android.package-archive', res, {
      'Content-Disposition': `attachment; filename="${downloadMeta.filename}"`,
      'X-Robots-Tag': 'noindex',
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`APK server listening on http://0.0.0.0:${port}`);
});
