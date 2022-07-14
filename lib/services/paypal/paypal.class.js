"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaypalCancel = exports.PaypalSuccess = exports.Paypal = void 0;
const feathers_sequelize_1 = require("feathers-sequelize");
const utils_1 = require("../../utils/utils");
const paypal = require('paypal-rest-sdk');
class Paypal extends feathers_sequelize_1.Service {
    constructor(options, app) {
        super(options);
        this.app = app;
        this.paypalSettings = this.app.get('paypal');
        this.returnUrl = this.paypalSettings.returnUrl;
        this.cancelUrl = this.paypalSettings.cancelUrl;
        paypal.configure({
            'mode': 'sandbox',
            'client_id': this.paypalSettings.clientId,
            'client_secret': this.paypalSettings.clientSecret
        });
    }
    async create(data, params) {
        let currency = data.items[0].currency;
        let totalAmount = data.items.reduce((acc, item) => {
            return acc + item.price;
        }, 0);
        let purchaseItems = data.items.map((item) => {
            return {
                ...item,
                price: item.price.toString()
            };
        });
        let transactionId = (0, utils_1.generateTransactionId)();
        let invoiceId = "Invoice " + new Date().getTime();
        const createPaymentJson = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": this.returnUrl,
                "cancel_url": this.cancelUrl
            },
            "transactions": [{
                    "item_list": {
                        "items": purchaseItems
                    },
                    "amount": {
                        "currency": currency,
                        "total": totalAmount.toString()
                    },
                    "description": data.description
                }]
        };
        let newPayPalPayment = {
            email: data.email,
            method: "paypal",
            paymentId: "",
            invoice: invoiceId,
            items: JSON.stringify(purchaseItems),
            transactionId: transactionId,
            amount: totalAmount,
            paypalUrl: "",
            currency: currency,
            status: "pending",
        };
        let createPayment = (create_payment_json) => {
            return new Promise(function (resolve, reject) {
                paypal.payment.create(create_payment_json, function (error, payment) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(payment);
                    }
                });
            });
        };
        let response = await createPayment(createPaymentJson);
        if (response.state == "created") {
            let links = response.links;
            for (let i = 0; i < links.length; i++) {
                if (links[i].rel === 'approval_url') {
                    newPayPalPayment.paypalUrl = links[i].href;
                    newPayPalPayment.paymentId = response.id;
                    console.log("New Paypal URL: ", newPayPalPayment.paypalUrl);
                }
            }
        }
        console.log("PayPal Payment: ", response);
        return super.create(newPayPalPayment);
    }
}
exports.Paypal = Paypal;
class PaypalSuccess extends feathers_sequelize_1.Service {
    constructor(options, app) {
        super(options);
        this.app = app;
    }
    async find(params) {
        const { query } = params;
        const payerId = query === null || query === void 0 ? void 0 : query.PayerID;
        const paymentId = query === null || query === void 0 ? void 0 : query.paymentId;
        const sequelize = this.app.get('sequelizeClient');
        const { paypal } = sequelize.models;
        console.log("models: ", sequelize.models);
        let transaction = await paypal.findOne({
            where: {
                paymentId: paymentId
            }
        });
        if (!transaction) {
            throw new Error("Transaction not found");
        }
        const executePaymentJson = {
            "payer_id": payerId,
            "transactions": [{
                    "amount": {
                        "currency": transaction.currency,
                        "total": transaction.amount.toString()
                    }
                }]
        };
        console.log("Execute Payment JSON: ", executePaymentJson);
        console.log("Payment ID: ", paymentId);
        paypal.payment.execute(paymentId, executePaymentJson, function (error, payment) {
            //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
            console.log("Payment: ", payment);
            if (error) {
                console.log(error.response);
                throw error;
            }
            else {
                console.log(JSON.stringify(payment));
            }
        });
        let executePayment = (paymentId, execute_payment_json) => {
            return new Promise(function (resolve, reject) {
                paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                    //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
                    if (error) {
                        console.log(error);
                        reject(error);
                    }
                    else {
                        console.log(JSON.stringify(payment));
                        resolve(payment);
                    }
                });
            });
        };
        let response = await executePayment(paymentId, executePaymentJson);
        if (response) {
            response.transactions.map((t) => console.log(t));
        }
        console.log("Paypal Resp: ", JSON.stringify(response));
        return 5;
    }
}
exports.PaypalSuccess = PaypalSuccess;
class PaypalCancel extends feathers_sequelize_1.Service {
    constructor(options, app) {
        super(options);
        this.app = app;
    }
    async find(query) {
        console.log("Paynow Resp Cancel: ", query);
    }
}
exports.PaypalCancel = PaypalCancel;
