<template>
  <div>
    <h4 class="title is-4">Event Attendances</h4>
    <p>
      This page contains information regarding your troop's attendance for MBU
      events such as class assignments and purchases for individual scouts, and
      total amount due for each scout as well as your troop
    </p>
    <stats-list list-link="/coordinator/attendance/list"
                detail-link="/coordinator/attendance/detail"></stats-list>
  </div>
</template>

<script>
import StatsList from '../../stats/StatsList.vue';

export default {
  components: {
    StatsList
  }
}
</script>

