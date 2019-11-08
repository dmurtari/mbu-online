<template>
  <div class="box filters">
    <div class="columns is-multiline">
      <div class="column is-6">
        <horizontal-field>
          <span slot="field-label">Registered:</span>
          <events-dropdown slot="field-contents"
                           @select="updateQuery('eventId', Number($event))"></events-dropdown>
        </horizontal-field>
      </div>
      <div class="column is-6">
        <horizontal-field>
          <span slot="field-label">Troop:</span>
          <span class="input-group select"
                slot="field-contents">
            <select class="input"
                    v-model="troopProp"
                    @change="updateQuery('troop', $event.target.value ? Number($event.target.value) : null)">
              <option :value="null">All Troops</option>
              <option v-for="troop in troops"
                      :value="troop"
                      :key="troop">
                {{ troop }}
              </option>
            </select>
          </span>
        </horizontal-field>
      </div>
      <div class="column is-6">
        <horizontal-field>
          <span slot="field-label">Name:</span>
          <input class="input is-expanded"
                 slot="field-contents"
                 id="scout-list-find"
                 v-model="searchProp"
                 @input="updateQuery('search', $event.target.value)">
        </horizontal-field>
      </div>
      <div class="column is-6">
        <div class="field is-grouped">
          <div class="control is-pulled-right">
            <button class="button is-pulled-right"
                    @click.prevent="reset()">Reset Filters</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import HorizontalField from './HorizontalField.vue';

export default {
  props: {
    eventId: Number,
    troop: Number,
    search: String,
    troops: Array
  },
  data () {
    return {
      eventIdProp: this.eventId,
      troopProp: this.troop,
      searchProp: this.search,
    };
  },
  methods: {
    reset () {
      this.troopProp = null;
      this.searchProp = null;

      this.updateQuery('troop', null);
      this.updateQuery('search', '');
    },
    sendUpdate (field, value) {
      this.$emit('update:' + field, value);
    },
    updateQuery (field, value) {
      let query = _.clone(this.$route.query);

      if (value === null) {
        delete query[field];
      } else {
        query[field] = value;
      }

      this.$router.replace({
        query: query
      });

      this.sendUpdate(field, value);
    }
  },
  watch: {
    troopProp (newVal, oldVal) {
      if (newVal === undefined) {
        this.troopProp = oldVal;
      }
    },
    troops () {
      if (!_.includes(this.troops, this.troopProp)) {
        this.troopProp = null;
        this.updateQuery('troop', null);
      }
    }
  },
  mounted () {
    let query = this.$route.query;

    if (query.troop) {
      this.troopProp = query.troop;
      this.sendUpdate('troop', Number(query.troop));
    }

    if (query.eventId) {
      this.eventIdProp = query.eventId;
      this.sendUpdate('eventId', Number(query.eventId));
    }

    if (query.search) {
      this.searchProp = query.search;
      this.sendUpdate('search', query.search);
    }
  },
  components: {
    HorizontalField
  }
}
</script>
