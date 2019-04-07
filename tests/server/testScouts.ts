import faker from 'faker';
import { times } from 'lodash';

export default (count: number) => times(count, () => ({
    firstname: faker.name.firstName(),
    lastname: faker.name.lastName(),
    birthday: faker.date.between(new Date(1998, 12, 12), new Date(2002, 12, 12)),
    troop: faker.random.number(),
    notes: faker.lorem.sentence(),
    emergency_name: faker.name.findName(),
    emergency_relation: faker.name.jobTitle(),
    emergency_phone: faker.phone.phoneNumber()
}));

