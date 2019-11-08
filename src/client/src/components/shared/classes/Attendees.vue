<template>
  <div class="attendee-container">
    <div v-if="!editing">
      <h5 class="title is-5">
        Attendees for Period {{ period }}
        <span v-if="scouts.length > 0">
          ({{ scouts.length }})
        </span>
        <div class="is-pulled-right"
             v-if="scouts.length > 0">
          <button class="titlebar-button button is-light"
                  @click="toggleEdit()">
            Edit Completions
          </button>
        </div>
      </h5>
      <div v-if="scouts.length < 1"
           class="notification">
        There are no scouts attending this period.
      </div>
      <table v-else
             class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Troop</th>
            <th>Completed Requirements</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="scout in scouts"
              :key="scout.id">
            <td>{{ scout.fullname }}</td>
            <td>{{ scout.troop }}</td>
            <td>{{ scout.completions | numAlphaSort | commaSeparated }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <h5 class="title is-5">
        Editing Completions for Period {{ period }}
      </h5>
      <completions-edit v-if="editing"
                        :scouts="scouts"
                        :period="period"
                        :requirements="requirements"
                        :offeringId="offeringId"
                        :eventId="eventId"
                        @done="toggleEdit()"></completions-edit>
    </div>
  </div>
</template>

<script>
import CompletionsEdit from './CompletionsEdit.vue';

export default {
  props: {
    period: {
      type: Number,
      required: true
    },
    scouts: {
      type: Array,
      default: () => []
    },
    requirements: {
      type: Array,
      default: () => []
    },
    offeringId: {
      type: Number,
      required: true
    },
    eventId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      editing: false
    };
  },
  methods: {
    toggleEdit () {
      if (this.editing) {
        this.$emit('triggerRefresh');
      }

      this.editing = !this.editing;
    }
  },
  components: {
    CompletionsEdit
  }
}
</script>

<style lang="scss" scoped>
.attendee-container {
  padding-top: 2rem;
  padding-bottom: 1rem;
}
</style>
