<template>
  <div>
    <h4 v-if="isList"
        class="title is-4">All Classes</h4>
    <h4 v-else
        class="title is-4">
      <router-link to="../all">
        All Classes
      </router-link>
      /&nbsp;{{ title }}
    </h4>
    <closable-error v-if="eventLoadError"></closable-error>
    <spinner-page v-if="eventLoading"></spinner-page>
    <router-view v-else
                 @title="setTitle($event)"></router-view>
  </div>
</template>

<script>
import EventsUpdate from 'mixins/EventsUpdate';

const listRegex = /.*all\/?$/

export default {
  data () {
    return {
      title: 'Class Details'
    };
  },
  computed: {
    isList () {
      return listRegex.test(this.$route.path);
    }
  },
  methods: {
    setTitle (title) {
      this.title = title;
    }
  },
  mixins: [
    EventsUpdate
  ]
}
</script>
