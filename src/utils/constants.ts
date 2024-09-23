
export enum PaymentStatuses {
    SessionCreated = 'SESSION_CREATED',
    Paid = 'PAID',
    Failed = 'FAILED',
    Cancelled = 'CANCELLED',
    Delivered = 'DELIVERED',
    AwaitingDelivery = 'AWAITING_DELIVERY',
    AwaitingPayment = 'AWAITING_PAYMENT',
    Refunded = 'REFUNDED',
    Disputed = 'DISPUTED'
  }

  
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