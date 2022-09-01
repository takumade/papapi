// Initializes the `stripe` service on path `/stripe`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Stripe } from './stripe.class';
import createModel from '../../models/stripe.model';
import hooks from './stripe.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'stripe': Stripe & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/stripe', new Stripe(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('stripe');

  service.hooks(hooks);
}
