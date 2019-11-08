<template>
  <div>
    <h3 class="title is-4">Your Troop</h3>
    <p>
      This is an overview of the scouts that you have added to your troop. You can add
      new scouts, edit scout information, and remove scouts from your troop.
    </p>
    <br>
    <closable-error v-if="error"
                    @dismissed="dismissError()">{{ error }}</closable-error>
    <spinner-page v-if="loading"></spinner-page>
    <div v-else>
      <button class="button is-primary"
              v-if="!displayAddScout"
              @click="toggleAdd()">
        Add a new scout
      </button>
      <create-scout v-if="displayAddScout"
                    @close="toggleAdd()"></create-scout>
      <br>
      <div class="box scout-list-filters">
        <div class="columns">
          <div class="column is-6">
            <div class="field is-horizontal">
              <div class="field-label is-normal">
                <label class="label"
                       for="scout-list-sort-filter">Sort&nbsp;by:</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <span class="select">
                      <select id="scout-list-sort-filter"
                              v-model="sortBy">
                        <option v-for="option in orders"
                                :value="option.value"
                                :key="option.value">
                          {{ option.text }}
                        </option>
                      </select>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="column is-6">
            <div class="search-container field is-horizontal">
              <div class="field-label is-normal">
                <label class="label"
                       for="scout-list-find">Search:</label>
              </div>
              <div class="field-body">
                <div class="field">
                  <div class="control">
                    <input class="input"
                           id="scout-list-find"
                           v-model="search">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="scout-list">
        <scout v-for="scout in filteredScouts"
               :scout="scout"
               :key="scout.id"></scout>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import _ from 'lodash';

import Create from './Create.vue';
import Scout from './Scout.vue';

export default {
  data () {
    return {
      error: '',
      displayAddScout: false,
      sortBy: 'lastname',
      orders: [
        { value: 'firstname', text: 'First Name' },
        { value: 'lastname', text: 'Last Name' },
        { value: 'created_at', text: 'Date Added' },
        { value: 'updated_at', text: 'Date Updated' }
      ],
      search: '',
      loading: false
    };
  },
  computed: {
    ...mapGetters([
      'profile',
      'scouts'
    ]),
    orderedScouts () {
      return _.orderBy(this.scouts, this.sortBy);
    },
    filteredScouts () {
      return _.filter(this.orderedScouts, (scout) => {
        return scout.fullname.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
    }
  },
  methods: {
    toggleAdd () {
      this.displayAddScout = !this.displayAddScout;
    },
    clearSearch () {
      this.search = '';
    },
    dismissError () {
      this.error = '';
    }
  },
  components: {
    'create-scout': Create,
    Scout
  },
  created () {
    this.loading = true;
    this.$store.dispatch('getScouts', this.profile.id)
      .then(() => {
        this.loading = false;
        this.error = '';
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Failed to load scouts. Please refresh, or try again later.';
      });
  }
}
</script>

<style lang="scss" scoped>
.scout-list-filters {
  margin-top: 2em;
}

.search-container {
  max-width: 100%;
}
</style>
