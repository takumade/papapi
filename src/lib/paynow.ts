import { createTransaction, findTransaction, updateTransaction } from '../repositories/transaction';
import { PaymentMethods, PaymentStatuses, PaynowStatus } from '../utils/constants';
import { generateTransactionId, json, objectHasKeys, pushToWebhook, sleep } from '../utils/utils';
import { Paynow } from "paynow"
import { Context } from 'hono';



export class PaynowLib {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  paynow: any;
  payment: any;

  constructor() {

    // Init Paynow 

    this.paynow = new Paynow(
      process.env.PAYNOW_INTEGRATION_ID as string,
      process.env.PAYNOW_INTEGRATION_KEY as string,
      process.env.PAYNOW_INTEGRATION_RESULT_URL as string,
      process.env.PAYNOW_INTEGRATION_RETURN_URL as string
    );

    this.paynow.email = process.env.PAYNOW_INTEGRATION_EMAIL;
  }



  async create(data: any) {



    console.log('[Create Paynow Payment] Data: ', data);
    console.log('[Create Paynow Payment] Paynow: ', this.paynow);


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


        let retries = 0

        while (retries <= 3) {
          await sleep(4000)

          transaction = await this.paynow.pollTransaction(pollUrl);

          if (transaction.status == "Paid" || transaction.status == "Cancelled") break
          retries++
        }


        const newPaynowPayment = {
          email: data.email,
          phone: data?.phone,
          items: json(data.items),
          result_url: this.paynow.resultUrl,
          invoice: transaction.reference,
          paynow_reference: transaction.paynowReference,
          method: paymentMethod,
          transaction_id: transactionId,
          instructions: instructions,
          amount: totalAmount,
          link_url: linkUrl ? linkUrl : "linkurl.com",
          poll_url: pollUrl,
          status: this.retrievePaynowStatus(transaction.status),
          redirect_url: "redirecturl.com",

        };

        console.log('Paynow Payment: ', newPaynowPayment);

        // @ts-ignore
        let payment = await createTransaction(PaymentMethods.Paynow, newPaynowPayment)

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

  statusUpdate = async (status_data: PaynowStatus) => {
    const statusData = status_data
    if (objectHasKeys(['reference', 'paynowreference', 'pollurl'], statusData)) {

      try {
        console.log('Paynow Data: ', statusData);
        const transaction = await findTransaction(
          {
            invoice: statusData.reference,
            paynow_reference: statusData.paynowreference
          }, PaymentMethods.Paynow
        );

        if (transaction) {
          const id = transaction.id;

          transaction.status = this.retrievePaynowStatus(statusData.status);
          await updateTransaction(id, PaymentMethods.Paynow, { status: transaction.status });

          // Send an update
          const webhookUrl = '' // TODO: Add your webhook url here

          if (webhookUrl.length > 0) {
            pushToWebhook(
              'papapi',
              'paynow-status-update',
              webhookUrl, transaction
            );
          }

          return {
            'status': true,
            'message': 'Status updated successfully',
            // data: updatedData
          }
        } else {
          return {
            'status': false,
            'message': 'Transaction not found'
          }

        }
      } catch (error: any) {
        return {
          'status': false,
          'message': 'There is some error somewhere',
          error: error
        };
      }
    }
    return {
      'status': false,
      'message': 'Please supply these items: reference, paynowreference, pollurl'
    };
  }

  private retrievePaynowStatus(status: string) {
    if (status === 'Paid') {
      status = PaymentStatuses.Paid;
    } else if (status === 'Cancelled') {
      status = PaymentStatuses.Cancelled;
    } else if (status === 'Delivered') {
      status = PaymentStatuses.Delivered;
    } else if (status === 'Awaiting Delivery') {
      status = PaymentStatuses.AwaitingDelivery;
    } else if (status === 'Awaiting Payment') {
      status = PaymentStatuses.AwaitingPayment;
    } else if (status === 'Failed') {
      status = PaymentStatuses.Failed;
    } else if (status === 'Refunded') {
      status = PaymentStatuses.Refunded;
    } else if (status === 'Disputed') {
      status = PaymentStatuses.Disputed;
    } else if (status === 'Sent') {
      status = PaymentStatuses.Sent;
    }
    return status;
  }
}

