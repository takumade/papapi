import axios from 'axios'
import app from "../app";
import logger from '../logger';
const base = "https://api-m.sandbox.paypal.com";

export interface PaypalOrder {
  items: any[]
  total: string
  currency: string
  desc: string
}


export class PayPalStandard {

  clientId: string
  clientSecret: string
  mode: string
  base: string
  headers: any

  constructor(clientId: string, clientSecret: string, mode: string) {

    this.clientId = clientId
    this.clientSecret = clientSecret
    this.mode = mode

    if (this.mode === "sandbox") {
      this.base = "https://api-m.sandbox.paypal.com"
    } else {
      this.base = "https://api-m.paypal.com"
    }

  }

  async checkPayPalAuth() {
    if (this.headers && Object.keys(this.headers).includes("Authorization")) {
      return true
    } else {
      let paypalAccessToken = app.get("paypalAccessToken");

      if (!paypalAccessToken) {
        paypalAccessToken = await this.generateAccessToken();
      }

      this.headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${paypalAccessToken}`,
      }
      return true
    }
  }

  async createOrder(order: PaypalOrder) {
    await this.checkPayPalAuth();
    const url = `${base}/v2/checkout/orders`;

    const data:any = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: order.currency,
            value: order.total,
            breakdown: {
              item_total: { "currency_code":order.currency, "value":order.total },
            }
          },
          description: order.desc,
          items: order.items
        },
      ],
    }

    console.log("Order Data: ", data.purchase_units[0].items)

    try{

    const response = await axios.post(url, data, { headers: this.headers });
    return this.handleResponse(response);
    }catch(error:any){
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    }
  }

  async capturePayment(orderId: any) {
    await this.checkPayPalAuth();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    const response = await axios.post(url, {}, { headers: this.headers });
    return this.handleResponse(response);
  }

  async generateAccessToken() {
    const url = `${base}/v1/oauth2/token`;
    const auth = Buffer.from(this.clientId + ":" + this.clientSecret).toString("base64");
    const data = "grant_type=client_credentials"

    const headers = {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    }

    try {
      const response = await axios.post(url, data, { headers: headers });

      const jsonData: any = await this.handleResponse(response);
      app.set("paypalAccessToken", jsonData.access_token);
      return jsonData.access_token;
    } catch (err) {
      logger.error("Error Generating Access Token: ", err);
    }
  }

  async handleResponse(response: any) {
    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }



}

