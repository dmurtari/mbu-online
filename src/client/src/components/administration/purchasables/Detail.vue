<template>
  <div>
    <div>
      <p>
        <b>Item Name: </b>{{ purchasable.item }}
      </p>
      <p>
        <b>Price: </b>{{ purchasable.price | currency }}
      </p>
      <p v-if="purchasable.description">
        <b>Description: </b>{{ purchasable.description }}
      </p>
      <p v-if="purchasable.purchaser_limit">
        <b>Purchase Limit: </b>{{ purchasable.purchaser_limit }}
      </p>
      <p>
        <b>Quantity Purchased: </b>{{ purchasable.purchaser_count }}
      </p>
      <p v-if="purchasable.has_size">
        <br>
        Scouts can pick a size for this item
      </p>
      <br>
      <p>
        The minimum purchaser age is: {{ purchasable.minimum_age ? purchasable.minimum_age : 'not set' }}
      </p>
      <p>
        The maximum purchaser age is: {{ purchasable.maximum_age ? purchasable.maximum_age : 'not set' }}
      </p>
    </div>
    <div class="buyers-container">
      <a @click="toggleBuyers()">
        <h5 class="title is-5">Buyers<span class="toggle-icons">
            <span v-if="showingBuyers"
                  class="fa fa-chevron-circle-up"></span>
            <span v-else
                  class="fa fa-chevron-circle-down"></span>
          </span>
        </h5>
      </a>
      <closable-error v-if="error">{{ error }}</closable-error>
      <centered-spinner v-if="loading"></centered-spinner>
      <paginated-items v-if="!error && !loading && showingBuyers"
                       :target="'buyers'"
                       :contents="orderedBuyers"
                       :showLinks="true"
                       :table="true"
                       :ignoreRoute="true">
        <thead slot="heading">
          <tr>
            <th @click="sort('scout.firstname')"
                class="sortable"
                :class="{ 'sorted-column': order === 'scout.firstname' }">
              First Name
              <span class="icon is-small"
                    v-if="order === 'scout.firstname'">
                <span v-if="sortAscending"
                      class="fa fa-sort-alpha-asc"></span>
                <span v-else
                      class="fa fa-sort-alpha-desc"></span>
              </span>
            </th>
            <th @click="sort('scout.lastname')"
                class="sortable"
                :class="{ 'sorted-column': order === 'scout.lastname' }">
              Last Name
              <span class="icon is-small"
                    v-if="order === 'scout.lastname'">
                <span v-if="sortAscending"
                      class="fa fa-sort-alpha-asc"></span>
                <span v-else
                      class="fa fa-sort-alpha-desc"></span>
              </span>
            </th>
            <th @click="sort('scout.troop')"
                class="sortable"
                :class="{ 'sorted-column': order === 'scout.troop' }">
              Troop
              <span class="icon is-small"
                    v-if="order === 'scout.troop'">
                <span v-if="sortAscending"
                      class="fa fa-sort-numeric-asc"></span>
                <span v-else
                      class="fa fa-sort-numeric-desc"></span>
              </span>
            </th>
          </tr>
        </thead>
        <tr slot="row"
            slot-scope="props">
          <td>
            {{ props.item.scout.firstname }}
          </td>
          <td>
            {{ props.item.scout.lastname }}
          </td>
          <td>
            {{ props.item.scout.troop }}
          </td>
        </tr>
      </paginated-items>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash';

import URLS from 'urls';

export default {
  data() {
    return {
      loading: false,
      order: 'scout.troop',
      error: '',
      buyers: undefined,
      showingBuyers: false,
      sortAscending: true
    };
  },
  props: {
    purchasable: {
      type: Object,
      required: true
    }
  },
  computed: {
    orderedBuyers() {
      let sortOrder = this.sortAscending ? 'asc' : 'desc';
      return _.orderBy(this.buyers, this.order, sortOrder);
    }
  },
  methods: {
    dismissError() {
      this.error = '';
    },
    toggleBuyers() {
      this.showingBuyers = !this.showingBuyers;

      if (this.showingBuyers && typeof this.buyers === 'undefined') {
        this.loadBuyers();
      }
    },
    loadBuyers() {
      this.loading = true;

      axios
        .get(
          `${URLS.EVENTS_URL}/${this.purchasable.event_id}/purchasables/${this.purchasable.id}/buyers`
        )
        .then(response => {
          this.buyers = response.data;
          this.error = '';
        })
        .catch(() => {
          this.error =
            'Failed to get buyers. Please refresh or try again later';
        })
        .then(() => {
          this.loading = false;
        });
    },
    sort(order) {
      if (order === this.order) {
        this.sortAscending = !this.sortAscending;
      } else {
        this.order = order;
        this.sortAscending = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.buyers-container {
  padding-top: 2rem;
}

.toggle-icons {
  padding-left: 10px;
}
</style>
