var _ = require('lodash');

module.exports = {
  combineCompletionsAndReqs: function (requirements, completions) {
    var newCompletions = _.reduce(requirements, function (result, requirement) {
      result[requirement] = false;
      return result;
    }, {});

    _.forEach(completions, function (completion, requirement) {
      if (completion) {
        newCompletions[requirement] = completion;
      }
    });

    return newCompletions
  }
}