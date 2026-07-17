const { Client } = require('pg');

async function main() {
  const connectionString = "postgresql://neondb_owner:npg_123456789@ep-divine-bar-adpdpd8q.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("✅ Connected to real Neon PostgreSQL database successfully!");

    // Check enum values of ProductCategoryType
    const enumRes = await client.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'ProductCategoryType';
    `);
    console.log("📊 REAL DB Enum labels for ProductCategoryType:", enumRes.rows.map(r => r.enumlabel));

    // Check applied migrations from _prisma_migrations
    const migrationRes = await client.query(`
      SELECT migration_name FROM _prisma_migrations;
    `);
    console.log("📊 REAL DB Applied Migrations:", migrationRes.rows.map(r => r.migration_name));

    // Check products count of categoryType 'SheikhDigital'
    const productRes = await client.query(`
      SELECT count(*) FROM "Product" WHERE "categoryType" = 'SheikhDigital';
    `);
    console.log("📊 REAL DB Digital Products count:", productRes.rows[0].count);

  } catch (error) {
    console.error("❌ Failed to connect or query real database:", error);
  } finally {
    await client.end();
  }
}

main();
