# Paynow Configuration

For Paynow look for this object(`config/default.json`):

```json
"paynow": {
    "email": "",
    "integrationId": "",
    "integrationKey": "",
    "returnUrl": "",
    "resultUrl": "",
    "webhookUrl": "",
}
```
Please go an get your keys from Paynow and fill them here.

**Note** Dont leave resultUrl empty, If you do so you wont recieve updates from Paynow. Your resultUrl should be something like this:

`<your-endpoint>/paynow/status-update`

**Note** Dont leave webhookURL empty, If you do so you wont recieve updates