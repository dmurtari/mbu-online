<template>
  <div class="section">
    <h4 class="title is-4">Account Information</h4>
    <p>
      <strong>Name: </strong>{{ fullname }}</p>
    <p>
      <strong>Email: </strong>{{ profile.email }}</p>
    <p>
      <strong>Your Role: </strong>{{ profile.role | titleCase }}</p>
    <div v-for="(value, key) in profile.details"
         :key="key">
      <p>
        <strong>{{ key | titleCase}}: </strong>{{ value | titleCase}}</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'profile'
    ]),
    fullname () {
      return this.profile.firstname + ' ' + this.profile.lastname;
    }
  }
}
</script>
