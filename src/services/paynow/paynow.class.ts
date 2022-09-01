import { Params, Paginated, Id } from '@feathersjs/feathers';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { generateTransactionId, objectHasKeys, pushToWebhook } from '../../utils/utils';
import axios from 'axios';

import { Paynow as PaynowService } from 'paynow';




export class Paynow extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  app: Application;
  paynow: any;
  payment: any;
  paynowSettings: any;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;

    // Init Paynow 
    this.paynowSettings = this.app.get('paynow');
    this.paynow = new PaynowService(
      this.paynowSettings.integrationId, 
      this.paynowSettings.integrationKey,
      this.paynowSettings.resultUrl,
      this.paynowSettings.returnUrl
    );
    
    this.paynow.email = this.paynowSettings.email;
  }

 

  async create(data: any, params: any) {



    console.log('Data: ', data);

    const checkKeys = [
      'email',
      'phone',
      'items'
    ];

    let totalAmount = 0;

    // If a user supplies a custom return url set that one up 
    if (data.returnUrl) {
      this.paynow.returnUrl = data.returnUrl;
    }

    // Check if the proper data is supplied
    if (!objectHasKeys(checkKeys, data)) {
      return {
        status: 'error',
        message: 'Please supply these items: ' + checkKeys.join(', ')
      };
    }

    const transactionId = generateTransactionId();
    const invoiceId = 'Invoice ' + new Date().getTime();


    this.payment = this.paynow.createPayment(invoiceId, data.email);

    // Add items if supplied
    if (data.items.length > 0) {
      data.items.map((item: { name: any; price: any; }) => {
        this.payment.add(item.name, item.price);
        totalAmount += item.price;
      });
    } else {
      return {
        status: 'error',
        message: 'Items should not be empty'
      };
    }

    const paymentMethod = data.phone.startsWith('071') ? 'onemoney' :
      data.phone.startsWith('073') ? 'telecash' : 'ecocash';

    try {
      const response = await this.paynow.sendMobile(this.payment, data.phone, paymentMethod);

      console.log('Reasponse: ', response);



      if (response.success) {
        const instructions = response.instructions;
        const pollUrl = response.pollUrl;
        const linkUrl = response?.linkUrl;
        const status = await this.paynow.pollTransaction(pollUrl);

        console.log('Status: ', status);


        const newPaynowPayment = {
          email: data.email,
          phone: data?.phone,
          items: JSON.stringify(data.items),
          resultUrl: this.paynow.resultUrl,
          invoice: status.reference,
          paynowReference: status.paynowReference,
          method: paymentMethod,
          transactionId: transactionId,
          instructions: instructions,
          amount: totalAmount,
          linkUr: linkUrl,
          pollUrl: pollUrl,
          status: status.status
        };

        console.log('Paynow Payment: ', newPaynowPayment);

        return super.create(newPaynowPayment);
      } else {
        console.log(response.error);
        return {
          status: 'error',
          message: 'Response Error',
          error: response.error
        };
      }
    } catch (error: any) {
      console.log(error);
      return {
        status: 'error',
        message: 'There is some error somewhere',
        error: error
      };
    }
  }

  statusUpdate = async (req:any, res:any) => {
    console.log('Status Update: ', req.body);

    const statusData = req.body;

    if (objectHasKeys(['reference', 'paynowreference', 'pollurl'], statusData)) {

      try {
        console.log('Paynow Data: ', statusData);
        const sequelize = this.app.get('sequelizeClient');
        const { paynow } = sequelize.models;

        const transaction = await paynow.findOne({
          where: {
            paynowReference: statusData.paynowreference,
            invoice: statusData.reference
          }
        });

    

        if (transaction) {
          const id = transaction.id;

          const response = await paynow.update({
            status: statusData.status
          }, {
            where: {
              id: id
            }
          });

          const updatedData = await paynow.findByPk(id);

          // Send an update
          const webhookUrl = this.app.get('paynow').webhookUrl;

          pushToWebhook(
            'papapi',
            'paynow-status-update',
            webhookUrl, updatedData
          );

          

          res.json({
            'status': 'success',
            'message': 'Status updated successfully',
            data: updatedData
          });
        }

        


        
      } catch (error: any) {
        res.json({
          'status': 'error',
          'message': 'The status wasnt updated successfully',
          error: error.message
        });
      }


    }



  };


}


