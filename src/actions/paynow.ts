import { Paynow } from 'wasp/entities'

import { type CreatePaynowPaymentAction} from 'wasp/server/operations'
 

export const createPayment: CreatePaynowPaymentAction<Paynow>  = async (args: Paynow, context: any) => {
    const paynowEntity=  context.entities.Paynow

    const newPayment = await paynowEntity.create({
        data: args
    })

    return newPayment
}