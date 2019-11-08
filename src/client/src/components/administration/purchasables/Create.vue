<template>
  <div class="box">
    <h4 class="title is-4">Add a New Item</h4>
    <p>
      Add a new purchasable item for this event by filling out the form below. The name
      and price of the item are required.
    </p>
    <br>
    <div class="notification is-danger"
         v-if="error">
      <p>
        {{ error }}
      </p>
    </div>
    <form>
      <div class="columns is-multiline">
        <div class="field column is-6">
          <label class="label"
                 for="purchasable-create-item">Item Name</label>
          <div class="control">
            <input type="text"
                   class="input"
                   id="purchasable-create-item"
                   placeholder="New Item"
                   :class="{ 'is-danger': $v.purchasable.item.$error }"
                   @blur="$v.purchasable.item.$touch"
                   v-model="purchasable.item">
          </div>
          <span class="help is-danger"
                v-if="$v.purchasable.item.$error">
            Please enter the name of the item
          </span>
        </div>
        <div class="field column is-6">
          <label class="label"
                 for="purchasable-create-price">Price</label>
          <div class="control">
            <input type="text"
                   class="input"
                   placeholder="10.00"
                   id="purchasable-create-price"
                   :class="{ 'is-danger': $v.purchasable.price.$error }"
                   @blur="$v.purchasable.price.$touch"
                   v-model="purchasable.price">
          </div>
          <span class="help is-danger"
                v-if="$v.purchasable.price.$error">
            Please enter the price of the item
          </span>
        </div>
        <div class="field column is-12">
          <label class="label"
                 for="purchasable-create-description">Description</label>
          <div class="control">
            <textarea class="textarea"
                      id="purchasable-create-description"
                      rows="2"
                      placeholder="Description of this item"
                      v-model="purchasable.description"></textarea>
          </div>
        </div>
        <div class="field column is-6">
          <div class="control">
            <label class="checkbox">
              <input v-model="hasAgeRestriction"
                     type="checkbox"> This item is age restricted
            </label>
          </div>
        </div>
        <div class="field column is-6">
          <div class="control">
            <label class="checkbox">
              <input v-model="purchasable.has_size"
                     type="checkbox"> Allow scouts to select a size
            </label>
          </div>
        </div>
        <template v-if="hasAgeRestriction">
          <div class="field column is-6">
            <label class="label"
                   for="purchasable-min-age">Minimum Age (If Any)</label>
            <div class="control">
              <input type="number"
                     class="input"
                     id="purchasable-min-age"
                     :class="{ 'is-danger': $v.purchasable.minimum_age.$error }"
                     @blur="$v.purchasable.minimum_age.$touch"
                     v-model="purchasable.minimum_age">
            </div>
            <span class="help is-danger"
                  v-if="!$v.purchasable.minimum_age.number">
              Minimum age must be a number
            </span>
            <span class="help is-danger"
                  v-if="!$v.purchasable.minimum_age.lessThan">
              Minimum age must be less than maximum age
            </span>
          </div>
          <div class="field column is-6">
            <label class="label"
                   for="purchasable-max-age">Maximum Age (If Any)</label>
            <div class="control">
              <input type="number"
                     class="input"
                     id="purchasable-max-age"
                     :class="{ 'is-danger': $v.purchasable.maximum_age.$error }"
                     @blur="$v.purchasable.maximum_age.$touch"
                     v-model="purchasable.maximum_age">
            </div>
            <span class="help is-danger"
                  v-if="!$v.purchasable.maximum_age.number">
              Maximum age must be a number
            </span>
            <span class="help is-danger"
                  v-if="!$v.purchasable.maximum_age.greaterThan">
              Maximum age must be greater than minimum age
            </span>
          </div>
        </template>
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
                   :class="{ 'is-danger': $v.purchasable.purchaser_limit.$error }"
                   @blur="$v.purchasable.purchaser_limit.$touch"
                   v-model="purchasable.purchaser_limit">
          </div>
          <span class="help is-danger"
                v-if="!$v.purchasable.purchaser_limit.number">
            Purchase limit must be a number
          </span>
          <span class="help is-danger"
                v-if="!$v.purchasable.purchaser_limit.greaterThan">
            Purchase limit must be greater than 0
          </span>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary"
                  :disabled="$v.$invalid || creating"
                  :class="{ 'is-loading': creating }"
                  @click.prevent="createPurchasable()">Create Item</button>
        </div>
        <div class="control">
          <button class="button"
                  :disabled="creating"
                  @click.prevent="close()">Cancel</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { lessThan, greaterThan, number } from 'validators';
import _ from 'lodash';

export default {
  props: {
    eventId: { required: true }
  },
  data() {
    return {
      creating: false,
      error: '',
      hasAgeRestriction: false,
      hasPurchaseLimit: false,
      purchasable: {
        item: '',
        description: '',
        price: '',
        has_size: false,
        maximum_age: '',
        minimum_age: '',
        purchaser_limit: undefined
      }
    };
  },
  methods: {
    createPurchasable() {
      this.creating = true;

      let purchasable = _.clone(this.purchasable);
      purchasable.maximum_age = this.purchasable.maximum_age ?
        this.purchasable.maximum_age : null;
      purchasable.minimum_age = this.purchasable.minimum_age ?
        this.purchasable.minimum_age : null;

      this.$store.dispatch('createPurchasable', {
        eventId: this.eventId,
        purchasable: purchasable
      })
        .then(() => {
          this.error = '';
          this.close();
        })
        .catch(() => {
          this.error = 'Failed to create item. Please refresh and try again.';
        })
        .then(() => {
          this.creating = false;
        });
    },
    close() {
      this.$emit('close');
    }
  },
  validations: {
    purchasable: {
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
