<template>
  <tr>
    <td>{{ badge }}</td>
    <td>{{ duration }}</td>
    <td>{{ sizeInfo.size_limit }}</td>
    <td>{{ sizeInfo.total }}</td>
    <td v-for="n in 3"
        :key="n">
      <span :class="{ 'is-light': !offeredForPeriod(n) }">
        {{ sizeInfo[n] }}
      </span>
    </td>
    <td>
      <router-link :to="eventId + '/' + id">
        Details
      </router-link>
    </td>
  </tr>
</template>

<script>

export default {
  props: {
    id: {
      type: Number,
      required: true
    },
    eventId: {
      type: Number,
      required: true
    },
    badge: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    sizeInfo: {
      type: Object,
      required: true
    },
    offeredPeriods: {
      type: Array,
      required: true
    }
  },
  methods: {
    offeredForPeriod(period) {
      return this.offeredPeriods.indexOf(period) > -1;
    }
  }
};
</script>

<style scoped lang="scss">
span.is-light {
  color: lightgray;
}
</style>
