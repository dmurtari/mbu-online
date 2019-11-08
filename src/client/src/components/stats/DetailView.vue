<template>
  <div>
    <attendance-row v-for="registration in registrations"
                    :key="registration.id"
                    :registration="registration"
                    :event="event"></attendance-row>
  </div>
</template>

<script>
import AttendanceRow from './TroopAttendanceRow.vue';

export default {
  props: {
    event: {
      type: Object,
      required: true
    },
    registrations: {
      type: Array,
      required: true
    }
  },
  components: {
    AttendanceRow
  }
}
</script>

