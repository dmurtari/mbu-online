<template>
  <div class="box">
    <h4 class="title is-4">
      {{ scout.firstname }} {{ scout.lastname }}
      <button class="button edit-button is-pulled-right"
              @click="toggleEdit()">
        <span class="fa fa-edit"
              v-if="!editing"
              aria-label="Edit"></span>
        <span class="fa fa-close"
              v-if="editing"
              aria-label="Close"></span>
      </button>
    </h4>
    <scout-detail v-if="!editing" :scout="scout"></scout-detail>
    <scout-edit v-if="editing" :scout="scout" @close="toggleEdit()"></scout-edit>
  </div>
</template>

<script>
import Detail from './Detail.vue';
import ScoutEdit from 'components/scouts/ScoutEdit.vue';

export default {
  props: {
    scout: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      editing: false
    };
  },
  watch: {
    scout() {
      this.editing = false;
    }
  },
  methods: {
    toggleEdit() {
      this.editing = !this.editing;
    }
  },
  components: {
    'scout-detail': Detail,
    ScoutEdit
}
}
</script>

<style lang="scss" scoped>
  .edit-button {
    margin-top: -.5em;
    margin-right: -.5em;
  }
</style>
