import { Hono } from "hono"

const users = new Hono()


users.post('/', (c) => {
    return c.json({
      status: true, 
      message: "Auth created"
    })
  })

  
export default users  