
import { db } from '../database'
import { Paynow, Paypal, Stripe } from '../types'
import { PaymentMethods, TableNames } from '../utils/constants'


function getTableName(type: string) {

    if (type == PaymentMethods.Stripe) return TableNames.Stripe
    if (type == PaymentMethods.Paynow) return TableNames.Paynow
    if (type == PaymentMethods.Paypal) return TableNames.Paypal

    return ''
}

export async function findTransactionById(id: number, type: PaymentMethods) {

    let tableName = getTableName(type)

    if (tableName.length > 0)
        // @ts-ignore
        return await db.selectFrom(tableName)
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirst()
}

export async function findTransaction(criteria: Partial<Stripe | Paynow | Paypal>, type:PaymentMethods) {

    let tableName:string = getTableName(type)

    // @ts-ignore
    let query = db.selectFrom(tableName)

    if (criteria.id) {
        query = query.where('id', '=', criteria.id) // Kysely is immutable, you must re-assign!
    }

    return await query.selectAll().execute()
}

export async function updateTransaction(id: number, type: PaymentMethods, updateWith: Paypal | Stripe | Paynow) {
    let tableName:string = getTableName(type)
    // @ts-ignore
    await db.updateTable(tableName)
            .set(updateWith)
            .where('id', '=', id).execute()
}

export async function createTransaction(type:PaymentMethods, transaction: Paypal | Stripe | Paynow) {

    let tableName:string = getTableName(type)

    // @ts-ignore
    return await db.insertInto(tableName)
        .values(transaction)
        .returningAll()
        .executeTakeFirstOrThrow()
}

export async function deleteTransaction(id: number, type: PaymentMethods) {
    let tableName:string = getTableName(type)

    // @ts-ignore
    return await db.deleteFrom(tableName).where('id', '=', id)
        .returningAll()
        .executeTakeFirst()
}