import fetch, { Response } from "node-fetch";
const base = "https://api-m.sandbox.paypal.com";


export default class PayPalStandard {

    clientId: string
    clientSecret: string
    mode: string
    base: string

    constructor(clientId: string, clientSecret: string, mode: string){

        this.clientId = clientId
        this.clientSecret = clientSecret
        this.mode = mode

        if(this.mode === "sandbox"){
            this.base = "https://api-m.sandbox.paypal.com"
        }else{
            this.base = "https://api-m.paypal.com"
        }

    }

    async createOrder() {
        const accessToken = await this.generateAccessToken();
        const url = `${base}/v2/checkout/orders`;
        const response = await fetch(url, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: "USD",
                  value: "100.00",
                },
              },
            ],
          }),
        });
      
        return this.handleResponse(response);
      }
      
      async capturePayment(orderId: any) {
        const accessToken = await this.generateAccessToken();
        const url = `${base}/v2/checkout/orders/${orderId}/capture`;
        const response = await fetch(url, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      
        return this.handleResponse(response);
      }
      
      async generateAccessToken() {
        const auth = Buffer.from(this.clientId + ":" + this.clientSecret).toString("base64");
        const response = await fetch(`${base}/v1/oauth2/token`, {
          method: "post",
          body: "grant_type=client_credentials",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        });
      
        const jsonData: any = await this.handleResponse(response);
        return jsonData.access_token;
      }
      
      async handleResponse(response: Response) {
        if (response.status === 200 || response.status === 201) {
          return response.json();
        }
      
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }



}

