<template>
  <tr>
    <td>{{ user.fullname }}</td>
    <td>{{ user.role | capitalize }}</td>
    <td>{{ user.email }}</td>
    <td>{{ user.created_at | shortDate }}</td>
    <td>
      <ul class="details-list">
        <li v-for="(value, key) in user.details" :key="value">
          <b>{{ key | titleCase}}:</b> {{ value | titleCase}}
        </li>
      </ul>
    </td>
    <td>
      <button class="button is-primary"
              :class="{ 'is-loading': saving }"
              :disabled="saving || deleting"
              @click="approveUser()">
        <span class="fa fa-check" aria-label="Approve"></span>
      </button>
      <button class="button is-danger"
              :class="{ 'is-loading': deleting }"
              :disabled="saving || deleting"
              @click="deleteUser()">
        <span class="fa fa-trash" aria-label="Delete Account"></span>
      </button>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      saving: false,
      confirmDelete: false,
      deleting: false
    };
  },
  methods: {
    approveUser() {
      this.saving = true;
      this.$store.dispatch('approveUser', this.user.id)
        .then(() => {
          this.saving = false;
        })
        .catch(() => {
          this.saving = false;
        });
    },
    deleteUser() {
      this.deleting = true;
      this.$store.dispatch('deleteUser', this.user.id)
        .then(() => {
          this.deleting = false;
        })
        .catch(() => {
          this.deleting = false;
        });
    }
  }
}
</script>

<style lang="scss" scoped>
  .details-list {
    list-style: none;
    padding-left: 0;
  }

  button {
    width: 2.5rem;
    height: 2.5rem;
  }
</style>
