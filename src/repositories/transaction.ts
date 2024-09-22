
import { db } from '../database'
import { Paynow, Paypal, Stripe } from '../types'


function getTableName(type: string) {
    let tableName = ''
    if (type == "stripe")
        tableName = "stripe"
    else if (type == "paynow")
        tableName = "paynow"
    else if (type == "paypal")
        tableName = "paypal"

    return tableName
}

export async function findTransactionById(id: number, type: string) {

    let tableName = getTableName(type)

    if (tableName.length > 0)
        return await db.selectFrom('stripe')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst()
}

export async function findTransaction(criteria: Partial<Stripe | Paynow | Paypal>, type:string) {

    let tableName:string = getTableName(type)

    // @ts-ignore
    let query = db.selectFrom(tableName)

    if (criteria.id) {
        query = query.where('id', '=', criteria.id) // Kysely is immutable, you must re-assign!
    }

    return await query.selectAll().execute()
}

export async function updateTransaction(id: number, type: string, updateWith: Paypal | Stripe | Paynow) {
    let tableName:string = getTableName(type)
    // @ts-ignore
    await db.updateTable(tableName)
            .set(updateWith)
            .where('id', '=', id).execute()
}

export async function createTransaction(type:string, transaction: Paypal | Stripe | Paynow) {

    let tableName:string = getTableName(type)

    // @ts-ignore
    return await db.insertInto(tableName)
        .values(transaction)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function deleteTransaction(id: number, type: string) {
    let tableName:string = getTableName(type)

    // @ts-ignore
    return await db.deleteFrom(tableName).where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
}