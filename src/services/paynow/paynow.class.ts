import { Params, Paginated } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { objectHasKeys } from '../../utils/utils';

const { Paynow: PaynowService } = require("paynow");




export class Paynow extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application
  paynow: any
  payment: any
  paynowSettings: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app

    // Init Paynow 
    this.paynowSettings = this.app.get('paynow')
    this.paynow = new PaynowService(this.paynowSettings.integrationId, this.paynowSettings.integrationKey);

    this.paynow.resultUrl = this.paynowSettings.resultUrl
    this.paynow.returnUrl = this.paynowSettings.returnUrl
  }

  async find(params?: any) {
    return []
  }

  async create(data: any, params: any) {

    let checkKeys = [
      'email',
      'phone',
      ''
    ]

    let totalAmount = 0

    // If a user supplies a custom return url set that one up 
    if (data.returnUrl) {
      this.paynow.returnUrl = data.returnUrl
    }

    // Check if the proper data is supplied
    if (!objectHasKeys(checkKeys, data)){
      return {
        status: "error",
        message: "Please supply these items: " + checkKeys.join(", ")
      }
    }

    let invoiceId = "Invoice " + new Date().getTime()


    this.payment = this.paynow.createPayment(invoiceId, data.email)

    // Add items if supplied
    if (data.items.length > 0) {
      data.items.map((item: { name: any; price: any; }) => {
        this.payment.add(item.name, item.price)
        totalAmount += item.price
      })
    } else {
        return {
          status: "error",
          message: "Items should not be empty"
        }
    }

    let paymentMethod = data.phone.startsWith("071") ? "onemoney" :
                        data.phone.startsWith("073") ? "telecash" : "ecocash" 
    
    try{
      let response = await this.paynow.sendMobile(this.payment, data.phone, paymentMethod)



      if(response.success) {
          let instructions = response.instructions
          let pollUrl = response.pollUrl; 
          let status = this.paynow.pollTransaction(pollUrl);


          let newPaynowPayment = {
            items: JSON.stringify(data.items),
            returnUrl: this.paynow.returnUrl,
            invoice: invoiceId,
            method: paymentMethod,
            instructions: instructions,
            amount: totalAmount,
            pollUrl: pollUrl,
            status: status.paid() ? "paid" : "pending"
          }

          // save data
          super.create(newPaynowPayment)

          return {
            status: "success",
            message: "Payment successfully created",
            data: newPaynowPayment
          }
      } else {
          console.log(response.error)
          return {
            status: "error",
            message: "Response Error",
            error: response.error
          }
      }
    }catch(error: any ){
      return {
        status: "error",
        message: "There is some error somewhere",
        error: error
      }
    }    
  }

}
