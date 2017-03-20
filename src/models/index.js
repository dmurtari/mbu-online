var Sequelize = require('sequelize');

var env = process.env.NODE_ENV || 'development';
var db = {};

var sequelize;

// Configuration for Environments
if (env === 'development') {
  sequelize = new Sequelize('postgres://mbu:@localhost/mbu');
} else if (env === 'test') {
  sequelize = new Sequelize('postgres://mbu:@localhost/mbutest', {
    logging: false
  });
}

sequelize.authenticate()
  .then(function () {
    console.log('Successfully connected to database');
  })
  .catch(function (err) {
    console.error('Failed to connect to database', err);
  });

var Assignment = sequelize.import('./assignment');
var Badge = sequelize.import('./badge');
var CurrentEvent = sequelize.import('./currentEvent');
var Event = sequelize.import('./event');
var Offering = sequelize.import('./offering');
var Preference = sequelize.import('./preference');
var Purchasable = sequelize.import('./purchasable');
var Purchase = sequelize.import('./purchase');
var Registration = sequelize.import('./registration');
var Scout = sequelize.import('./scout');
var User = sequelize.import('./user');

// User/Scout relationship
User.hasMany(Scout, {
  as: 'scouts',
  foreignKey: 'user_id'
});

Scout.belongsTo(User, { as: 'user' });

// Current Event
CurrentEvent.belongsTo(Event, {
  foreignKey: 'event_id'
});

// Event/Purchasable relationship
Event.hasMany(Purchasable, {
  as: 'purchasables'
});

// Scout/Event relationship.
Scout.belongsToMany(Event, {
  through: Registration,
  as: 'registrations',
  foreignKey: 'scout_id'
});

Event.belongsToMany(Scout, {
  through: Registration,
  as: 'attendees',
  foreignKey: 'event_id'
});

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
db.User = User;
db.Offering = Offering;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
