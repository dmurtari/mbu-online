var Models = require('../../models');

module.exports = {
  'preferences': {
    model: Models.Offering,
    attributes: ['rank']

  },
  'assignments': {
    model: Models.Offering,
    attributes: ['periods']
  },
  'purchases': {
    model: Models.Purchasable,
    attributes: ['quantity', 'size']
  }
};
