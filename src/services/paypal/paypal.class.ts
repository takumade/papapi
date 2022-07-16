
import { Id, Params } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { PayPalStandard, PaypalOrder } from '../../libraries/paypal-standard';
import logger from '../../logger';
import { generateTransactionId, pushToWebhook } from '../../utils/utils';

export class Paypal extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars

  paypalSettings: any
  app: Application
  returnUrl: string
  cancelUrl: string
  paypal: PayPalStandard

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app

    this.paypalSettings = this.app.get('paypal')
    this.returnUrl = this.paypalSettings.returnUrl
    this.cancelUrl = this.paypalSettings.cancelUrl

    this.paypal = new PayPalStandard(this.paypalSettings.clientId,
      this.paypalSettings.clientSecret,
      this.paypalSettings.mode)
  }


  createOrder = async (req: any, res: any) => {
    try {


      const { items, description, currency, userId, email } = req.body

      let total: number = 0.0

      let finalItems = items.map((item: { price: number; quantity: number; }) => {
        let itemTotal = item.price * item.quantity
        total = total + itemTotal

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
        }
      })

      let newOrder: PaypalOrder = {
        items: finalItems,
        desc: description,
        total: total.toString(),
        currency: currency
      }

      const order = await this.paypal.createOrder(newOrder);

      await super.create({
        orderId: order.id,
        email: email,
        method: 'paypal - standard',
        transactionId: generateTransactionId(),
        invoice: "Invoice " + new Date().getTime(),
        items: JSON.stringify(items),
        amount: total,
        currency: currency,
        description: description,
        status: 'pending'
      })

      res.json(order);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  captureOrder = async (req: any, res: any) => {
    const { orderID } = req.params;
    try {
      const captureData = await this.paypal.capturePayment(orderID);

      const sequelize = this.app.get('sequelizeClient');
      const { paypal } = sequelize.models

      let transaction = await paypal.findOne({
        where: {
          orderId: orderID
        }
      })

      if (transaction) {
        let id = transaction.id
        let status = captureData.status.toLowerCase()
        let response = await paypal.update({
          status: status,
        }, {
          where: {
            id: id
          }
        })

        let updatedData = {
          ...transaction,
          status: status
        }

        let webhookUrl = this.app.get('paynow').webhookUrl

        pushToWebhook(
          "papapi",
          "paypal-status-update",
          webhookUrl, updatedData
        )

        res.json(captureData);
      }


    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }
}







