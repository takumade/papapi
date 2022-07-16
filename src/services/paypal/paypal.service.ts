// Initializes the `paypal` service on path `/paypal`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Paypal } from './paypal.class';
import createModel from '../../models/paypal.model';
import hooks from './paypal.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'paypal': Paypal & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  let paypalService = new Paypal(options, app)
  app.use('/paypal', paypalService);

  app.post("/paypal/orders", paypalService.createOrder);
  app.post("/paypal/orders/:orderID/capture",paypalService.captureOrder);

  // Get our initialized service so that we can register hooks
  const service = app.service('paypal');

  service.hooks(hooks);
}
