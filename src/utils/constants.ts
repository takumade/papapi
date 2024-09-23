export const paymentStatuses = {
    session_created: 'SESSION_CREATED',
    paid: 'PAID',
    failed: 'FAILED',
    cancelled: 'CANCELLED',
    delivered: 'DELIVERED',
    awaitingDelivery: 'AWAITING_DELIVERY',
    awaitingPayment: 'AWAITING_PAYMENT',
    refunded: 'REFUNDED',
    disputed: 'DISPUTED'
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