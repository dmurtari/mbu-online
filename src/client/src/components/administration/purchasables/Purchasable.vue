<template>
  <div class="box">
    <h5 class="title is-5">
      {{ purchasable.item }}
      <button class="button edit-button is-pulled-right"
              @click="toggleEdit()">
        <span class="fa fa-edit" aria-label="Edit"></span>
      </button>
    </h5>
    <detail v-if="!editing"
            :purchasable="purchasable"></detail>
    <edit v-if="editing"
          :purchasable="purchasable"
          :eventId="eventId"
          @close="toggleEdit()"></edit>
  </div>
</template>

<script>
import Detail from './Detail.vue';
import Edit from './Edit.vue';

export default {
  props: {
    purchasable: {
      type: Object,
      required: true
    },
    eventId: { required: true }
  },
  data() {
    return {
      editing: false
    };
  },
  methods: {
    toggleEdit() {
      this.editing = !this.editing;
    }
  },
  components: {
    Detail,
    Edit
  }
}
</script>

<style lang="scss" scoped>
  .edit-button {
    margin-top: -.5em;
    margin-right: -.5em;
  }
</style>