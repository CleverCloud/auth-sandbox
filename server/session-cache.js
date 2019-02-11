'use strict'

let sessionCache

function getSessionCache (server) {
  if (sessionCache == null) {
    sessionCache = server.cache({
      segment: 'sessions',
      expiresIn: 30 * 60 * 1000,
    })
  }
  return sessionCache
}

module.exports = getSessionCache
