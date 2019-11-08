<template>
  <div>
    <ul>
      <span v-if="!isTeacher">
        <li>
          <b>{{ isCoordinator ? 'Total Due' : 'Total Income' }} (all scouts): </b>
          <span v-if="totalDue">{{ totalDue | currency }}</span>
          <span v-else>Calculating...</span>
        </li>
        <br>
      </span>
      <li>
        <b>Showing Information for: </b>
        {{ registrations.length }} {{ registrations.length == 1 ? 'scout' : 'scouts'}}
      </li>
      <li>
        <b>
          Total for {{ registrations.length }} {{ registrations.length == 1 ? 'scout' : 'scouts'}}
          shown:
        </b>
        <span>{{ subtotal | currency }}</span>
      </li>
      <br>
      <li>
        <b>Event Registration Fees: </b>
        <span>
          {{ registrations.length * Number(event.price) | currency }} ({{ registrations.length
          }} &times; {{ event.price | currency }})
        </span>
      </li>
      <li>
        <b>Merit Badge Fees: </b>
        <span>{{ subcost('assignments') | currency }}</span>
      </li>
      <li>
        <b>Purchase Costs: </b>
        <span>{{ subcost('purchases') | currency }}</span>
      </li>
      <purchased-items :registrations="registrations"
                       class="purchased-items"></purchased-items>
    </ul>
  </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import URLS from 'urls';

import { mapGetters } from 'vuex';

import PurchasedItems from './PurchasedItems.vue';

export default {
  props: {
    event: {
      type: Object,
      required: true
    },
    registrations: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      error: '',
      loading: false,
      totalDue: null
    };
  },
  computed: {
    ...mapGetters([
      'profile',
      'isTeacher'
    ]),
    isCoordinator () {
      return this.profile.role === "coordinator";
    },
    subtotal () {
      return this.subcost('assignments') + this.subcost('purchases') +
        this.registrations.length * Number(this.event.price);
    }
  },
  methods: {
    subcost (property) {
      if (!property) {
        return 0;
      }

      return _.reduce(this.registrations, (sum, registration) => {
        return sum += _.reduce(registration[property], (subsum, property) => {
          return subsum += Number(property.price) * (Number(property.details.quantity) || 1);
        }, 0);
      }, 0);
    }
  },
  mounted () {
    if (this.registrations.length > 0 && !this.isTeacher) {
      let requestURL = this.isCoordinator ?
        URLS.USERS_URL + this.profile.id + '/events/' + this.event.id + '/cost' :
        URLS.EVENTS_URL + this.event.id + '/income';

      return axios.get(requestURL)
        .then((response) => {
          this.totalDue = this.isCoordinator ? response.data.cost : response.data.income;
          this.error = '';
        })
        .catch(() => {
          this.error = 'Failed to get the necessary information for statistics.';
        })
        .then(() => {
          this.loading = false;
        });
    }
  },
  components: {
    PurchasedItems
  }
}
</script>

<style lang="scss">
.purchased-items {
  padding-left: 1rem;
}
</style>
