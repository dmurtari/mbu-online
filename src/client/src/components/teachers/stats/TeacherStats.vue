<template>
  <div>
    <h4 class="title is-4">Statistics</h4>
    <p>
      This page summarizes event information.
    </p>
    <stats-list list-link="list"
                detail-link="detail"></stats-list>
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
