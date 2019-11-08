<template>
  <div>
    <p>{{ badge.description }}</p>
    <p v-if="badge.notes">
      <br>
      <b>Notes:</b> {{ badge.notes }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    badge: {
      type: Object,
      required: true
    }
  }
}  
</script>