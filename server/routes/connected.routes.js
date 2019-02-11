'use strict'

const Boom = require('boom')
const config = require('../config/config.js')
const cookieHelper = require('cookie')
const getSessionCache = require('../session-cache.js')

module.exports = {
  name: 'connected.routes',
  async register (server) {

    const sessionCache = getSessionCache(server)

    server.route([

      {
        method: 'GET',
        path: '/api/me-with-local-storage',
        async handler (request) {

          const { 'x-session-id': sessionId } = request.headers
          if (sessionId == null) {
            throw Boom.unauthorized('You are not logged in!')
          }

          const sessionObject = await sessionCache.get(sessionId)
          if (sessionObject == null) {
            throw Boom.unauthorized('This session does not exist!')
          }

          return sessionObject.person
        },
      },

      {
        method: 'GET',
        path: '/api/me-with-cookies',
        async handler (request) {

          const { cookie: cookieHeader = '' } = request.headers
          const cookieObject = cookieHelper.parse(cookieHeader)
          const sessionId = cookieObject['session-id']
            || cookieObject['__Secure-session-id']
            || cookieObject['__Host-session-id']
            || null

          if (sessionId == null) {
            throw Boom.unauthorized('You are not logged in!')
          }

          const sessionObject = await sessionCache.get(sessionId)
          if (sessionObject == null) {
            throw Boom.unauthorized('This session does not exist!')
          }

          return sessionObject.person
        },
      },

    ])

  },
}
