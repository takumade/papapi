
import { Hono } from "hono"
import { Paypal } from "../lib/paypal";

const paypal = new Hono()



paypal.post('/orders', async (c) => {

  try{

    const body = await c.req.json()   
    let pp = new Paypal()
    let response = await pp.createOrder(body)

    return c.json(response)
  }catch(error: any){
    console.log("Error: ", error)
    return c.json({status: false,message: "Cannot process request", error: error.message}, 500)
  }
})

paypal.post('/orders/:order_id/capture', async (c) => {

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

  
export default paypal  