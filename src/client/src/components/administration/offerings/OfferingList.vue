<template>
  <div>
    <h4 class="title is-4">
      Manage Merit Badge Offerings
    </h4>
    <p>
      Use this page to create, edit, and remove badge offerings for different events. These badges are what
      Scoutmasters will see as being offered for an event. Add badges and edit details such which periods
      each badge will be offered, how many class periods each badge will take to teach, and how much scouts
      need to pay to attend class for a badge.
    </p>
    <closable-error v-if="error || eventLoadError"></closable-error>
    <spinner-page v-if="loading || eventLoading"></spinner-page>
    <div v-else>
      <div class="box offering-list-filters">
        <div class="columns">
          <div class="column is-6">
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label">For&nbsp;Event:</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <events-dropdown @select="pickEvent($event)"></events-dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-6">
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label"
                       for="offering-list-offered-filter">Filter&nbsp;by:</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <span class="select">
                      <select class="form-control"
                              id="offering-list-offered-filter"
                              v-model="offeredFilter">
                        <option v-for="option in offeredFilters"
                                :key="option.value"
                                :value="option.value">
                          {{ option.text }}
                        </option>
                      </select>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="offering-list">
        <div class="notification"
             v-if="eventId === ''">
          Please pick an event to add offerings to. You can also
          <router-link to="/administration/events/all">add an event</router-link>
          if you haven't added any events already.
        </div>
        <div v-else>
          <offering-row v-for="badge in filteredOfferings"
                        :key="badge.id"
                        :eventId="eventId"
                        :badge="badge"></offering-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

import OfferingRow from './OfferingRow.vue';
import EventsUpdate from 'mixins/EventsUpdate';

export default {
  data () {
    return {
      eventId: '',
      offeredFilter: 'all',
      offeredFilters: [
        { text: 'All', value: 'all' },
        { text: 'Offered badges', value: 'offered' },
        { text: 'Unoffered badges', value: 'unoffered' }
      ],
      error: '',
      loading: false
    };
  },
  computed: {
    ...mapGetters([
      'badgeIdsAndNames'
    ]),
    filteredOfferings () {
      if (this.offeredFilter === 'offered') {
        return _.filter(this.offeringList, (offering) => {
          return !_.isEmpty(offering.periods);
        });
      } else if (this.offeredFilter === 'unoffered') {
        return _.filter(this.offeringList, (offering) => {
          return _.isEmpty(offering.periods);
        });
      } else {
        return this.offeringList;
      }
    },
    offeringList () {
      // Combines offerings for an event with other badges not offered at that event
      let offerings = _.map(this.$store.getters.offeringsForEvent(this.eventId), 'details');
      return _.map(this.badgeIdsAndNames, (badge) => {
        let offering = _.find(offerings, { 'badge_id': badge.id }) || {};
        return {
          badge_id: badge.id,
          name: badge.name,
          periods: offering.periods,
          duration: offering.duration,
          price: offering.price,
          requirements: offering.requirements,
          size_limit: offering.size_limit
        };
      });
    }
  },
  methods: {
    pickEvent (eventId) {
      this.eventId = eventId;
    }
  },
  created () {
    this.loading = true;
    this.$store.dispatch('getBadges')
      .then(() => {
        this.error = '';
      })
      .catch(() => {
        this.error = 'Couldn\'t load badges. Please try again'
      })
      .then(() => {
        this.loading = false;
      });
  },
  components: {
    OfferingRow
  },
  mixins: [
    EventsUpdate
  ]
}
</script>

<style lang="scss" scoped>
.offering-list-filters {
  margin-top: 2em;
}

.offering-loading {
  margin-top: 5em;
  width: 5em;
  display: block;
  margin: auto;
}
</style>
