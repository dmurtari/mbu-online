import _ from 'lodash';

export default {
  props: {
    registration: {
      type: Object,
      required: true
    },
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    assignments() { return this.registration.assignments },
    assignmentList() {
      let result = [null, null, null];

      _.forEach(this.registration.assignments, (assignment) => {
        return _.forEach(assignment.details.periods, (period) => {
          result[Number(period) - 1] = assignment;
        });
      });

      return result;
    },
    scout() { return this.registration.scout },
    preferences() {
      return _.orderBy(this.registration.preferences, ['details.rank']);
    },
    purchases() { return this.registration.purchases },
    registrationAssignments() {
      return _.map(_.omitBy(this.assignmentList, _.isNil), (assignment) => {
        return {
          name: assignment.badge.name,
          price: assignment.price,
          periods: assignment.details.periods
        }
      });
    },
    registrationPreferences() {
      return _.map(this.preferences, (preference) => {
        return {
          name: preference.badge.name,
          price: preference.price
        };
      });
    },
    registrationPurchases() {
      return _.map(this.purchases, (purchase) => {
        return {
          price: purchase.price,
          size: purchase.details.size,
          item: purchase.item,
          quantity: purchase.details.quantity,
          id: purchase.id
        };
      });
    }
  }
}
