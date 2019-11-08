import _ from 'lodash';

import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      classesLoading: false,
      classLoadError: ''
    };
  },
  computed: {
    ...mapGetters(['eventClasses'])
  },
  methods: {
    sizeInfoForOffering(eventId, offeringId) {
      const classes = this.classesForEvent(eventId);
      const classInfo = _.find(classes, { offering_id: offeringId }) || {};
      return classInfo.sizeInfo;
    },
    classesForEvent(eventId) {
      return this.eventClasses[eventId] || [];
    },
    hasClassInfoForEvent(eventId) {
      const classes = this.classesForEvent(eventId);
      return classes && classes.length > 0 && classes[0].sizeInfo;
    },
    loadClasses(eventId) {
      this.classesLoading = true;

      this.$store
        .dispatch('getClasses', eventId)
        .then(classes => {
          return this.getSizesForBadges(
            eventId,
            _.map(classes, 'badge.badge_id')
          );
        })
        .then(() => {
          this.classLoadError = '';
        })
        .catch(() => {
          this.classLoadError = 'Failed to get classes for this event';
        })
        .then(() => {
          this.classesLoading = false;
        });
    },
    getSizesForBadges(eventId, badgeIds) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('getClassSizes', {
          eventId: eventId,
          badgeIds: badgeIds
        })
        .then(() => resolve())
        .catch(() => reject());
      });
    }
  }
};
