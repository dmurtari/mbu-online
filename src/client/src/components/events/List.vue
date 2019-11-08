<template>
  <div>
    <slot name="title">
      <h3 class="title is-3">
        All Events ({{ totalEvents }} Total)
      </h3>
    </slot>
    <closable-error v-if="eventLoadError"></closable-error>
    <spinner-page v-if="eventLoading"></spinner-page>
    <div v-else>
      <button class="button is-primary"
              v-if="isAdmin && !displayAddEvent"
              @click="toggleAdd()">
        Add an Event
      </button>
      <event-create @close="toggleAdd()"
                    v-show="displayAddEvent"></event-create>
      <div class="event-list">
        <span v-if="orderedEvents.length < 1">
          <div class="notification">
            <p>
              No events have been added yet.
              <span v-if="isAdmin">
                <br> Scoutmasters will not be able to register any scouts for events until
                you create an event (make sure to mark it as the current semester's
                event)
                <a @click.prevent="toggleAdd()"
                   v-if="!displayAddEvent">
                  Add the first event?
                </a>
              </span>
            </p>
          </div>
        </span>
        <event v-for="event in orderedEvents"
               :event="event"
               :key="event.id"
               :currentEvent="event.id === currentEvent.id"></event>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import EventsUpdate from 'mixins/EventsUpdate';

import Event from './Event.vue'
import EventCreate from './Create.vue';

export default {
  data () {
    return {
      displayAddEvent: false
    }
  },
  computed: {
    ...mapGetters([
      'orderedEvents',
      'currentEvent',
      'isAdmin'
    ]),
    totalEvents () {
      return this.orderedEvents.length;
    }
  },
  methods: {
    isAuthorized () {
      return this.profile.role === 'admin'
    },
    toggleAdd () {
      this.displayAddEvent = !this.displayAddEvent;
    }
  },
  components: {
    'event': Event,
    'event-create': EventCreate
  },
  mixins: [
    EventsUpdate
  ]
}
</script>

<style lang="scss">
.event-list {
  margin-top: 2em;
}
</style>
