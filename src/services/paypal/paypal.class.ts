
import { Id, Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { generateTransactionId } from '../../utils/utils';

const paypal = require('paypal-rest-sdk');

export class Paypal extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars

  paypalSettings: any
  app: Application
  returnUrl: string
  cancelUrl: string

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app

    this.paypalSettings = this.app.get('paypal')
    this.returnUrl = this.paypalSettings.returnUrl
    this.cancelUrl = this.paypalSettings.cancelUrl



    paypal.configure({
      'mode': 'sandbox', //sandbox or live
      'client_id': this.paypalSettings.clientId,
      'client_secret': this.paypalSettings.clientSecret
    });
  }

  async create(data: any, params?: any): Promise<any> {

    let currency = data.items[0].currency
    let totalAmount = data.items.reduce((acc: any, item: any) => {
      return acc + item.price
    }, 0)
    let purchaseItems = data.items.map((item: any) => {
      return {
        ...item,
        price: item.price.toString()
      }
    })

    let transactionId = generateTransactionId()
    let invoiceId = "Invoice " + new Date().getTime()


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
    }

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
    }

    let createPayment = (create_payment_json: any) => {
      return new Promise(function (resolve, reject) {
        paypal.payment.create(create_payment_json, function (error: any, payment: any) {
          if (error) {
            reject(error);
          } else {
            resolve(payment);
          }
        })
      })
    }

    let response: any = await createPayment(createPaymentJson)

    if (response.state == "created") {
      let links = response.links;
      for (let i = 0; i < links.length; i++) {
        if (links[i].rel === 'approval_url') {
          newPayPalPayment.paypalUrl = links[i].href
          newPayPalPayment.paymentId = response.id
          console.log("New Paypal URL: ", newPayPalPayment.paypalUrl)
        }
      }

    }

    console.log("PayPal Payment: ", response)
    return super.create(newPayPalPayment)

  }

  async success(req:any, res:any): Promise<any> {

  }
}





export class PaypalCancel extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app
  }

  async find(query: any): Promise<any> {

    console.log("Paynow Resp Cancel: ", query)
  }

}


