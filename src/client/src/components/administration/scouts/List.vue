<template>
  <div>
    <p>
      This is a list of all scouts that have ever been registered for MBU Online.
    </p>
    <closable-error v-if="error || eventLoadError"></closable-error>
    <spinner-page v-if="loading || eventLoading"></spinner-page>
    <div v-else>
      <filter-box :troop.sync="troopFilter"
                  :eventId.sync="eventsFilter"
                  :search.sync="search"
                  :troops="troops"
                  class="scout-list-filters"></filter-box>
      <div v-if="filteredScouts.length > 0">
        <scout-table :scouts="filteredScouts"></scout-table>
      </div>
      <div class="notification"
           v-else>
        <p>
          There are no scouts that match the criteria you specified.
        </p>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';

import URLS from 'urls';
import ScoutTable from './ScoutTable.vue';
import FilterBox from 'components/shared/FilterBox.vue';
import EventsUpdate from 'mixins/EventsUpdate';

export default {
  data () {
    return {
      error: '',
      eventsFilter: null,
      loading: false,
      scouts: [],
      search: '',
      troopFilter: null
    };
  },
  computed: {
    filteredScouts () {
      let scouts = this.scouts;

      if (this.troopFilter) {
        scouts = _.filter(scouts, (scout) => {
          return scout.troop === this.troopFilter;
        });
      }

      if (this.eventsFilter) {
        scouts = _.filter(scouts, (scout) => {
          return _.some(scout.registrations, { "event_id": this.eventsFilter });
        });
      }

      return scouts = _.filter(scouts, (scout) => {
        return scout.fullname.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    },
    troops () {
      if (!this.scouts) {
        return [];
      }

      return _.orderBy(_.uniq(_.map(this.scouts, ('troop'))));
    }
  },
  methods: {
    dismissError () {
      this.error = '';
    }
  },
  created () {
    this.loading = true;
    axios.get(URLS.SCOUTS_URL)
      .then((response) => {
        this.scouts = response.data;
        this.error = '';
      })
      .catch(() => {
        this.error = 'Failed to retrieve scouts. Please refresh and try again.';
      })
      .then(() => {
        this.loading = false;
      });
  },
  components: {
    FilterBox,
    ScoutTable
  },
  mixins: [
    EventsUpdate
  ]
}
</script>

<style lang="scss" scoped>
.notification {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.scout-list-filters {
  margin-top: 2rem;
}
</style>
