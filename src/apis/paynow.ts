import { Request, Response } from "express";
import { Paynow } from "../classes/paynow";

export const createPayment = async (req: Request, res: Response, context: any) => {
    res.set("Access-Control-Allow-Origin", "*"); 

    let paynow = new Paynow()

    let response = await paynow.create(req.body)

    // Example of modifying headers to override Wasp default CORS middleware.
    res.json(response);
  };


  export const statusUpdate = async (req: Request, res: Response, context: any) => {
    res.set("Access-Control-Allow-Origin", "*"); // Example of modifying headers to override Wasp default CORS middleware.

    let paynow = new Paynow()
    let response = await paynow.statusUpdate(req, res)
    
    // res.json({ msg: `Hello, ${context.user ? "registered user" : "stranger"}!` });
    res.json(response);
  };