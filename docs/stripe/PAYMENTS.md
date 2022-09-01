# Recieve Payments

## Standard Payment

### Workflow
1. User clicks Stripe button (Buy)
2. User get sent to Stripe inorder to complete payment
3. After successful payment it goes to transaction successful page

**Note** I must add Stripe Webhooks inorder to make this more secure

**Note** Order creation and capturing happends on the backend takes place on the backend

### Example
1. Go to the [Checkout HTML](#https://github.com/takumade/papapi/blob/main/src/frontents/stripe/checkout.html)

a. Make user the following are correct:
- `backendEnpoint` points to the correct backend URL
- `successUrl` is correct
- `cancelUrl` is correct

b. Serve it either using Apache, Nginx or your favourate file serving tool

c. Open it and click BUY

d. It should take you to Stripe

e. Complete your fake payment and you should be routed to transaction successfull page