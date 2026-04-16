const ngrok = require(
  process.env.EXPO_NGROK_PATH ||
    'C:/Users/MSI/AppData/Roaming/npm/node_modules/@expo/ngrok'
);

const port = Number(process.env.PORT || 8787);

async function main() {
  const url = await ngrok.connect({
    addr: port,
    proto: 'http',
  });

  console.log(url);

  const shutdown = async () => {
    try {
      await ngrok.disconnect(url);
      await ngrok.kill();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  setInterval(() => {}, 1 << 30);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
