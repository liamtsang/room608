import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`projects\` ADD \`scan_effect_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`projects_scan_effect_idx\` ON \`projects\` (\`scan_effect_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`projects_scan_effect_idx\`;`)
  await db.run(sql`ALTER TABLE \`projects\` DROP COLUMN \`scan_effect_id\`;`)
}
