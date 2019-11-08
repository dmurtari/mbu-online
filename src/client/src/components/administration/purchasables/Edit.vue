<template>
  <div>
    <form v-if="!deleting">
      <div class="columns is-multiline">
        <div class="field column is-6">
          <label class="label"
                 for="purchasable-update-item">Item Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="purchasable-update-item"
                   placeholder="New Item"
                   :class="{ 'is-danger': $v.purchasableUpdate.item.$error }"
                   @blur="$v.purchasableUpdate.item.$touch"
                   v-model="purchasableUpdate.item">
          </div>
          <span class="help is-danger"
                v-if="$v.purchasableUpdate.item.$error">
            Please enter the name of the item
          </span>
        </div>
        <div class="field column is-6">
          <label class="label"
                 for="purchasable-update-price">Price</label>
          <div class="control">
            <input type="number"
                   class="input"
                   placeholder="10.00"
                   id="purchasable-update-price"
                   :class="{ 'is-danger': $v.purchasableUpdate.price.$error }"
                   @blur="$v.purchasableUpdate.price.$touch"
                   v-model="purchasableUpdate.price">
          </div>
          <span class="help is-danger"
                v-if="$v.purchasableUpdate.price.$error">
            Please enter the price of the item
          </span>
        </div>
        <div class="field column is-12">
          <label class="label"
                 for="purchasable-update-description">Description</label>
          <div class="control">
            <textarea class="textarea"
                      id="purchasable-update-description"
                      rows="2"
                      placeholder="Description of this item"
                      v-model="purchasableUpdate.description"></textarea>
          </div>
        </div>
        <div class="field column is-6">
          <label class="label"
                 for="purchasable-update-min-age">Minimum Age (If Any)</label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="purchasable-update-min-age"
                   :class="{ 'is-danger': $v.purchasableUpdate.minimum_age.$error }"
                   @blur="$v.purchasableUpdate.minimum_age.$touch"
                   v-model="purchasableUpdate.minimum_age">
          </div>
          <span class="help is-danger"
                v-if="!$v.purchasableUpdate.minimum_age.number">
            Minimum age must be a number
          </span>
          <span class="help is-danger"
                v-if="!$v.purchasableUpdate.minimum_age.lessThan">
            Minimum age must be less than maximum age
          </span>
        </div>
        <div class="field column is-6">
          <label class="label"
                 for="purchasable-update-max-age">Maximum Age (If Any)</label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="purchasable-update-max-age"
                   :class="{ 'is-danger': $v.purchasableUpdate.maximum_age.$error }"
                   @blur="$v.purchasableUpdate.maximum_age.$touch"
                   v-model="purchasableUpdate.maximum_age">
          </div>
          <span class="help is-danger"
                v-if="!$v.purchasableUpdate.maximum_age.number">
            Maximum age must be a number
          </span>
          <span class="help is-danger"
                v-if="!$v.purchasableUpdate.maximum_age.greaterThan">
            Maximum age must be greater than minimum age
          </span>
        </div>
        <div class="field column is-6">
          <div class="control">
            <label class="checkbox">
              <input v-model="purchasableUpdate.has_size"
                     type="checkbox"> Allow scouts to select a size
            </label>
          </div>
        </div>
        <div class="field column is-6">
          <div class="control">
            <label class="checkbox">
              <input v-model="hasPurchaseLimit"
                     type="checkbox"> Limit the number of items available for purchase
            </label>
          </div>
        </div>
        <div class="field column is-6"
             v-if="hasPurchaseLimit">
          <label class="label"
                 for="purchase-limit">Number available for purchase</label>
          <div class="control">
            <input type="number"
                   class="input"
                   id="purchase-limit"
                   :class="{ 'is-danger': $v.purchasableUpdate.purchaser_limit.$error }"
                   @blur="$v.purchasableUpdate.purchaser_limit.$touch"
                   v-model="purchasableUpdate.purchaser_limit">
          </div>
          <span class="help is-danger"
                v-if="!$v.purchasableUpdate.purchaser_limit.number">
            Purchase limit must be a number
          </span>
          <span class="help is-danger"
                v-if="!$v.purchasableUpdate.purchaser_limit.greaterThan">
            Purchase limit must be greater than 0
          </span>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.$invalid || saving"
                  :class="{ 'is-loading': saving }"
                  @click.prevent="update()">Save Changes</button>
        </div>
        <div class="control">
          <button class="button"
                  :disabled="saving"
                  @click.prevent="close()">Cancel</button>
        </div>
        <div class="control is-pulled-right">
          <button class="button is-danger"
                  :disabled="saving"
                  @click.prevent="toggleDelete()">Delete Item</button>
        </div>
      </div>
    </form>
    <confirm-delete v-if="deleting"
                    class="container-fluid"
                    :match-text="purchasable.item"
                    :placeholder="'Item Name'"
                    @deleteSuccess="deletePurchasable()"
                    @close="toggleDelete()">
      <span slot="header">
        Do you really want to delete this item? This cannot be undone!
      </span>
      <span slot="help-text">
        Enter the name of the item with correct capitalization to confirm deletion.
        <b>This action cannot be undone, and will remove this item for any scout that
          has purchased it.</b>
      </span>
    </confirm-delete>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { lessThan, greaterThan, number } from 'validators';

export default {
  props: {
    purchasable: {
      type: Object,
      required: true
    },
    eventId: { required: true }
  },
  data() {
    return {
      purchasableUpdate: {
        item: '',
        price: '',
        description: '',
        has_size: false,
        purchaser_limit: undefined,
        minimum_age: '',
        maximum_age: ''
      },
      hasPurchaseLimit: false,
      error: '',
      deleting: false,
      saving: false
    };
  },
  methods: {
    update() {
      this.purchasableUpdate.id = this.purchasable.id;
      this.purchasableUpdate.purchaser_limit = (this.hasPurchaseLimit && this.purchasableUpdate.purchaser_limit) || null;
      this.$store.dispatch('updatePurchasable', {
        eventId: this.eventId,
        purchasable: this.purchasableUpdate
      })
        .then(() => {
          this.error = '';
          this.close();
        })
        .catch(() => {
          this.error = 'Failed to update item. Please refresh and try again.';
        });
    },
    close() {
      this.$emit('close');
    },
    deletePurchasable() {
      this.$store.dispatch('deletePurchasable', {
        eventId: this.eventId,
        purchasableId: this.purchasable.id
      })
        .then(() => {
          this.error = '';
          this.close();
        })
        .catch(() => {
          this.error = 'Failed to delete item. Please refresh and try again.';
        });
    },
    toggleDelete() {
      this.deleting = !this.deleting;
    }
  },
  mounted() {
    this.purchasableUpdate.item = this.purchasable.item;
    this.purchasableUpdate.price = this.purchasable.price;
    this.purchasableUpdate.description = this.purchasable.description;
    this.purchasableUpdate.has_size = this.purchasable.has_size;
    this.purchasableUpdate.minimum_age = this.purchasable.minimum_age;
    this.purchasableUpdate.maximum_age = this.purchasable.maximum_age;
    this.purchasableUpdate.purchaser_limit = this.purchasable.purchaser_limit;
    this.hasPurchaseLimit = !!this.purchasable.purchaser_limit;
  },
  validations: {
    purchasableUpdate: {
      item: { required },
      price: { required },
      minimum_age: {
        number,
        lessThan: lessThan('maximum_age')
      },
      maximum_age: {
        number,
        greaterThan: greaterThan('minimum_age')
      },
      purchaser_limit: {
        number,
        greaterThan: greaterThan(0)
      }
    }
  }
}
</script>
