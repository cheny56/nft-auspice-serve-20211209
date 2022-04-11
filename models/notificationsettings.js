/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('notificationsettings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    sales: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    newbid: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    expire: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    exceed: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    referral: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    klay: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    usd: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'notificationsettings'
  });
};
