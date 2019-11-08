<template>
  <span class="dropdown">
    <a href="#"
       class="dropdown-toggle"
       data-toggle="dropdown"
       aria-haspopup="true"
       aria-expanded="true">
      {{ title[displayKey] }}
      <span class="caret"></span>
    </a>
    <ul class="dropdown-menu">
      <li v-for="object in objects"
          :key="object">
        <a href="#"
           @click="selected(object)">{{ object[displayKey] }}</a>
      </li>
    </ul>
  </span>
</template>

<script>
export default {
  props: {
    objects: {
      type: Array,
      required: true
    },
    initial: Object,
    displayKey: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      title: ''
    };
  },
  methods: {
    selected (object) {
      this.title = object;
      this.$emit('select', object.id);
    }
  },
  mounted () {
    this.title = this.initial || this.objects[0];
  }
}
</script>