import assert from 'assert';
import app from '../../src/app';

describe('\'paypal\' service', () => {
  it('registered the service', () => {
    const service = app.service('paypal');

    assert.ok(service, 'Registered the service');
  });
});
