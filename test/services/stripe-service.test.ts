import assert from 'assert';
import app from '../../src/app';

describe('\'StripeService\' service', () => {
  it('registered the service', () => {
    const service = app.service('stripe-service');

    assert.ok(service, 'Registered the service');
  });
});
