<template>
  <div>
    <div class="column is-6 is-offset-3">
      <h1 class="title">Reset your password</h1>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    if (localStorage.getItem('token')) {
      next((vm) => vm.$router.push('/'));
    }
    next();
  }
}
</script>