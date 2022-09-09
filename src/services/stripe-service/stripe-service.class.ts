import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import Stripe from 'stripe';
import { generateTransactionId } from '../../utils/utils';

export class StripeService extends Service {
  stripeSettings: any;
  app: Application;
  stripe: Stripe;
  successUrl: string;
  cancelUrl: string; 
  webhookUrl: string;

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
    this.stripeSettings = this.app.get('stripe');
    this.successUrl = this.stripeSettings.successUrl;
    this.cancelUrl = this.stripeSettings.cancelUrl;
    this.webhookUrl = this.stripeSettings.webhookUrl;

    this.stripe = new Stripe(this.stripeSettings.secretKey, {
      apiVersion: '2022-08-01',
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
        session: JSON.stringify(session),
        amount: totalAmount,
        status: 'session_created'
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
    const sig = req.headers['stripe-signature'];
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, this.webhookUrl);
    } catch (err:any) {
      console.log('Error: ', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Fulfill the purchase...
      
    }

    // Return a response to acknowledge receipt of the event
    res.json({received: true});

  };
}
