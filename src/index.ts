import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import users from './apis/users'
import auth from './apis/auth'
import paynow from './apis/paynow'
import "dotenv/config";  
import stripe from './apis/stripe'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.route('api/users', users)
app.route('api/auth', auth)
app.route('api/paynow', paynow)
app.route('api/paypal', paynow)
app.route('api/stripe', stripe)





const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
