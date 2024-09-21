import { Hono } from "hono"

const auth = new Hono()


auth.post('/', (c) => {
    return c.json({
      status: true, 
      message: "User created"
    })
  })

  
export default auth  