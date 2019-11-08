<template>
  <section class="hero is-large">
    <div class="hero-body">
      <div>
        <h1 class="title">
          Oops...
        </h1>
        <h2 class="subtitle">
          The page you entered cannot be found.
          <a href="#" @click="back()">Go back</a> or
          <router-link to="/">return home?</router-link>
        </h2>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  methods: {
    back() {
      window.history.back();
    }
  }
}
</script>