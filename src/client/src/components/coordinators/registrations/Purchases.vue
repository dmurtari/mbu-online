<template>
  <div>
    <h5 class="title is-5">
      Items Available for Purchase ({{ event.semester }} {{ event.year }})
    </h5>
    <p>
      Add items that this scout would like to purchase for this event by picking an item from the dropdown,
      and entering a quantity and size (if applicable). View details about these items on the
      <router-link to="/events">events page.
      </router-link>
    </p>
    <br>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <div class="columns is-mobile"
         v-if="availableItems.length > 0">
      <div class="field column is-3-mobile is-5-tablet">
        <label class="label"
               for="purchasable-item-select">Item</label>
        <div class="control">
          <span class="select">
            <select id="purchasable-item-select"
                    class="input"
                    v-model="itemToPurchase.purchasable">
              <option v-for="purchasable in availableItems"
                      :value="purchasable"
                      :key="purchasable.id">
                {{ purchasable.item }} ({{ purchasable.price | currency }})
              </option>
            </select>
          </span>
        </div>
      </div>
      <div class="field column is-3-mobile is-2-tablet">
        <label class="label"
               for="purchasable-item-quantity">
          Quantity
        </label>
        <div class="control">
          <input type="number"
                 class="input"
                 id="purchasable-item-quantity"
                 :class="{ 'is-danger': $v.itemToPurchase.quantity.$error && itemToPurchase.purchasable }"
                 @blur="$v.itemToPurchase.quantity.$touch"
                 v-model="itemToPurchase.quantity">
        </div>
        <template v-if="$v.itemToPurchase.quantity.$error && itemToPurchase.purchasable">
          <span class="help is-danger"
                v-if="!$v.itemToPurchase.quantity.positive">
            Please enter a number greater than 0
          </span>
          <span class="help is-danger"
                v-if="!$v.itemToPurchase.quantity.maxValue">
            You cannot purchase more than are available
          </span>
        </template>
        <span v-if="itemToPurchase.purchasable.purchaser_limit"
              :class="{ 'is-danger':!$v.itemToPurchase.quantity.maxValue && $v.itemToPurchase.quantity.$error }"
              class="help">
          ({{ itemToPurchase.purchasable.purchaser_limit - itemToPurchase.purchasable.purchaser_count }} available)
        </span>
      </div>
      <div class="field column is-3-mobile is-2-tablet"
           v-if="itemToPurchase.purchasable.has_size">
        <label class="label"
               for="purchasable-item-size">Size</label>
        <div class="control">
          <span class="select">
            <select type="select"
                    class="input"
                    v-model="itemToPurchase.size"
                    :disabled="!itemToPurchase.purchasable || !itemToPurchase.purchasable.has_size">
              <option v-for="size in sizes"
                      :key="size.value"
                      :value="size.value">
                {{ size.text }}
              </option>
            </select>
          </span>
        </div>
      </div>
      <div class="column auto">
        <label class="label">&nbsp;</label>
        <div class="field is-grouped save-controls">
          <div class="control">
            <button class="button is-primary"
                    :class="{ 'is-loading': creating }"
                    :disabled="creating || $v.$invalid"
                    @click="purchaseItem()">
              <span class="fa fa-check"></span>
            </button>
          </div>
          <div class="control">
            <button class="button is-light"
                    :disabled="creating"
                    @click="clearItem()">
              <span class="fa fa-times"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="notification"
         v-else>
      <p>
        <span v-if="existingPurchases.length > 0">
          This scout has already purchased all items availabe at this event.
        </span>
        <span v-else>
          There are no items listed as available for purchase at this event. Please check back later.
        </span>
      </p>
    </div>
    <div v-if="existingPurchases.length > 0">
      <h5 class="title is-5">
        Items Already Purchased ({{ event.semester }} {{ event.year }})
      </h5>
      <purchased-item v-for="item in existingPurchases"
                      :key="item.id"
                      :item="item"
                      :registrationId="registrationId"
                      :scoutId="scoutId"
                      :eventId="event.id"
                      class="purchased-item"></purchased-item>
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { number } from 'validators';
import _ from 'lodash';

import PurchasedItem from './PurchasedItem.vue';

export default {
  props: {
    event: {
      type: Object,
      required: true
    },
    registrationId: {
      required: true
    },
    scoutId: {
      required: true
    },
    existingPurchases: {
      type: Array
    },
    purchasables: {
      type: Array
    }
  },
  data() {
    return {
      itemToPurchase: {
        purchasable: '',
        quantity: '',
        size: ''
      },
      sizes: [
        { value: 'xs', text: 'XS' },
        { value: 's', text: 'S' },
        { value: 'm', text: 'M' },
        { value: 'l', text: 'L' },
        { value: 'xl', text: 'XL' }
      ],
      error: '',
      creating: false,
      deleting: false
    };
  },
  computed: {
    orderedPurchasables() {
      return _.orderBy(this.purchasables, 'item');
    },
    availableItems() {
      return _.filter(this.orderedPurchasables, (purchasable) => {
        return !_.find(this.existingPurchases, { 'id': purchasable.id });
      });
    },
    shouldShowPurchases() {
      return this.existingPurchases.length > 0;
    }
  },
  methods: {
    clearItem() {
      this.itemToPurchase = {
        purchasable: '',
        quantity: '',
        size: ''
      };
    },
    purchaseItem() {
      let purchase = {
        purchasable: this.itemToPurchase.purchasable.id,
        quantity: this.itemToPurchase.quantity ? this.itemToPurchase.quantity : 0
      }

      if (this.itemToPurchase.size) {
        purchase.size = this.itemToPurchase.size;
      }

      this.creating = true;
      this.$store.dispatch('addPurchase', {
        registrationId: this.registrationId,
        scoutId: this.scoutId,
        purchase: purchase
      })
        .then(() => {
          this.error = '';
          this.clearItem();
          this.$store.dispatch('getPurchasables', { eventId: this.event.id });
        })
        .catch(() => {
          this.error = 'Unable to purchase item. Please refresh and try again';
        })
        .then(() => {
          this.creating = false;
        });
    }
  },
  validations: {
    itemToPurchase: {
      quantity: {
        required,
        number,
        positive: (value) => { return value > 0 },
        maxValue: function (value) {
          return !this.itemToPurchase.purchasable.purchaser_limit || value <= (this.itemToPurchase.purchasable.purchaser_limit - this.itemToPurchase.purchasable.purchaser_count)
        }
      }
    }
  },
  components: {
    PurchasedItem
  }
}
</script>

<style class="scss" scoped>
.delete-button {
  cursor: pointer;
}

.purchased-item {
  margin-top: 0.25rem;
  margin-left: 1rem;
}

.save-controls {
  justify-content: flex-end;
}
</style>
