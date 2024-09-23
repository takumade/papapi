
import { Hono } from "hono"
import { PaynowLib } from "../lib/paynow";
import { PaynowStatus } from "../utils/constants";

const paynow = new Hono()


paynow.post('/create-payment', async (c) => {
  try{
      let paynow = new PaynowLib()
      const body = await c.req.json()
      let response = await paynow.create(body)

      return c.json(response)
  }catch(error: any){
    return c.json({status: false,message: "Cannot process request", error: error.message}, 500)
  }
})

paynow.post('/status-update', async (c) => {

  try{

    const body: PaynowStatus = await c.req.parseBody()   
    let paynow = new PaynowLib()
    let response = await paynow.statusUpdate(body)

    return c.json(response)
  }catch(error: any){
    console.log("Error: ", error)
    return c.json({status: false,message: "Cannot process request", error: error.message}, 500)
  }
})

  
export default paynow  