import 'dotenv/config'
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL || "postgresql://mock_user:mock_password@localhost:5432/mock_db?schema=public";

export default defineConfig({
  datasource: {
    url: databaseUrl
  },
  migrations: {
    seed: 'tsx prisma/seed.ts'
  }
});
