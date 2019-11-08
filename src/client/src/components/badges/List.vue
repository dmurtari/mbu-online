<template>
  <div>
    <h3 class="title is-3">
      All Badges ({{ totalBadges }} Total)
    </h3>
    <closable-error v-if="error">{{ error }}</closable-error>
    <spinner-page v-if="loading"></spinner-page>
    <div v-else>
      <button class="button is-primary"
              v-if="isAdmin && !displayAddBadge"
              @click="toggleAdd()">
        Add a Badge
      </button>
      <badge-create @close="toggleAdd()"
                    v-show="displayAddBadge"></badge-create>
      <div class="badge-list">
        <span v-if="badges.length < 1">
          <div class="notification">
            <p>
              No badges have been added yet.
              <span v-if="isAdmin">
                <br> You will not be able to create any merit badge offerings for an
                event until you add badges.
                <a @click.prevent="toggleAdd()"
                   v-if="!displayAddBadge">
                  Add the first badge?
                </a>
              </span>
            </p>
          </div>
        </span>
        <badge v-for="badge in badges"
               :badge="badge"
               :key="badge.id"></badge>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Badge from './Badge.vue';
import BadgeCreate from './Create.vue';

import ClosableError from 'components/shared/ClosableError.vue';

export default {
  data () {
    return {
      error: '',
      loading: false,
      displayAddBadge: false
    };
  },
  computed: {
    ...mapGetters([
      'isAdmin',
      'badges'
    ]),
    totalBadges () {
      return this.badges.length;
    }
  },
  methods: {
    toggleAdd () {
      this.displayAddBadge = !this.displayAddBadge;
    }
  },
  components: {
    Badge,
    BadgeCreate,
    ClosableError
  },
  created () {
    this.loading = true;
    this.$store.dispatch('getBadges')
      .then(() => {
        this.error = '';
      })
      .catch(() => {
        this.error = 'Failed to load badges';
      })
      .then(() => {
        this.loading = false;
      });
  }
}
</script>

<style lang="scss">
.badge-list {
  margin-top: 2em;
}
</style>
