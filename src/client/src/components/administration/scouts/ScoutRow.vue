<template>
  <tr>
    <td>{{ firstname }}</td>
    <td>{{ lastname }}</td>
    <td>{{ troop }}</td>
    <td>{{ user.fullname }}</td>
    <td>
      <span class="is-pulled-right">
        <router-link :to="'/administration/scouts/list/' + id">Details</router-link>
      </span>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    id: {
      type: Number,
      required: true
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    troop: {
      type: Number,
      required: true
    },
    registrations: {
      type: Array,
      default: () => []
    },
    user: {
      type: Object,
      required: true
    }
  }
}
</script>