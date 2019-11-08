<template>
  <div>
    <h3 class="title is-3">Instructor Home</h3>
    <h5 class="subtitle is-5">
      From here, you can access all of the functionality that you will need as a teacher at MBU
    </h5>
    <div class="columns">
      <div class="column is-narrow sidebar">
        <aside class="menu">
          <p class="menu-label">Navigation</p>
          <ul class="menu-list">
            <router-link to="/teacher/home">Home</router-link>
          </ul>
          <p class="menu-label">Pick a task</p>
          <ul class="menu-list">
            <router-link to="/teacher/assignments">Event Assignments</router-link>
            <router-link to="/teacher/classes">Class Information/Completions</router-link>
          </ul>
        </aside>
      </div>
      <div class="column auto">
        <div class="notification is-danger"
             v-if="error">
          <p>{{ error }}</p>
        </div>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      error: '',
      loading: true
    };
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  padding-right: 2rem;
  min-width: 17rem;
}

.subtitle {
  padding-top: 1rem;
}
</style>
