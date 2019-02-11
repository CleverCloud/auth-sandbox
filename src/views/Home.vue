<template>
  <div>
    <div>
      <h2>Local storage:</h2>
      <button @click="logoutWithLocalStorage">Logout</button>
      <button @click="whoAmIWithLocalStorage">Who am I?</button>
      <div>
        <div v-if="localStorage.person != null">
          <div>Name: {{ localStorage.person.name }}</div>
          <div>Birth date: {{ localStorage.person.birthdate }}</div>
          <div>Main instrument: {{ localStorage.person.instrument }}</div>
        </div>
        <div v-if="localStorage.errorMessage != null">{{ localStorage.errorMessage }}</div>
      </div>
    </div>
    <div>
      <h2>Cookies:</h2>
      <button @click="logoutWithCookies">Logout</button>
      <button @click="whoAmIWithCookies">Who am I?</button>
      <div>
        <div v-if="cookies.person != null">
          <div>Name: {{ cookies.person.name }}</div>
          <div>Birth date: {{ cookies.person.birthdate }}</div>
          <div>Main instrument: {{ cookies.person.instrument }}</div>
        </div>
        <div v-if="cookies.errorMessage != null">{{ cookies.errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      localStorage: {
        person: null,
        errorMessage: null,
      },
      cookies: {
        person: null,
        errorMessage: null,
      },
    }
  },
  methods: {
    async logoutWithLocalStorage () {

      const sessionId = localStorage.getItem('session-id')
      const headers = {}

      if (sessionId != null) {
        headers['x-session-id'] = sessionId
      }

      const response = await fetch('/logout-with-local-storage', { method: 'POST', headers })
      localStorage.removeItem('session-id')
      this.localStorage.person = null
      this.localStorage.errorMessage = null
    },
    async whoAmIWithLocalStorage () {

      const sessionId = localStorage.getItem('session-id')
      const headers = { 'Accept': 'application/json' }
      if (sessionId != null) {
        headers['x-session-id'] = sessionId
      }

      const response = await fetch('/api/me-with-local-storage', { method: 'GET', headers })
        .then((r) => r.json())

      if (response.error != null) {
        this.localStorage.person = null
        this.localStorage.errorMessage = response.message
      }
      else {
        this.localStorage.person = response
        this.localStorage.errorMessage = null
      }
    },
    async logoutWithCookies () {

      const headers = {}

      const response = await fetch('/logout-with-cookies', { method: 'POST', headers })
      this.cookies.person = null
      this.cookies.errorMessage = null
    },
    async whoAmIWithCookies () {

      const headers = { 'Accept': 'application/json' }

      const response = await fetch('/api/me-with-cookies', { method: 'GET', headers })
        .then((r) => r.json())

      if (response.error != null) {
        this.cookies.person = null
        this.cookies.errorMessage = response.message
      }
      else {
        this.cookies.person = response
        this.cookies.errorMessage = null
      }
    },
  },
}
</script>
