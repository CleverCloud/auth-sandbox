<template>
  <div>
    <div>
      Available accounts:
      <table>
        <tr>
          <th>login:</th>
          <th>password:</th>
        </tr>
        <tr>
          <td>john</td>
          <td>john</td>
        </tr>
        <tr>
          <td>paul</td>
          <td>paul</td>
        </tr>
        <tr>
          <td>george</td>
          <td>george</td>
        </tr>
        <tr>
          <td>ringo</td>
          <td>ringo</td>
        </tr>
      </table>
    </div>
    <div>
      <label for="">Login:</label>
      <input type="text" v-model="model.login">
    </div>
    <div>
      <label for="">Password</label>
      <input type="password" v-model="model.password">
    </div>
    <div style="background-color: #eee">
      Here, you can configure the
      <code>Set-Cookie</code> header that will be sent by the server after a successful login:
      <div>
        <div style="font-weight: bold;">Max-Age:</div>
        <label>Enabled: <input type="checkbox" v-model="model.maxAge.enable"></label>
        <div v-show="model.maxAge.enable">
          <code>Max-Age=</code><input type="number" min="0" v-model="model.maxAge.value">
        </div>
      </div>
      <div>
        <div style="font-weight: bold;">Domain:</div>
        <code>Domain=</code><input type="text" v-model="model.cookieConfig.domain">
      </div>
      <div>
        <div style="font-weight: bold;">Path:</div>
        <code>Path=</code><input type="text" v-model="model.cookieConfig.path">
      </div>
      <div>
        <div style="font-weight: bold;">Secure:</div>
        <label>Enabled: <input type="checkbox" v-model="model.cookieConfig.secure"></label>
      </div>
      <div>
        <div style="font-weight: bold;">HttpOnly:</div>
        <label>Enabled: <input type="checkbox" v-model="model.cookieConfig.httpOnly"></label>
      </div>
      <div>
        <div style="font-weight: bold;">SameSite:</div>
        <label>Not set: <input type="radio" v-model="model.cookieConfig.sameSite" :value="false"></label>
        <label>Lax: <input type="radio" v-model="model.cookieConfig.sameSite" value="Lax"></label>
        <label>Strict: <input type="radio" v-model="model.cookieConfig.sameSite" value="Strict"></label>
      </div>
      <div>
        <div style="font-weight: bold;">prefix:</div>
        <label>No prefix: <input type="radio" v-model="model.prefix" value=""></label>
        <label>__Secure: <input type="radio" v-model="model.prefix" value="__Secure-"></label>
        <label>__Host: <input type="radio" v-model="model.prefix" value="__Host-"></label>
      </div>
    </div>
    <div style="background-color:lightblue;">
      <pre>{{ cookieValue }}</pre>
    </div>
    <div>
      <button @click="loginLocalStorage">
        Login (and store session id token in local storage)
      </button>
    </div>
    <div>
      <button @click="loginCookies">
        Login (and store session id token in cookies)
      </button>
    </div>
  </div>
</template>

<style scoped>
div {
  margin: 1rem 0;
}

table,
table th,
table td {
  border: 1px solid #000;
  border-collapse: collapse;
  padding: 0.25rem 0.5rem;
}

label {
  display: block;
}
</style>

<script>
import cookieHelper from 'cookie'

export default {
  name: 'login',
  data () {
    return {
      model: {
        login: 'john',
        password: 'john',
        maxAge: {
          enable: false,
          value: 0,
        },
        prefix: '',
        cookieConfig: {
          domain: '',
          path: '',
          secure: false,
          httpOnly: false,
          sameSite: false,
        },
      },
    }
  },
  computed: {
    cookieValue () {
      const cookieSuffix = 'session-id'
      const config = { ...this.model.cookieConfig }
      if (this.model.maxAge.enable) {
        config.maxAge = this.model.maxAge.value
      }
      const cookieName = this.model.prefix + cookieSuffix
      return cookieHelper.serialize(cookieName, 'the-value', config)
    },
  },
  methods: {
    async loginLocalStorage () {
      const body = JSON.stringify(this.model)
      const response = await fetch('/login-with-local-storage', {
        method: 'POST', body, headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const sessionId = response.headers.get('x-session-id')
      localStorage.setItem('session-id', sessionId)
      this.$router.push('/')
    },
    async loginCookies () {
      const body = JSON.stringify(this.model)
      const response = await fetch('/login-with-cookies', {
        method: 'POST', body, headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      this.$router.push('/')
    },
  },
}
</script>
