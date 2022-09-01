// Initializes the `StripeService` service on path `/stripe-service`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { StripeService } from './stripe-service.class';
import createModel from '../../models/stripe-service.model';
import hooks from './stripe-service.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'stripe-service': StripeService & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/stripe-service', new StripeService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('stripe-service');

  service.hooks(hooks);
}
