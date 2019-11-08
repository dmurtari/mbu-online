<template>
  <div>
    <p>
      This page shows the number of scouts assigned to each class. You can view the completion records for
      each scout in a class by clicking the "details" link next to each class.
      <span v-if="isAdmin"> To edit badges that are offered for an event, use the
        <router-link to="/administration/events/offerings">offerings page</router-link>. To change a scout's badge assignments, use the
        <router-link to="/administration/scouts/assignments">assignments page</router-link>.
      </span>
    </p>
    <div class="box class-list-filters">
      <div class="columns">
        <div class="column is-6">
          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label class="label">For&nbsp;Event:</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <events-dropdown @select="setEvent($event)"></events-dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column is-6">
          <div class="search-container field is-horizontal">
            <div class="field-label is-normal">
              <label class="label"
                     for="class-list-find">Badge:</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control ">
                  <input class="input is-expanded"
                         id="class-list-find"
                         v-model="search">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <closable-error v-if="classLoadError"
                    @dismissed="dismissError()">{{ classLoadError }}</closable-error>
    <spinner-page v-if="classesLoading"></spinner-page>
    <table v-else
           class="table is-striped is-fullwidth">
      <thead>
        <tr class="meta-header">
          <th colspan="3">Class Information</th>
          <th colspan="4">Attendance per Period</th>
          <th></th>
        </tr>
        <tr>
          <th>Badge</th>
          <th>Duration</th>
          <th>Limit/Period</th>
          <th>Total</th>
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <attendance-row v-for="offeredClass in filteredOrderedClasses"
                        :key="offeredClass.offering_id"
                        :id="offeredClass.offering_id"
                        :event-id="eventId"
                        :badge="offeredClass.badge.name"
                        :size-info="offeredClass.sizeInfo || {}"
                        :duration="offeredClass.duration"
                        :offered-periods="offeredClass.periods"></attendance-row>
      </tbody>
    </table>
  </div>
</template>


<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

import AttendanceRow from './AttendanceRow.vue';
import ClassSizesUpdate from 'mixins/ClassSizesUpdate';

export default {
  data() {
    return {
      eventId: 0,
      search: ''
    };
  },
  computed: {
    ...mapGetters(['allEvents', 'eventClasses', 'isAdmin']),
    event() {
      return _.find(this.allEvents, { id: this.eventId });
    },
    classes() {
      return this.eventClasses[this.eventId] || {};
    },
    orderedClasses() {
      return _.orderBy(this.classes, 'badge.name');
    },
    filteredOrderedClasses() {
      return _.filter(this.orderedClasses, classObject => {
        return (
          classObject.badge.name
            .toLowerCase()
            .indexOf(this.search.toLowerCase()) > -1
        );
      });
    }
  },
  methods: {
    dismissError() {
      this.classLoadError = '';
    },
    setEvent(eventId) {
      this.eventId = eventId;

      if (this.hasClassInfoForEvent(eventId)) {
        return;
      }

      this.loadClasses(eventId);
    }
  },
  watch: {
    eventId() {
      this.dismissError();
    }
  },
  components: {
    AttendanceRow
  },
  mixins: [ClassSizesUpdate]
};
</script>

<style lang="scss" scoped>
.class-list-filters {
  margin-top: 2em;
}

.class-loading {
  margin-top: 5em;
  width: 5em;
  display: block;
  margin: auto;
}

table .meta-header {
  th:first-child {
    border-right: 1px solid lightgray;
  }
}
</style>
