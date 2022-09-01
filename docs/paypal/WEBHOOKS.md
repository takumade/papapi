# Recieving webhooks

Webhooks works the same way as Paynow. Everytime the data gets updated in the database, Papapi will sent a `POST` request to the url you mention in the `webhookURL` field in the PayPal settings(`config/default.json`).

You will recieve something like

```json
{
    origin: "papapi",
    type: "paypal-status-update",
    data: data
}
```

Where `data` is the data that was updated in the database.