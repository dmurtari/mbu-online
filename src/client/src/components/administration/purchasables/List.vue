<template>
  <div>
    <h4 class="title is-4">
      Manage Purchasable Items
    </h4>
    <p>
      Use this page to manage items that scouts can purchase for events (for example: lunches,
      t-shirts, or patches). You can give each item a name, description, as well as
      restrict the age range of scouts can purchase an item. Scouts will be able to
      specify which and how many of each item they would like to purchase when they
      register.
    </p>
    <closable-error v-if="eventLoadError"></closable-error>
    <spinner-page v-if="eventLoading"></spinner-page>
    <div v-else>
      <div class="box purchasable-list-filters">
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
        </div>
      </div>
      <div class="notification"
           v-if="eventId === ''">
        Please pick an event to add offerings to. You can also
        <router-link to="/administration/events/all">add an event</router-link>
        if you haven't added any events already.
      </div>
      <div v-else>
        <button class="button is-primary"
                v-if="!showCreate"
                @click="toggleCreate()">Add a New Item</button>
        <create-purchasable v-if="showCreate"
                            @close="toggleCreate()"
                            :eventId="eventId"></create-purchasable>
        <div class="purchasable-list">
          <purchasable v-for="purchasable in purchasables"
                       :key="purchasable.id"
                       :purchasable="purchasable"
                       :eventId="eventId"></purchasable>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

import EventsUpdate from 'mixins/EventsUpdate';
import Create from './Create.vue';
import Purchasable from './Purchasable.vue';

export default {
  data () {
    return {
      error: '',
      eventId: '',
      loading: false,
      showCreate: false
    };
  },
  computed: {
    ...mapGetters([
      'orderedEvents'
    ]),
    purchasables () {
      let event = _.find(this.orderedEvents, { id: this.eventId });

      if (!event) {
        return [];
      }

      return _.orderBy(event.purchasables, 'item');
    }
  },
  methods: {
    pickEvent (eventId) {
      this.eventId = eventId;
    },
    toggleCreate () {
      this.showCreate = !this.showCreate;
    }
  },
  components: {
    'create-purchasable': Create,
    Purchasable
  },
  mixins: [
    EventsUpdate
  ]
}
</script>

<style lang="scss" scoped>
.purchasable-list-filters {
  margin-top: 2em;
}

.purchasables-loading {
  margin-top: 5em;
  width: 5em;
  display: block;
  margin: auto;
}

.purchasable-list {
  margin-top: 2em;
}
</style>
