<template>
  <div>
    <div>
      <p>
        <strong>Date:</strong> {{ event.date | longDate }}</p>
      <p>
        <strong>Registration Fee:</strong> ${{ event.price }}</p>
      <p>
        <strong>Registration Open:</strong> {{ event.registration_open | longDate }}</p>
      <p>
        <strong>Registration Close:</strong> {{ event.registration_close | longDate }}</p>
    </div>
    <br>
    <h5 class="title is-5">Merit Badges offered at this event:</h5>
    <div v-if="orderedOfferings.length > 0"
         class="offering-list">
      <div v-for="offering in orderedOfferings"
           :key="offering.id">
        {{ offering.name }}
        <span v-if="offering.details.price !== '0.00'">
          ({{ offering.details.price | currency }})
        </span>
      </div>
    </div>
    <div v-else>
      No badges are listed as available at this event.
      <span v-if="isAdmin">
        Offer badges for this event at the
        <router-link to="/administration/events/offerings">offerings page</router-link>.
      </span>
      <span v-if="!isAdmin">
        Please check with the event coordinators if you feel this is not correct.
      </span>
    </div>
    <br>
    <h5 class="title is-5">Items available for purchase:</h5>
    <div v-if="event.purchasables && event.purchasables.length > 0">
      <div v-for="purchasable in event.purchasables"
           :key="purchasable.id"
           :class="purchasable.id"
           class="purchasable-item">
        <b>{{ purchasable.item }}</b> ({{ purchasable.price | currency}})
        <span v-if="purchasable.description">{{ purchasable.description}}</span>
        <span v-if="purchasable.minimum_age || purchasable.maximum_age">
          <br>
          <i>
            This item is restricted to {{ ageText(purchasable.minimum_age, purchasable.maximum_age) }}
          </i>
        </span>
        <span v-if="purchasable.purchaser_limit">
          <br>
          <i>
            This item is restricted to {{ purchasable.purchaser_limit }} buyers
          </i>
        </span>
      </div>
    </div>
    <div v-else>
      No items are available for purchase at this event.
      <span v-if="isAdmin">
        Add items for purchase at the
        <router-link to="/administration/events/purchasables">purchasables page</router-link>.
      </span>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';

export default {
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters(['isAdmin']),
    orderedOfferings() {
      return _.orderBy(this.event.offerings, 'name');
    }
  },
  methods: {
    ageText(min, max) {
      if (min && max) {
        return 'ages ' + min + ' to ' + max;
      } else if (min) {
        return 'ages greater than ' + min;
      } else {
        return 'ages less than ' + max;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.purchasable-item {
  padding-bottom: 1rem;
}

@media screen and (min-width: 700px) {
  .offering-list {
    columns: 3;
  }
}

@media screen and (max-width: 699px) and (min-width: 500px) {
  .offering-list {
    columns: 2;
  }
}

@media screen and (max-width: 499) {
  .offering-list {
    columns: 1;
  }
}
</style>
