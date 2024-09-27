
import { Hono } from "hono"
import { Paypal } from "../lib/paypal";
import { StripeAPI } from "../lib/stripe";

const stripe = new Hono()

// app.post('/stripe/create-customer', stripeService.createCustomer);
// app.post('/stripe/payment', stripeService.createPayment);
// app.use('/stripe/webhooks', express.raw({type: 'application/json'}), stripeService.webhooks);


stripe.post('/create-customer', async (c) => {
  try{

    const body = await c.req.json()   
    let stripeService = new StripeAPI()
    let response = await stripeService.createCustomer(body)

    return c.json(response)
  }catch(error: any){
    console.log("Error: ", error)
    return c.json({status: false,message: "Cannot process request", error: error.message}, 500)
  }
})


stripe.post('/create-customer', async (c) => {

    try{
  
      const body = await c.req.json()   
      let stripeService = new StripeAPI()
      let response = await stripeService.createCustomer(body)
  
      return c.json(response)
    }catch(error: any){
      console.log("Error: ", error)
      return c.json({status: false,message: "Cannot process request", error: error.message}, 500)
    }
  })

stripe.post('/orders/:order_id/capture', async (c) => {

    try{

      const {order_id} = c.req.param()
  
      let pp = new Paypal()
      let response = await pp.captureOrder(order_id)
  
      return c.json(response)
    }catch(error: any){
      console.log("Error: ", error)
      return c.json({status: false,message: "Cannot process request", error: error.message}, 500)
    }
  })

  
export default stripe  