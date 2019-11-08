<template>
  <div>
    <b>{{ item.item }}</b>:
    <span v-if="item.details.size">(Size {{ item.details.size | upperCase }})</span>
    {{ item.price | currency }} &times; {{ item.details.quantity }} =
    {{ item.price * item.details.quantity | currency }}
    <button class="button is-danger is-small"
            :class="{ 'is-loading': deleting }"
            id="delete-purchased-item"
            :disabled="deleting"
            @click="deleteItem()">
      <span class="fa fa-trash"></span>
    </button>
    <button class="button is-warning is-small"
            v-if="error"
            id="delete-warning"
            v-tooltip="'Failed to remove item. Please refresh or try again later.'">
      <span class="fa fa-exclamation-triangle"></span>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    },
    registrationId: {
      required: true
    },
    scoutId: {
      required: true
    },
    eventId: {
      required: true
    }
  },
  data () {
    return {
      deleting: false,
      error: ''
    };
  },
  methods: {
    deleteItem () {
      this.deleting = true;

      this.$store.dispatch('deletePurchase', {
        registrationId: this.registrationId,
        scoutId: this.scoutId,
        purchasableId: this.item.id
      })
        .then(() => {
          this.error = '';
          this.$store.dispatch('getPurchasables', { eventId: this.eventId });
        })
        .catch(() => {
          this.error = 'Unable to delete. Please try again or contact an administration';
        })
        .then(() => {
          this.deleting = false;
        });
    },
  }
}
</script>

<style lang="scss" scoped>
button.is-warning {
  cursor: default;
}
</style>
