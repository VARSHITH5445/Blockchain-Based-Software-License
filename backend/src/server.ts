import app from './app';
import { testDbConnection } from './services/prisma';

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('========================================================');
  console.log('  Starting Blockchain Software License Backend Service  ');
  console.log('========================================================');

  // Check database connectivity
  await testDbConnection();

  app.listen(PORT, () => {
    console.log(`✔ Express REST API server running on: http://localhost:${PORT}`);
    console.log(`✔ Health endpoint:                   http://localhost:${PORT}/api/health`);
    console.log(`✔ Public verification endpoint:      http://localhost:${PORT}/api/verify/:licenseId`);
    console.log('========================================================\n');
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
