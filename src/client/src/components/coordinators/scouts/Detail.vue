<template>
  <div class="columns">
    <div class="column is-6">
      <p>
        <strong>Added On:</strong> {{ scout.created_at | shortDate }}
      </p>
      <p>
        <strong>Birthday:</strong> {{ scout.birthday | shortDate }}
      </p>
      <p>
        <strong>Age:</strong> {{ scout.age }}
      </p>
      <p>
        <strong>Troop:</strong> {{ scout.troop }}
      </p>
      <p v-if="scout.notes">
        <strong>Notes:</strong> {{ scout.notes }}
      </p>
    </div>
    <div class="column is-6">
      <h6 class="title is-6">
        <b>Emergency Contact:</b>
      </h6>
      <p>
        <strong>Name:</strong> {{ scout.emergency_name }}
      </p>
      <p>
        <strong>Relationship to Scout:</strong> {{ scout.emergency_relation }}
      </p>
      <p>
        <strong>Contact Number:</strong> {{ scout.emergency_phone }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    scout: {
      type: Object,
      required: true
    }
  }
}
</script>