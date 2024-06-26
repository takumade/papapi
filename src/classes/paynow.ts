import { Paynow as PaynowService } from 'paynow';
import { _Paynow } from 'wasp/server/_types';
import { generateTransactionId, objectHasKeys, paymentStatuses, pushToWebhook } from '../utils/utils';
import { createPaynowPaymentAction } from 'wasp/server/operations';
import { sleep } from 'wasp/server/utils';




export class Paynow {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  paynow: any;
  payment: any;

  constructor() {

    // Init Paynow 
    this.paynow = new PaynowService(
      process.env.PAYNOW_INTEGRATION_ID as string, 
      process.env.PAYNOW_INTEGRATION_KEY as string, 
      process.env.PAYNOW_INTEGRATION_RESULT_URL as string,
      process.env.PAYNOW_INTEGRATION_RETURN_URL as string
    );
    
    this.paynow.email = process.env.PAYNOW_INTEGRATION_EMAIL;
  }

 

  async create(data: any) {



    console.log('Data: ', data);

    const checkKeys = [
      'email',
      'phone',
      'items'
    ];

    let totalAmount = 0;

    // If a user supplies a custom return url set that one up 
    if (data.return_url) {
      this.paynow.returnUrl = data.return_url;
    }

    // Check if the proper data is supplied
    if (!objectHasKeys(checkKeys, data)) {
      return {
        success: false,
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
        success: false,
        message: 'Items should not be empty'
      };
    }

    const paymentMethod = data.phone.startsWith('071') ? 'onemoney' :
      data.phone.startsWith('073') ? 'telecash' : 'ecocash';

    try {
      const response = await this.paynow.sendMobile(this.payment, data.phone, paymentMethod);

      console.log("Response: ", response)


      if (response.success) {
        const instructions = response.instructions;
        const pollUrl = response.pollUrl;
        const linkUrl = response?.linkUrl;
        let transaction = await this.paynow.pollTransaction(pollUrl);
        // let retries = 0

        // while (retries <= 3){
        //   await sleep(4000)

        //   transaction = await this.paynow.pollTransaction(pollUrl);

        //   if (transaction.status == "Paid" || transaction.status == "Cancelled") break          
        //   retries++
        // }

        // if (transaction.status == "Paid"){
        //   // Paid
        // }else{ 
        //   // Nope
        // }



        const newPaynowPayment = {
          email: data.email,
          phone: data?.phone,
          items: JSON.stringify(data.items),
          resultUrl: this.paynow.resultUrl,
          invoice: transaction.reference,
          paynowReference: transaction.paynowReference,
          method: paymentMethod,
          transactionId: transactionId,
          instructions: instructions,
          amount: totalAmount,
          linkUrl: linkUrl ? linkUrl : "linkurl.com",
          pollUrl: pollUrl,
          status: this.retrievePaynowStatus(transaction.status),
          redirectUrl: "redirecturl.com",

        };

        console.log('Paynow Payment: ', newPaynowPayment);

        // @ts-ignore
        let payment = await createPaynowPaymentAction(newPaynowPayment)

        return {
          success: true,
          message: 'Payment created successfully',
          data: {
            ...payment
          }
        }
      } else {
        console.log(response.error);
        return {
          success: false,
          message: 'Response Error',
          error: response.error
        };
      }
    } catch (error: any) {
      console.log(error);
      return {
        success: false,
        message: 'There is some error somewhere',
        error: error
      };
    }
  }

  statusUpdate = async (req:any, res:any) => {

    console.log('Chips');
    

    const statusData = req.body;

    if (objectHasKeys(['reference', 'paynowreference', 'pollurl'], statusData)) {

      try {
        console.log('Paynow Data: ', statusData);


        // const transaction = await paynow.findOne({
        //   where: {
        //     paynowReference: statusData.paynowreference,
        //     invoice: statusData.reference
        //   }
        // });

    

        // if (transaction) {
        //   const id = transaction.id;

        //   const status:string  = this.retrievePaynowStatus(statusData.status);

        //   const response = await paynow.update({
        //     status: status
        //   }, {
        //     where: {
        //       id: id
        //     }
        //   });

        //   const updatedData = await paynow.findByPk(id);

        //   // Send an update
        //   const webhookUrl = this.app.get('paynow').webhookUrl;

        //   pushToWebhook(
        //     'papapi',
        //     'paynow-status-update',
        //     webhookUrl, updatedData
        //   );

        //   if (res == null){
        //     return updatedData;
        //   }

          

          res.json({
            'status': 'success',
            'message': 'Status updated successfully',
            // data: updatedData
          });
        }catch (error: any) {
        if (res == null){
          return {
            success: false,
            message: 'There is some error somewhere',
            error: error
          };
        }

        res.json({
          'status': 'error',
          'message': 'The status wasnt updated successfully',
          error: error.message
        });
      }
    }
  };

  private retrievePaynowStatus(status: string) {
    if (status === 'Paid') {
      status = paymentStatuses.paid;
    } else if (status === 'Cancelled') {
      status = paymentStatuses.cancelled;
    } else if (status === 'Delivered') {
      status = paymentStatuses.delivered;
    } else if (status === 'Awaiting Delivery') {
      status = paymentStatuses.awaitingDelivery;
    } else if (status === 'Awaiting Payment') {
      status = paymentStatuses.awaitingPayment;
    } else if (status === 'Failed') {
      status = paymentStatuses.failed;
    } else if (status === 'Refunded') {
      status = paymentStatuses.refunded;
    } else if (status === 'Disputed') {
      status = paymentStatuses.disputed;
    } 
    return status;
  }
}


