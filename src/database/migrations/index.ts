import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create 'user' table
  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .execute()

  // Create 'stripe' table
  await db.schema
    .createTable('stripe')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('session_id', 'varchar', (col) => col.notNull())
    .addColumn('transaction_id', 'varchar', (col) => col.notNull())
    .addColumn('invoice', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('phone', 'varchar', (col) => col.notNull())
    .addColumn('method', 'varchar', (col) => col.notNull())
    .addColumn('items', 'varchar', (col) => col.notNull())
    .addColumn('session', 'varchar', (col) => col.notNull())
    .addColumn('amount', 'float8', (col) => col.notNull())
    .addColumn('success_url', 'varchar', (col) => col.notNull())
    .addColumn('cancel_url', 'varchar', (col) => col.notNull())
    .addColumn('status', 'varchar', (col) => col.notNull())
    .execute()

  // Create 'paypal' table
  await db.schema
    .createTable('paypal')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('order_id', 'varchar', (col) => col.notNull())
    .addColumn('transaction_id', 'varchar', (col) => col.notNull())
    .addColumn('invoice', 'varchar', (col) => col.notNull())
    .addColumn('currency', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('method', 'varchar', (col) => col.notNull())
    .addColumn('items', 'varchar', (col) => col.notNull())
    .addColumn('amount', 'float8', (col) => col.notNull())
    .addColumn('status', 'varchar', (col) => col.notNull())
    .execute()

  // Create 'paynow' table
  await db.schema
    .createTable('paynow')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('transaction_id', 'varchar', (col) => col.notNull())
    .addColumn('invoice', 'varchar', (col) => col.notNull())
    .addColumn('paynow_reference', 'varchar', (col) => col.notNull())
    .addColumn('instructions', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('phone', 'varchar', (col) => col.notNull())
    .addColumn('method', 'varchar', (col) => col.notNull())
    .addColumn('items', 'varchar', (col) => col.notNull())
    .addColumn('amount', 'float8', (col) => col.notNull())
    .addColumn('redirect_url', 'varchar', (col) => col.notNull())
    .addColumn('result_url', 'varchar', (col) => col.notNull())
    .addColumn('link_url', 'varchar', (col) => col.notNull())
    .addColumn('poll_url', 'varchar', (col) => col.notNull())
    .addColumn('status', 'varchar', (col) => col.notNull())
    .execute()


}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('paynow').execute()
  await db.schema.dropTable('paypal').execute()
  await db.schema.dropTable('stripe').execute()
  await db.schema.dropTable('user').execute()
}
