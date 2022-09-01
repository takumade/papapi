import assert from 'assert';
import app from '../../src/app';

describe('\'paynow\' service', () => {
  it('registered the service', () => {
    const service = app.service('paynow');

    assert.ok(service, 'Registered the service');
  });
});
