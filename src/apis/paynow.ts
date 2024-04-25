import { Request, Response } from "express";
import { Paynow } from "../classes/paynow";

export const createPayment = async (req: Request, res: Response, context: any) => {
    res.set("Access-Control-Allow-Origin", "*"); 

    let paynow = new Paynow()

    let response = paynow.create(req.body)

    // Example of modifying headers to override Wasp default CORS middleware.
    res.json({ msg: `Hello, ${context.user ? "registered user" : "stranger"}!` });
  };


  export const statusUpdate = async (req: Request, res: Response, context: any) => {
    res.set("Access-Control-Allow-Origin", "*"); // Example of modifying headers to override Wasp default CORS middleware.
    
    let paynowEntity = await context.entities.Paynow 
    
    res.json({ msg: `Hello, ${context.user ? "registered user" : "stranger"}!` });
  };