<template>
  <div class="box">
    <h4 class="title is-4">{{ badge.name }}
      <button class="button edit-button is-pulled-right"
              v-if="isAdmin"
              @click="toggleEdit()">
        <span class="fa fa-edit" aria-label="Edit"></span>
      </button>
    </h4>
    <badge-detail v-if="!displayEditBadge" :badge="badge"></badge-detail>
    <badge-edit v-if="displayEditBadge"
                :badge="badge"
                @close="toggleEdit()"></badge-edit>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Detail from './Detail.vue';
import Edit from './Edit.vue';

export default {
  props: {
    badge: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      displayEditBadge: false
    };
  },
  computed: {
    ...mapGetters([
      'isAdmin'
    ])
  },
  methods: {
    toggleEdit() {
      this.displayEditBadge = !this.displayEditBadge;
    }
  },
  components: {
    'badge-detail': Detail,
    'badge-edit': Edit
  }
}
</script>

<style lang="scss" scoped>
  .edit-button {
    margin-top: -.5em;
    margin-right: -.5em;
  }
</style>