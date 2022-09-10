import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import Stripe from 'stripe';
import { generateTransactionId, paymentStatuses, pushToWebhook } from '../../utils/utils';
import logger from '../../logger';

export class StripeService extends Service {
  stripeSettings: any;
  app: Application;
  stripe: Stripe;
  successUrl: string;
  cancelUrl: string; 
  webhookUrl: string;
  signingSecret: string;

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
    this.stripeSettings = this.app.get('stripe');
    this.successUrl = this.stripeSettings.successUrl;
    this.cancelUrl = this.stripeSettings.cancelUrl;
    this.webhookUrl = this.stripeSettings.webhookUrl;
    this.signingSecret = this.stripeSettings.signingSecret;

    this.stripe = new Stripe(this.stripeSettings.secretKey, {
      apiVersion: this.stripeSettings.apiVersion,
    });


  }

  createCustomer = async (req:any, res: any) => {
    try{
      const customer = await this.stripe.customers.create({
        email: req.body.email,
        name: `${req.body.first_name} ${req.body.last_name}`,
        phone: `${req.body.country_code} ${req.body.phone_no}`,
        description: 'User Account Created'
      });

      res.json({
        status: 'Success',
        message: 'Customer created successfully!',
        data: customer
      });
    }catch(e: any){
      res.json({
        status: 'Error',
        message: e.message,
        data: {
          stacktrace: e.stacktrace
        }
        
      });
    }
  };

  createPayment = async (req:any, res:any) => {

    console.log(req.body);

    const transactionId = generateTransactionId();
    const invoiceId = 'Invoice ' + new Date().getTime();
    
    if (this.successUrl.length == 0)
      this.successUrl = req.body.success_url;
    
    if (this.cancelUrl.length  == 0)
      this.cancelUrl = req.body.cancel_url;

    const items = req.body.items;
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
        email: req.body.email,
        phone: req.body?.phone,
        items: JSON.stringify(lineItems),
        cancelUrl: this.cancelUrl,
        successUrl: this.successUrl,
        invoice: invoiceId,
        method: 'stripe',
        transactionId: transactionId,
        sessionId: session.id,
        session: JSON.stringify(session),
        amount: totalAmount,
        status: paymentStatuses.session_created
      };

      await super.create(newStripePayment);

      console.log('Stripe Payment: ', newStripePayment);      

      res.json({ 
        status: 'Success',
        message: 'Session created successfully!',
        data: session 
      });

    }catch(e:any){
      res.json({
        status : 'Error',
        message: e.message,
        data: {
          stacktrace: e.stacktrace
        }
      });
    }
  };

  webhooks  = async (req:any, res:any) => {
    logger.info('Webhook Recieved! Processing...');
    const sig = req.headers['stripe-signature'];
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, this.signingSecret);
    } catch (err:any) {
      console.log('Error: ', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }


    const { sessionId, paymentStatus, status } = this.processEvent(event);

    if (sessionId.length > 0 && paymentStatus.length > 0){
      await this.updateTransaction(sessionId, status);
    }

    res.json({received: true});

  };

  updateTransaction = async (sessionId:string, paymentStatus:string) => {
    const sequelize = this.app.get('sequelizeClient');
    const { stripe_service } = sequelize.models;

    const transaction = await stripe_service.findOne({
      where: {
        sessionId: sessionId
      }
    });

    

    if (transaction) {
      const id = transaction.id;

      await stripe_service.update({
        status: paymentStatus
      }, {
        where: {
          id: id
        }
      });

      const updatedData = await stripe_service.findByPk(id);

      // Send an update
      const webhookUrl = this.app.get('stripe').webhookUrl;

      logger.info('Pusing data to webhook');
      pushToWebhook(
        'papapi',
        'stripe-status-update',
        webhookUrl, updatedData
      );
        
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
      logger.info('Checkout Session Completed: ', session);
      // Then define and call a function to handle the event checkout.session.completed
      sessionId = session.id;
      paymentStatus = session.payment_status;

      if (paymentStatus == 'paid') {
        status = paymentStatuses.paid;
      }



      break;
    case 'payment_intent.canceled':
      paymentIntent = event.data.object;
      logger.info('Payment Intent Payment Canceled: ', paymentIntent);
      // Then define and call a function to handle the event payment_intent.canceled
      break;
    case 'payment_intent.payment_failed':
      paymentIntent = event.data.object;
      logger.info('Payment Intent Payment Failed: ', paymentIntent);
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.succeeded':
      paymentIntent = event.data.object;
      logger.info('Payment Intent Succeeded: ', paymentIntent);
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
      // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
    }
    return { sessionId, paymentStatus, status };
  }
}