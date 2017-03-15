var _ = require('lodash');
var faker = require('faker');

module.exports = function (count) {
  return _.times(count, function () {
    return {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      birthday: faker.date.between(new Date(1998, 12, 12), new Date(2002, 12, 12)),
      troop: faker.random.number(),
      notes: faker.lorem.sentence(),
      emergency_name: faker.name.findName(),
      emergency_relation: faker.name.jobTitle(),
      emergency_phone: faker.phone.phoneNumber()
    };
  });
};
