
import axios from 'axios';
import crypto from 'crypto';
import { RawBuilder, sql } from 'kysely';


export const objectHasKeys = (keys: any[], object: any) => {

  const objectKeys = Object.keys(object);
  let status = true;

  keys.map(k => {
    if (!objectKeys.includes(k)) {
      status = false;
    }
  });

  return status;
};

export const generateTransactionId = () => {
  return 'TRX-' + new Date().getTime() + '-' + crypto.randomBytes(8).toString('hex');
};

export const pushToWebhook = async (origin: string, type: string, url: string, data: any) => {
  if (url && url.length > 0) {

    const webhookData = {
      origin,
      type,
      data,
    };

    // NOTE: Should await these calls or not?
    await axios.post(url, webhookData);
  }
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function json<T> (object: T): RawBuilder<T> {
  return sql`cast (${JSON.stringify(object)} as jsonb)`
}