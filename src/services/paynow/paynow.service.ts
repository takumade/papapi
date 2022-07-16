// Initializes the `paynow` service on path `/paynow`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Paynow } from './paynow.class';
import createModel from '../../models/paynow.model';
import hooks from './paynow.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'paynow': Paynow & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  let paynowService = new Paynow(options, app)
  app.use('/paynow', paynowService);
  app.use('/paynow/status-update', paynowService.statusUpdate);

  // Get our initialized service so that we can register hooks
  const service = app.service('paynow');

  service.hooks(hooks);
}
