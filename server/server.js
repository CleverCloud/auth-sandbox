'use strict'

const config = require('./config/config.js')
const connectedRoutes = require('./routes/connected.routes.js')
const frontRoutes = require('./routes/front.routes.js')
const Good = require('good')
const Hapi = require('hapi')
const loginRoutes = require('./routes/login.routes.js')

const security = {
  xframe: 'deny',
}

const logToConsole = {
  plugin: Good,
  options: {
    ops: { interval: 1000 },
    reporters: {
      console: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', error: '*', request: '*', response: '*' }],
        },
        { module: 'good-console' },
        'stdout',
      ],
    },
  },
}

const Disk = require('catbox-disk')

async function createServer () {

  const isProduction = config.get('NODE_ENV') === 'production'
  const cacheConfig = isProduction ? {} : {
    cache: [{
      provider: {
        constructor: Disk,
        options: {
          cachePath: '/tmp',
          cleanEvery: 3600000,
          partition: 'cache',
        },
      },
    }],
  }

  const server = Hapi.server({
    port: config.get('PORT'),
    routes: { security },
    ...cacheConfig,
  })

  await server.register([
    logToConsole,
    loginRoutes,
    connectedRoutes,
    frontRoutes,
  ])

  return server
}

module.exports = { createServer }
