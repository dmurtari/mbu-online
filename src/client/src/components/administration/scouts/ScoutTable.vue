<template>
  <paginated-items :target="'scouts'"
                   :contents="orderedScouts"
                   :showLinks="true"
                   :table="true">
    <thead slot="heading">
      <tr>
        <th @click="sort('firstname')"
            class="sortable"
            :class="{ 'sorted-column': order === 'firstname' }">
          First Name
          <span class="icon is-small"
                v-if="order === 'firstname'">
            <span v-if="sortAscending"
                  class="fa fa-sort-alpha-asc"></span>
            <span v-else
                  class="fa fa-sort-alpha-desc"></span>
          </span>
        </th>
        <th @click="sort('lastname')"
            class="sortable"
            :class="{ 'sorted-column': order === 'lastname' }">
          Last Name
          <span class="icon is-small"
                v-if="order === 'lastname'">
            <span v-if="sortAscending"
                  class="fa fa-sort-alpha-asc"></span>
            <span v-else
                  class="fa fa-sort-alpha-desc"></span>
          </span>
        </th>
        <th @click="sort('troop')"
            class="sortable"
            :class="{ 'sorted-column': order === 'troop' }">
          Troop
          <span class="icon is-small"
                v-if="order === 'troop'">
            <span v-if="sortAscending"
                  class="fa fa-sort-numeric-asc"></span>
            <span v-else
                  class="fa fa-sort-numeric-desc"></span>
          </span>
        </th>
        <th>Coordinator</th>
        <th colspan="1"></th>
      </tr>
    </thead>
    <template slot="row"
              slot-scope="props">
      <scout-row :id="props.item.scout_id"
                 :firstname="props.item.firstname"
                 :lastname="props.item.lastname"
                 :troop="props.item.troop"
                 :registration="props.item.registrations"
                 :user="props.item.user">
      </scout-row>
    </template>
  </paginated-items>
</template>

<script>
import _ from 'lodash';

import ScoutRow from './ScoutRow.vue';

export default {
  props: {
    scouts: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      order: 'troop',
      sortAscending: true,
    }
  },
  computed: {
    orderedScouts () {
      let sortOrder = this.sortAscending ? 'asc' : 'desc';
      return _.orderBy(this.scouts, this.order, sortOrder);
    }
  },
  methods: {
    sort (order) {
      if (order === this.order) {
        this.sortAscending = !this.sortAscending;
      } else {
        this.order = order;
        this.sortAscending = true;
      }
    }
  },
  components: {
    ScoutRow
  }
}
</script>

<style lang="scss" scoped>

</style>
