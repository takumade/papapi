import {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
  } from 'kysely'
  
  export interface Database {
    user: UserTable
    task: TaskTable
    stripe: StripeTable
    paypal: PaypalTable
    paynow: PaynowTable
    paynow_status_update: PaynowStatusUpdateTable
  }
  
  export interface UserTable {
    id: Generated<number>
  }
  
  export type User = Selectable<UserTable>
  export type NewUser = Insertable<UserTable>
  export type UserUpdate = Updateable<UserTable>
  
  export interface TaskTable {
    id: Generated<number>
    description: string
    is_done: ColumnType<boolean, boolean | undefined, never> // since `is_done` has a default
    user_id: number | null
  }
  
  export type Task = Selectable<TaskTable>
  export type NewTask = Insertable<TaskTable>
  export type TaskUpdate = Updateable<TaskTable>
  
  export interface StripeTable {
    id: Generated<number>
    session_id: string
    transaction_id: string
    invoice: string
    email: string
    phone: string
    method: string
    items: JSONColumnType<string[]>
    session: JSONColumnType<string[]>
    amount: number
    success_url: string
    cancel_url: string
    status: string
  }
  
  export type Stripe = Selectable<StripeTable>
  export type NewStripe = Insertable<StripeTable>
  export type StripeUpdate = Updateable<StripeTable>
  
  export interface PaypalTable {
    id: Generated<number>
    order_id: string
    transaction_id: string
    invoice: string
    currency: string
    email: string
    method: string
    items: JSONColumnType<string[]>
    amount: number
    status: string
  }
  
  export type Paypal = Selectable<PaypalTable>
  export type NewPaypal = Insertable<PaypalTable>
  export type PaypalUpdate = Updateable<PaypalTable>
  
  export interface PaynowTable {
    id: Generated<number>
    transaction_id: string
    invoice: string
    paynow_reference: string
    instructions: string
    email: string
    phone: string
    method: string
    items: JSONColumnType<string[]>
    amount: number
    redirect_url: string
    result_url: string
    link_url: string
    poll_url: string
    status: string
  }
  
  export type Paynow = Selectable<PaynowTable>
  export type NewPaynow = Insertable<PaynowTable>
  export type PaynowUpdate = Updateable<PaynowTable>
  
  export interface PaynowStatusUpdateTable {
    id: Generated<number>
    text: string
  }
  
  export type PaynowStatusUpdate = Selectable<PaynowStatusUpdateTable>
  export type NewPaynowStatusUpdate = Insertable<PaynowStatusUpdateTable>
  export type PaynowStatusUpdateUpdate = Updateable<PaynowStatusUpdateTable>
  