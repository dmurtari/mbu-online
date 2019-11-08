<template>
  <div>
    <h4 v-if="isList"
        class="title is-4">Current Users</h4>
    <h4 v-else
        class="title is-4">
      <router-link to="/administration/users/current/all">
        Current Users
      </router-link>
      /&nbsp;User Detail
    </h4>
    <router-view></router-view>
  </div>
</template>

<script>
const listRegex = /.*all\/?$/

export default {
  computed: {
    isList() {
      return listRegex.test(this.$route.path);
    }
  }
}
</script>
