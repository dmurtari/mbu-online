var _ = require('lodash');

module.exports = {
  durationValidator: function (periods, duration) {
    if (duration == 2) {
      return _.isEqual(periods.sort(), [2, 3]);
    }

    if (duration == 3) {
      return _.isEqual(periods.sort(), [1, 2, 3]);
    }

    return true;
  }
};
