import { Application } from '../declarations';
import users from './users/users.service';
import paynow from './paynow/paynow.service';
import paypal from './paypal/paypal.service';
import stripe from './stripe/stripe.service';
import stripeService from './stripe-service/stripe-service.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(paynow);
  app.configure(paypal);
  app.configure(stripe);
  app.configure(stripeService);
}
