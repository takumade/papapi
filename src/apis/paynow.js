import { Paynow as PaynowService } from 'paynow';

export const createPayment = async (req, res, context) => {
    res.set("Access-Control-Allow-Origin", "*"); 

    let paynow = new PaynowService(
        this.paynowSettings.integrationId, 
        this.paynowSettings.integrationKey,
        this.paynowSettings.resultUrl,
        this.paynowSettings.returnUrl
      )
    
    let paynowEntity = await context.entities.Paynow 
    // Example of modifying headers to override Wasp default CORS middleware.
    res.json({ msg: `Hello, ${context.user ? "registered user" : "stranger"}!` });
  };


  export const statusUpdate = async (req, res, context) => {
    res.set("Access-Control-Allow-Origin", "*"); // Example of modifying headers to override Wasp default CORS middleware.
    
    let paynowEntity = await context.entities.Paynow 
    
    res.json({ msg: `Hello, ${context.user ? "registered user" : "stranger"}!` });
  };