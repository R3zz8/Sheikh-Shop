import 'dotenv/config'
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.MOCK_DB !== 'true') {
  throw new Error(
    "❌ DATABASE_URL environment variable is missing. " +
    "Please configure DATABASE_URL in .env or .env.local, or set MOCK_DB=true for local mock development."
  );
}

const resolvedUrl = databaseUrl || "postgresql://mock_user:mock_password@localhost:5432/mock_db?schema=public";

export default defineConfig({
  datasource: {
    url: resolvedUrl
  },
  migrations: {
    seed: 'tsx prisma/seed.ts'
  }
});
