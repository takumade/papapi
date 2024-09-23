import * as path from 'path'
import { Pool } from 'pg'
import { promises as fs } from 'fs'
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely'
import { Database } from '../types'

async function migrate(command: 'up' | 'down') {
  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({
          database: 'papapi',
          host: 'localhost',
          user: 'postgres',
          password: "password",
          port: 5432,
          max: 10,
        }),
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, './migrations'),
    }),
  })

  let migrationResult;
  if (command === 'up') {
    migrationResult = await migrator.migrateToLatest()
  } else if (command === 'down') {
    migrationResult = await migrator.migrateDown()
  }

  const error = migrationResult?.error
  const results = migrationResult?.results

  results?.forEach((it: { status: string; migrationName: any }) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

// Parse command-line arguments
const command = process.argv[2] as 'up' | 'down'
if (command !== 'up' && command !== 'down') {
  console.error('Please specify "up" or "down" as the migration command.')
  process.exit(1)
}

migrate(command)