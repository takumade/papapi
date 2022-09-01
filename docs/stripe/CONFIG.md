# Stripe Configuration

For Stripe look for this object:

```json
"stripe": {
    "publishableKey": "",
    "secretKey": "",
    "successUrl": "",
    "cancelUrl": "",
    "webhookUrl": ""
}
```

Get your publishableKey and secretKey from Stripe(API keys section) and fill them here.


**Note** Dont leave webhookURL empty, If you do so you wont recieve updates
**Note** If you leave `successUrl` and `cancelUrl` you need to supply them  in the `stripe/payment` request as `cancel_url` and `success_url`