
import axios from 'axios';
import { createTransaction, findTransaction, updateTransaction } from '../repositories/transaction';
import { generateTransactionId, json } from '../utils/utils';
import { PaymentMethods, PaymentStatuses, PaypalOrder } from '../utils/constants';
import { PayPalAPI } from './paypalAPI';
const base = 'https://api-m.sandbox.paypal.com';

export class Paypal {
    //eslint-disable-next-line @typescript-eslint/no-unused-vars

    paypalSettings: any;
    returnUrl: string;
    cancelUrl: string;
    paypal: PayPalAPI;

    constructor() {

        this.returnUrl = process.env.RETURN_URL as string;
        this.cancelUrl = process.env.CANCEL_URL as string;

        this.paypal = new PayPalAPI(
            process.env.PAYPAL_CLIENT_ID as string,
            process.env.CLIENT_URL as string,
            process.env.PAYPAL_MODE as string);
    }


    createOrder = async (body: any) => {
        try {


            const { items, description, currency, userId, email } = body;

            let total = 0.0;

            const finalItems = items.map((item: { price: number; quantity: number; }) => {
                const itemTotal = item.price * item.quantity;
                total = total + itemTotal;

                return {
                    ...item,
                    price: item.price.toFixed(2).toString(),
                    unit_amount: {
                        value: item.price.toString(),
                        currency_code: currency
                    },
                    amount: {
                        breakdown: {
                            item_total: itemTotal.toFixed(2).toString(),
                        }
                    }
                };
            });

            const newOrder: PaypalOrder = {
                items: finalItems,
                desc: description,
                total: total.toString(),
                currency: currency
            };

            const order = await this.paypal.createOrder(newOrder);

            await createTransaction(
                PaymentMethods.Paypal,
                {
                    order_id: order.id,
                    email: email,
                    method: 'paypal - standard',
                    transaction_id: generateTransactionId(),
                    invoice: 'Invoice ' + new Date().getTime(),

                    // @ts-ignore
                    items: json(items),
                    amount: total,
                    currency: currency,
                    description: description,
                    status: PaymentStatuses.SessionCreated,
                });

            return order
        } catch (err: any) {
            throw new Error(err);
        }
    };

    captureOrder = async (orderID:string) => {
        
        try {
            const captureData = await this.paypal.capturePayment(orderID);


            const transaction = await findTransaction(
                {
                    order_id: orderID
                },
                PaymentMethods.Paypal
            );

            if (transaction) {
                const id = transaction.id;
                const status = captureData.status.toLowerCase();
                await updateTransaction(
                    id,
                    PaymentMethods.Paypal,
                    {
                        status: this.retrievePaynowStatus(status),
                    }
                );

                const updatedData = {
                    ...transaction,
                    status: status
                };

                // TODO: Implement Webhooks

                // pushToWebhook(
                //   'papapi',
                //   'paypal-status-update',
                //   webhookUrl, updatedData
                // );

                return captureData
            }


        } catch (err: any) {
           throw new Error(err);
        }
    };

    retrievePaynowStatus = (status: string) => {
        switch (status) {
            case 'completed':
                return PaymentStatuses.Paid;
            case 'payer_action_required':
                return PaymentStatuses.AwaitingPayment;
            case 'voided':
                return PaymentStatuses.Cancelled;
            default:
                return PaymentStatuses.SessionCreated;
        }
    };
}


