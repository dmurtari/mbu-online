var Model = require('../index');

module.exports = {
  attributes: {
    include: [['id', 'registration_id'], 'created_at', 'updated_at', 'scout_id', 'event_id'],
    exclude: ['projectedCost', 'actualCost']
  },
  include: [{
    model: Model.Scout,
    as: 'scout',
    attributes: [['id', 'scout_id'], 'firstname', 'lastname', 'troop', 'notes']
  }, {
    model: Model.Offering,
    as: 'preferences',
    attributes: [['id', 'offering_id'], 'duration', 'periods', 'price'],
    through: {
      as: 'details',
      attributes: ['rank']
    },
    include: [{
      model: Model.Badge,
      as: 'badge',
      attributes: ['name']
    }]
  }, {
    model: Model.Offering,
    as: 'assignments',
    attributes: [['id', 'offering_id'], 'price'],
    through: {
      as: 'details',
      attributes: ['periods', 'completions']
    },
    include: [{
      model: Model.Badge,
      as: 'badge',
      attributes: ['name']
    }]
  }, {
    model: Model.Purchasable,
    as: 'purchases',
    attributes: [['id', 'purchasable_id'], 'item', 'price'],
    through: {
      as: 'details',
      attributes: ['size', 'quantity']
    },
  }]
};