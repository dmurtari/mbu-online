<template>
  <paginated-items :target="'registrations'"
                   :contents="registrations"
                   :showLinks="true"
                   :table="true">
    <thead slot="heading">
      <tr>
        <th width="10%">Scout</th>
        <th width="8%">Troop</th>
        <th v-for="n in 3"
            :key="n"
            width="19%">
          Period {{ n }}
        </th>
        <th width="15%">Purchases</th>
        <th width="10%"
            v-if="event">Total Due</th>
      </tr>
    </thead>
    <template slot="row"
              slot-scope="props">
      <stats-row :event="event"
                 :registration="props.item"></stats-row>
    </template>
  </paginated-items>
</template>

<script>
import StatsRow from './StatsRow.vue';

export default {
  props: {
    event: {
      type: Object
    },
    registrations: {
      type: Array,
      required: true
    }
  },
  components: {
    StatsRow
  }
}
</script>
