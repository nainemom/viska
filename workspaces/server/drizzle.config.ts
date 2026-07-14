import { defineConfig } from 'drizzle-kit';

// Used by `drizzle-kit generate` to produce SQL migrations from src/schema.ts.
// Migrations are applied at runtime by initDb() (see src/db.ts), not by the CLI.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ?? 'postgres://viska:viska@localhost:5432/viska',
  },
});
