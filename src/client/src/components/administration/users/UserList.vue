<template>
  <paginated-items :target="'users'"
                   :contents="users"
                   :showLinks="true"
                   :table="true">
    <thead slot="heading">
      <tr>
        <th width="15%">Name</th>
        <th width="15%">Role</th>
        <th width="30%">Email</th>
        <th width="30%">Details</th>
        <th width="80px"></th>
      </tr>
    </thead>
    <template slot="row"
              slot-scope="props">
      <user-row :user="props.item"></user-row>
    </template>
  </paginated-items>
</template>


<script>
import UserRow from './UserRow.vue';

export default {
  props: {
    users: {
      required: true,
      type: Array
    }
  },
  components: {
    UserRow
  }
}
</script>
