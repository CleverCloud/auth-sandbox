'use strict'

const config = require('../config/config.js')
const h2o2 = require('h2o2')
const Inert = require('inert')

const DEV_FRONT_URL = config.get('DEV_FRONT_URL')

module.exports = {
  name: 'front.routes',
  async register (server) {

    const isProduction = config.get('NODE_ENV') === 'production'

    if (isProduction) {
      await server.register(Inert)
      server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
          directory: {
            path: 'dist',
          },
        },
      })

      // https://github.com/AlexanderElias/spazy
      server.ext('onPreResponse', (request, h) => {

        const response = request.response
        if (response.isBoom && response.output.statusCode === 404) {
          return h.file('dist/index.html').code(200)
        }

        return h.continue
      })
    }
    else {
      await server.register(h2o2)
      server.route({
        method: '*',
        path: '/{path*}',
        config: {
          handler: {
            proxy: {
              passThrough: true,
              xforward: true,
              mapUri (request) {
                return { uri: `${DEV_FRONT_URL}${request.path}` }
              },
            },
          },
        },
      })
    }
  },
}
