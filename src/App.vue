<template>
  <div id="app">
    <div>
      <router-link to="/">Home</router-link>
      |
      <router-link to="/login">Login</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
