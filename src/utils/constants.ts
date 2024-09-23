
export enum PaymentStatuses {
    SessionCreated = 'session_created',
    Paid = 'paid',
    Failed = 'failed',
    Cancelled = 'cancelled',
    Delivered = 'delivered',
    AwaitingDelivery = 'awaiting_delivery',
    AwaitingPayment = 'awaiting_payment',
    Refunded = 'refunded',
    Disputed = 'disputed',
    Sent = 'sent'
  }

  export type PaynowStatus = {
    reference: string;
    paynowreference: string;
    amount: string;
    status: string;
    pollurl: string;
    hash: string;
  };


  export enum PaymentMethods {
    Stripe = 'STRIPE',
    Paypal = 'PAYPAL',
    Paynow = 'PAYNOW'
  }
  
  export enum TableNames {
    Stripe = 'stripe',
    Paypal = 'paypal',
    Paynow = 'paynow'
}