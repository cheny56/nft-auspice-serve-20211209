/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bundlehasitems', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true
    },
    bundleid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      comment: 'bundle id'
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    bundleuuid: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'bundlehasitems'
  });
};
