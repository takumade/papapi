import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import Stripe from stripe

export class StripeService extends Service {
  stripeSettings: any
  app: Application
  stripe: Stripe
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app
    this.stripeSettings = this.app.get('stripe')
    this.stripe = new Stripe(this.stripeSettings.secretKey)
  }

  createCustomer = async (req:any, res: any) => {
    try{
      const customer = await this.stripe.customers.create({
        email: req.body.email,
        name: `${req.body.first_name} ${req.body.last_name}`,
        phone: `${req.body.country_code} ${req.body.phone_no}`,
        description: 'User Account Created'
      })

      res.json({
        status: "Success",
        message: "Customer created successfully!",
        data: customer
      })
    }catch(e: any){
      res.json({
        status: "Error",
        message: e.message,
        data: {
          stacktrace: e.stacktrace
        }
        
      })
    }
  }

  createPayment = async (req:any, res:any) => {
    
    let domain = req.body.domain
    let items = req.body.items
    let lineItems: any[] = []

    for (let item of items){
        lineItems.push({
          price_data: {
              currency: "inr",
              product_data: {
                  name: item.name,
                  images: [item.image],
              },
              unit_amount: item.price * 100,
          },
          quantity: item.quantity,
      })
    }



    const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${domain}/success.html`,
        cancel_url: `${domain}/cancel.html`,
    });

    res.json({ 
      status: "Success",
      message: "Session created successfully!",
      data: session 
    });
  }
}
