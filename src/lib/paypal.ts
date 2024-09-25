
import axios from 'axios';
import { createTransaction, findTransaction, updateTransaction } from '../repositories/transaction';
import { generateTransactionId, json } from '../utils/utils';
import { PaymentMethods, PaymentStatuses, PaypalOrder } from '../utils/constants';
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


    createOrder = async (req: any, res: any) => {
        try {


            const { items, description, currency, userId, email } = req.body;

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

            res.json(order);
        } catch (err: any) {
            res.status(500).send(err.message);
        }
    };

    captureOrder = async (req: any, res: any) => {
        const { orderID } = req.params;
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

                res.json(captureData);
            }


        } catch (err: any) {
            res.status(500).send(err.message);
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


class PayPalAPI {

    clientId: string;
    clientSecret: string;
    mode: string;
    base: string;
    headers: any;

    constructor(clientId: string, clientSecret: string, mode: string) {

        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.mode = mode;

        if (this.mode === 'sandbox') {
            this.base = 'https://api-m.sandbox.paypal.com';
        } else {
            this.base = 'https://api-m.paypal.com';
        }

    }

    async checkPayPalAuth() {
        if (this.headers && Object.keys(this.headers).includes('Authorization')) {
            return true;
        } else {
            let paypalAccessToken = await this.generateAccessToken();

            this.headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${paypalAccessToken}`,
            };
            return true;
        }
    }

    async createOrder(order: PaypalOrder) {
        await this.checkPayPalAuth();
        const url = `${base}/v2/checkout/orders`;

        const data: any = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: order.currency,
                        value: order.total,
                        breakdown: {
                            item_total: { 'currency_code': order.currency, 'value': order.total },
                        }
                    },
                    description: order.desc,
                    items: order.items
                },
            ],
        };

        console.log('Order Data: ', data.purchase_units[0].items);

        try {

            const response = await axios.post(url, data, { headers: this.headers });
            return this.handleResponse(response);
        } catch (error: any) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }
    }

    async capturePayment(orderId: any) {
        await this.checkPayPalAuth();
        const url = `${base}/v2/checkout/orders/${orderId}/capture`;
        const response = await axios.post(url, {}, { headers: this.headers });
        return this.handleResponse(response);
    }

    async generateAccessToken() {
        const url = `${base}/v1/oauth2/token`;
        const auth = Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64');
        const data = 'grant_type=client_credentials';

        const headers = {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        try {
            const response = await axios.post(url, data, { headers: headers });

            const jsonData: any = await this.handleResponse(response);

            return jsonData.access_token;
        } catch (err) {
            console.log('Error Generating Access Token: ', err);
        }
    }

    async handleResponse(response: any) {
        if (response.status === 200 || response.status === 201) {
            return response.data;
        }

        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }



}
