import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

const distPath = path.join(__dirname, 'dist');

// Health check endpoint for Cloud Run and load balancers
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Serve static assets from dist if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    maxAge: '1h',
    etag: true,
  }));

  // SPA fallback: any route returns index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send('Application build in progress. Please refresh momentarily.');
  });
}

const server = app.listen(PORT, HOST, () => {
  console.log(`CloudVault server running on http://${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
