<template>
  <span class="select">
    <select id="event-offering-select"
            @change="emitEvent()"
            v-model="selectedEvent"
            :disabled="orderedEvents.length < 1">
      <option v-if="showAll"
              :value="null">All Events</option>
      <option v-for="option in readableEvents"
              :key="option.id"
              :value="option.id">
        {{ option.event }}
      </option>
    </select>
  </span>
</template>


<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

export default {
  props: {
    showAll: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: true,
      selectedEvent: ''
    };
  },
  computed: {
    ...mapGetters([
      'orderedEvents',
      'currentEvent',
      'selectedEventId'
    ]),
    readableEvents () {
      return _.map(this.orderedEvents, (event) => {
        return {
          id: event.id,
          event: event.semester + ' ' + event.year
        };
      });
    }
  },
  methods: {
    emitEvent () {
      this.$store.dispatch('setSelectedId', this.selectedEvent);
      this.$emit('select', this.selectedEvent);
    }
  },
  mounted () {
    if (this.orderedEvents.length < 1) {
      return;
    }

    if (this.$route.query.eventId) {
      this.selectedEvent = Number(this.$route.query.eventId);
    } else if (this.showAll) {
      this.selectedEvent = null;
    } else if (this.selectedEventId) {
      this.selectedEvent = this.selectedEventId;
    } else if (this.currentEvent.length > 0) {
      this.selectedEvent = this.currentEvent.id;
    } else {
      this.selectedEvent = this.orderedEvents[0].id;
    }

    this.emitEvent();
  }
}
</script>
