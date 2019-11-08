<template>
  <events-list>
    <div slot="title">
      <h4 class="title is-4">
        All Events
      </h4>
      <p>
        This is a list of all events that have been added to this website.
      </p>
      <br>
    </div>
  </events-list>
</template>

<script>
import EventsList from '../../events/List.vue';

export default {
  components: {
    EventsList
  }
}
</script>