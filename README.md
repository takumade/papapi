# Papapi

Papapi is a simple, fast, and powerful microservice for Paynow, PayPal and Stripe payments.

# Supported payment methods
1. Paynow ✅
2. PayPal ❌
3. Stripe ❌

# Tech Stack
1. Feathers JS (https://docs.feathersjs.com/)
2. Sequelize (https://sequelize.org/)
3. MariaDB

# Architecture
Papapi uses a layered architecture

API ----> Services (Paypal, Stripe, Paynow) ----> Database 

Diagram coming soon

# Installation

1. Clone it

```bash
$ git clone https://github.com/takumade/papapi
```

2. Install dependencies

```bash
$ cd papapi
$ npm install
```
**Note:** You can use yarn or the new bun. If something breaks with the bun, you are on your own.

3. Config your environment variables in `config/default.json` and `config/production.json`

4. Run the server

```bash
$ npm run start
```

## Add a user

Send a POST request to `/users` with the following data:

```json
{
  "name": "John Doe",
  "email": "johndoe@email.com",
  "password": "password"
}
```

## Get a token

Send a POST request to `/authentication` with the following data:
    
```json
{
    "stratgey": "password",
    "email": "johndoe@email.com",
    "password": "password"
}
```

## Making authenticated requests

Set the `Authorization` header to the token (accessToken) you got from `/authentication`

```json
{
    "Authorization": "Bearer <token>"
}
```


To be continued...