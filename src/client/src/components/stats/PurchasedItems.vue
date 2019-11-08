<template>
  <div>
    <ul>
      <li v-for="(purchases, item) in groupedPurchases"
          :key="item">
        <span v-if="purchases.hasSize">
          <b>{{ item }}:</b>
          <ul class="subtotal">
            <li v-for="size in sizes"
                :key="size">
              <b class="uppercase">{{ size }}:</b>
              <span v-if="purchases.items[size]">
                {{ totalDue(purchases.items[size]) | currency }}
                ({{ totalQuantity(purchases.items[size]) }} &times;
                {{ purchases.items[size][0].price | currency }})
              </span>
              <span v-else>
                No purchases
              </span>
            </li>
          </ul>
        </span>
        <span v-else>
          <b>{{ item }}:</b>
          {{ totalDue(purchases) | currency }}
          ({{ totalQuantity(purchases) }} &times; {{ purchases[0].price | currency }})
        </span>
      </li>
    </ul>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  props: {
    registrations: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      sizes: ['xs', 's', 'm', 'l', 'xl']
    };
  },
  computed: {
    purchases () {
      return _.chain(this.registrations)
        .map('purchases')
        .flatten()
        .groupBy('item')
        .value();
    },
    groupedPurchases () {
      let groupedItems = _.cloneDeep(this.purchases);

      _.forEach(this.purchases, (items, key) => {
        if (items[0].has_size) {
          groupedItems[key] = {
            hasSize: true,
            items: []
          };

          let result = _.chain(items)
            .groupBy('details.size')
            .value();
          groupedItems[key].items = result;
        }
      });

      return groupedItems;
    }
  },
  methods: {
    totalDue (purchases) {
      return _.reduce(purchases, (sum, item) => {
        return sum += (Number(item.price) * Number(item.details.quantity));
      }, 0);
    },
    totalQuantity (purchases) {
      return _.reduce(purchases, (sum, item) => {
        return sum += Number(item.details.quantity)
      }, 0);
    }
  }
}
</script>

<style lang="scss">
.subtotal {
  padding-left: 1rem;
}
</style>
