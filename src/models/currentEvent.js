module.exports = function (sequelize) {
  var CurrentEvent = sequelize.define('CurrentEvent', {}, {
    underscored: true,
    freezeTableName: true,
    tableName: 'CurrentEvent'
  });

  return CurrentEvent;
};
