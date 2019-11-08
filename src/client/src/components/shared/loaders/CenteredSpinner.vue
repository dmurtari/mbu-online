<template>
  <div class="loader-container">
    <moon-loader :color="'lightgray'"
                 class="moon-spinner">
    </moon-loader>
  </div>
</template>

<script>
import MoonLoader from 'vue-spinner/src/MoonLoader.vue'

export default {
  components: {
    MoonLoader
  }
}
</script>


<style lang="scss" scoped>
.loader-container {
  flex-grow: 1;
}

.moon-spinner {
  width: 5em;
  display: block;
  margin: auto;
}
</style>

