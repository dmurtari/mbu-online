<template>
  <div class="box"
       :class="{ 'panel-info': currentEvent }">
    <h4 class="title is-4">
      {{ event.semester }} {{ event.year }}
      <span v-if="currentEvent">(Current Event)</span>
      <button class="button edit-button is-pulled-right"
              v-if="isAdmin"
              @click="toggleEdit">
        <span class="fa fa-edit" aria-label="Edit"></span>
      </button>
    </h4>
    <event-detail v-if="!displayEditEvent"
                  :event="event"></event-detail>
    <event-edit v-if="displayEditEvent"
                @close="toggleEdit"
                :event="event"></event-edit>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import EventEdit from './Edit.vue';
import EventDetail from './Detail.vue';

export default {
  data() {
    return {
      displayEditEvent: false
    }
  },
  computed: {
    ...mapGetters([
      'isAdmin'
    ])
  },
  props: {
    event: {
      type: Object,
      required: true
    },
    currentEvent: {
      type: Boolean
    }
  },
  methods: {
    toggleEdit() {
      this.displayEditEvent = !this.displayEditEvent;
    }
  },
  components: {
    'event-edit': EventEdit,
    'event-detail': EventDetail
  }
}
</script>

<style lang="scss" scoped>
  .edit-button {
    margin-top: -.5em;
    margin-right: -.5em;
  }
</style>
