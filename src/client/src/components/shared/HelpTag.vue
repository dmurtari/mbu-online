<template>
  <span class="icon question-icon"
        v-tooltip.top="text">
      <span class="fa fa-question-circle">
      </span>
  </span>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    },
    length: {
      type: String,
      default: 'large'
    }
  }
}
</script>

<style lang="scss" scoped>
  .question-icon:hover {
    cursor: pointer
  }
</style>
