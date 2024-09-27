
import Stripe from 'stripe';
import { generateTransactionId, json, pushToWebhook } from '../utils/utils';
import { PaymentMethods, PaymentStatuses } from '../utils/constants';
import { createTransaction, findTransaction, findTransactionById, updateTransaction } from '../repositories/transaction';
import { StripeTable } from '../types';


export class StripeAPI {
  stripeSettings: any;
  stripe: Stripe;
  successUrl: string;
  cancelUrl: string; 
  webhookUrl: string;
  signingSecret: string;

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor() {
   
    this.successUrl = process.env.STRIPE_SUCCESS_URL as string;
    this.cancelUrl = process.env.STRIPE_CANCEL_URL as string;
    this.webhookUrl = process.env.STRIPE_WEBHOOK_URL as string;
    this.signingSecret = process.env.STRIPE_SIGNING_SECRET as string;

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: process.env.STRIPE_API_VERSION as any,
    });


  }

  createCustomer = async (body:any) => {
    try{
      const customer = await this.stripe.customers.create({
        email: body.email,
        name: `${body.first_name} ${body.last_name}`,
        phone: `${body.country_code} ${body.phone_no}`,
        description: 'User Account Created'
      });

     return {
        status: 'Success',
        message: 'Customer created successfully!',
        data: customer
      }
    }catch(e: any){
      throw new Error(e)
    }
  };

  createPayment = async (body:any) => {

    console.log(body);

    const transactionId = generateTransactionId();
    const invoiceId = 'Invoice ' + new Date().getTime();
    
    if (this.successUrl.length == 0)
      this.successUrl = body.success_url;
    
    if (this.cancelUrl.length  == 0)
      this.cancelUrl = body.cancel_url;

    const items = body.items;
    const lineItems: any[] = [];
    let totalAmount = 0;

    for (const item of items){
      lineItems.push({
        price_data: {
          currency: item.currency,
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      });

      totalAmount += item.price * item.quantity;
    }


    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: this.successUrl,
        cancel_url: this.cancelUrl,
      });

      const newStripePayment = {
        email: body.email,
        phone: body?.phone,
        items: json(lineItems),
        cancel_url: this.cancelUrl,
        success_url: this.successUrl,
        invoice: invoiceId,
        method: 'stripe',
        transaction_id: transactionId,
        session_id: session.id,
        session: json(session),
        amount: totalAmount,
        status: PaymentStatuses.SessionCreated
      };

      await createTransaction(PaymentMethods.Stripe, newStripePayment as any);

      console.log('Stripe Payment: ', newStripePayment);      

      return { 
        status: 'Success',
        message: 'Session created successfully!',
        data: session 
      };

    }catch(e:any){
      throw new Error(e);
    }
  };

  webhooks  = async (headers:any, body: any) => {
    console.log('Webhook Recieved! Processing...');
    const sig = headers['stripe-signature'];
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(body, sig, this.signingSecret);
    } catch (err:any) {
      console.log('Error: ', err);
      throw new Error(err)
    }


    const { sessionId, paymentStatus, status } = this.processEvent(event);

    if (sessionId.length > 0 && paymentStatus.length > 0){
      await this.updateTransaction(sessionId, status);
    }

    return {received: true}

  };

  updateTransaction = async (sessionId:string, paymentStatus:string) => {


    const transaction = await findTransaction({
        session_id: sessionId
      },
      PaymentMethods.Stripe
    );

    

    if (transaction) {
      const id = transaction.id;

      await updateTransaction(id, PaymentMethods.Stripe, {
        status: paymentStatus
      });

      const updatedData = await findTransactionById(id, PaymentMethods.Stripe);

      // Send an update
    //   const webhookUrl = this.app.get('stripe').webhookUrl;

    //   console.log('Pusing data to webhook');
    //   pushToWebhook(
    //     'papapi',
    //     'stripe-status-update',
    //     webhookUrl, updatedData
    //   );


    return updatedData;
        
    }
  };

  private processEvent(event: any) {
    let paymentIntent: any;
    let sessionId = '';
    let status = '';
    let paymentStatus = '';


    switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout Session Completed: ', session);
      // Then define and call a function to handle the event checkout.session.completed
      sessionId = session.id;
      paymentStatus = session.payment_status;

      if (paymentStatus == 'paid') {
        status = paymentStatuses.paid;
      }



      break;
    case 'payment_intent.canceled':
      paymentIntent = event.data.object;
      console.log('Payment Intent Payment Canceled: ', paymentIntent);
      // Then define and call a function to handle the event payment_intent.canceled
      break;
    case 'payment_intent.payment_failed':
      paymentIntent = event.data.object;
      console.log('Payment Intent Payment Failed: ', paymentIntent);
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.succeeded':
      paymentIntent = event.data.object;
      console.log('Payment Intent Succeeded: ', paymentIntent);
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
      // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
    }
    return { sessionId, paymentStatus, status };
  }
}