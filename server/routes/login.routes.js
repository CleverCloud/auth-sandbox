'use strict'

const Boom = require('boom')
const config = require('../config/config.js')
const cookieHelper = require('cookie')
const getSessionCache = require('../session-cache.js')
const { randomBytes } = require('crypto')

const database = require('../database.json')

module.exports = {
  name: 'login.routes',
  async register (server) {

    const sessionCache = getSessionCache(server)

    server.route([

      {
        method: 'POST',
        path: '/login-with-local-storage',
        async handler (request, h) {

          const { login, password } = request.payload

          // dummy authentication
          if (database[login] == null || login !== password) {
            throw Boom.unauthorized('This user does not exist!')
          }

          const sessionId = randomBytes(20).toString('base64')
            .replace(/\//g, '-')
            .replace(/\+/g, '_')
            .replace(/=/g, '')

          const sessionObject = {
            person: database[login],
          }
          await sessionCache.set(sessionId, sessionObject)

          return h
            .response(sessionObject.person)
            .header('x-session-id', sessionId)
        },
      },

      {
        method: 'POST',
        path: '/logout-with-local-storage',
        async handler (request, h) {

          const { 'x-session-id': sessionId } = request.headers
          if (sessionId == null) {
            throw Boom.unauthorized('You are not logged in!')
          }

          const sessionObject = await sessionCache.get(sessionId)
          if (sessionObject == null) {
            throw Boom.unauthorized('This session does not exist!')
          }

          await sessionCache.drop(sessionId)

          return h
            .response()
            .code(204)
        },
      },

      {
        method: 'POST',
        path: '/login-with-cookies',
        async handler (request, h) {

          const { cookie: cookieHeader = '' } = request.headers
          const cookieObject = cookieHelper.parse(cookieHeader)
          const oldSessionId = cookieObject['session-id']
            || cookieObject['__Secure-session-id']
            || cookieObject['__Host-session-id']
            || null

          console.log({ oldSessionId })

          let deleteOldSessionCookieHeader
          if (oldSessionId != null) {
            const oldSessionObject = await sessionCache.get(oldSessionId)
            if (oldSessionObject != null) {
              const { cookieName, cookieConfig } = oldSessionObject
              deleteOldSessionCookieHeader = cookieHelper.serialize(cookieName, '', {
                ...cookieConfig,
                expires: new Date(0),
              })
              await sessionCache.drop(oldSessionId)
            }
          }

          console.log({ deleteOldSessionCookieHeader })

          const { login, password, cookieConfig, maxAge, prefix } = request.payload

          // dummy authentication
          if (database[login] == null || login !== password) {
            throw Boom.unauthorized('This user does not exist!')
          }

          const sessionId = randomBytes(20).toString('base64')
            .replace(/\//g, '-')
            .replace(/\+/g, '_')
            .replace(/=/g, '')
          const cookieName = prefix + 'session-id'

          const sessionObject = {
            person: database[login],
            cookieName, cookieConfig,
          }

          await sessionCache.set(sessionId, sessionObject)

          const config = { ...cookieConfig }
          if (maxAge.enable) {
            config.maxAge = maxAge.value
          }

          const response = h.response(sessionObject.person)

          if (deleteOldSessionCookieHeader != null) {
            response.header('Set-Cookie', deleteOldSessionCookieHeader, { append: true })
          }

          return response
            .header('Set-Cookie', cookieHelper.serialize(cookieName, sessionId, config), { append: true })
        },
      },

      {
        method: 'POST',
        path: '/logout-with-cookies',
        async handler (request, h) {

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

          await sessionCache.drop(sessionId)

          const { cookieName, cookieConfig } = sessionObject
          const setCookieHeader = cookieHelper.serialize(cookieName, '', {
            ...cookieConfig,
            expires: new Date(0),
          })

          return h
            .response()
            .header('Set-Cookie', setCookieHeader, { append: true })
            .code(204)
        },
      },

    ])

  },
}
