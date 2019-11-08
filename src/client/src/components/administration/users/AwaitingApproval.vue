<template>
  <div>
    <h4 class="title is-4">
      Accounts Needing Approval
    </h4>
    <p>
      Users will be unable to use the full functionality of this website (such as registering their troop,
      or editing completion records) until their account has been approved. Approve user account below,
      or delete the account if you do not recognize the user.
    </p>
    <table class="table is-fullwidth"
           v-if="unapprovedUsers.length > 0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Email</th>
          <th>Date Created</th>
          <th>Details</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <approval-row v-for="user in unapprovedUsers"
                      :key="user.id"
                      :user="user">
        </approval-row>
      </tbody>
    </table>
    <div v-else
         class="notification">
      There are no users accounts awaiting approval at this time.
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ApprovalRow from './ApprovalRow.vue';

export default {
  computed: {
    ...mapGetters([
      'unapprovedUsers'
    ])
  },
  components: {
    ApprovalRow
  }
}
</script>

<style lang="scss" scoped>
table, div.notification {
  margin-top: 1rem;
}
</style>
