<template>
  <div>
    <h4 class="title is-4">Event Attendances</h4>
    <p>
      Use this page to view and manage scouts' event attendance information, such as editing
      class assignments and viewing totals due for each scout. You can also view attendance
      and price information for a specific troop by selecting that troop from the dropdown.
    </p>
    <stats-list list-link="list"
                detail-link="detail"></stats-list>
  </div>
</template>

<script>
import StatsList from 'components/stats/StatsList.vue';

export default {
  components: {
    StatsList
  }
}
</script>
