<template>
  <div class="notification is-danger"
       v-if="!dismissed">
    <button class="delete"
            @click="dismiss"></button>
    <slot>
      An error occured. Please refresh the page to try again, or come back later.
    </slot>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dismissed: false
    }
  },
  methods: {
    dismiss () {
      this.dismissed = true;
      this.$emit('dismissed');
    }
  }
}
</script>

