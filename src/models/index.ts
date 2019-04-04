import { Sequelize } from 'sequelize';
import { User } from './user';

const Assignment = sequelize.import('./assignment');
const Badge = sequelize.import('./badge');
const CurrentEvent = sequelize.import('./currentEvent');
const Event = sequelize.import('./event');
const Offering = sequelize.import('./offering');
const Preference = sequelize.import('./preference');
const Purchasable = sequelize.import('./purchasable');
const Purchase = sequelize.import('./purchase');
const Registration = sequelize.import('./registration');
const Scout = sequelize.import('./scout');
const UserModel = sequelize.import<User>('./user');

// Event/Badge relationship
Badge.belongsToMany(Event, {
    through: Offering,
    as: 'availability',
    foreignKey: 'badge_id'
});

Event.belongsToMany(Badge, {
    through: Offering,
    as: 'offerings',
    foreignKey: 'event_id'
});

Registration.belongsTo(Scout, { as: 'scout' });
Offering.belongsTo(Badge, { as: 'badge' });
Purchasable.hasMany(Purchase, { as: 'sold' });

// Registration/Offering relationship as preference or requester
Offering.belongsToMany(Registration, {
    through: Preference,
    as: 'requesters',
    foreignKey: 'offering_id'
});

Registration.belongsToMany(Offering, {
    through: Preference,
    as: 'preferences',
    foreignKey: 'registration_id'
});

// Registration/Offering relationship as assignment or assignee
Offering.belongsToMany(Registration, {
    through: Assignment,
    as: 'assignees',
    foreignKey: 'offering_id'
});

Registration.belongsToMany(Offering, {
    through: Assignment,
    as: 'assignments',
    foreignKey: 'registration_id'
});

// Registration/Purchasable relationship as purchase or buyer
Purchasable.belongsToMany(Registration, {
    through: Purchase,
    // unique: false,
    as: 'buyers',
    foreignKey: 'purchasable_id'
});

Registration.belongsToMany(Purchasable, {
    through: Purchase,
    // unique: false,
    as: 'purchases',
    foreignKey: 'registration_id'
});

db.Assignment = Assignment;
db.Badge = Badge;
db.Event = Event;
db.CurrentEvent = CurrentEvent;
db.Preference = Preference;
db.Purchasable = Purchasable;
db.Purchase = Purchase;
db.Registration = Registration;
db.Scout = Scout;
db.User = UserModel;
db.Offering = Offering;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
