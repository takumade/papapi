# Recieving Payments

To create a payment send a POST to `/paynow` with the following data

```json
{
	"email": "<client email>",
	"phone": "<client-phone>",
	"items": [
		{
			"name": "sadza",
			"price": 2.02
		},
		{
			"name": "rice",
			"price": 1.05
		}
	]
}

```

You will get something like this

```json
{
	"id": 23,
	"email": "<client email>",
	"items": "[{\"name\":\"sadza\",\"price\":2.02},{\"name\":\"rice\",\"price\":1.05}]",
	"resultUrl": "<result url>",
	"invoice": "<invoice-id>",
	"paynowReference": "14759100",
	"method": "ecocash",
	"transactionId": "TRX-1657480260658-31e0e07da354d483",
	"instructions": "Dial *151*2*4# and enter your EcoCash PIN. Once you have authorized the payment via your handset, please click Check For Payment below to conclude this transaction",
	"amount": 3.07,
	"pollUrl": "<poll url>",
	"status": "Sent",
	"updatedAt": "2022-07-10T19:11:01.521Z",
	"createdAt": "2022-07-10T19:11:01.521Z"
}
```