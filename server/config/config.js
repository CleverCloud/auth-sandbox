'use strict'

const convict = require('convict')

const conf = convict({
  NODE_ENV: {
    doc: 'The application environment.',
    format: ['production', 'development'],
    default: null,
    env: 'NODE_ENV',
  },
  PORT: {
    doc: 'The port on which the server is running',
    format: Number,
    default: null,
    required: true,
    env: 'PORT',
  },
  DEV_FRONT_URL: {
    doc: 'URL of the dev server',
    format: String,
    default: null,
    env: 'DEV_FRONT_URL',
  },
})

module.exports = conf
