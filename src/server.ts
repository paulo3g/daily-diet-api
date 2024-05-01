import fastify from 'fastify'
import { env } from './env'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie)

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
