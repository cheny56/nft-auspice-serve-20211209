/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items', {
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
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    is1copyonly: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    countcopies: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    countsplitshares: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    owner: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    author: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    authorfee: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      comment: 'authorfee unit is in basis point==10**4'
    },
    countfavors: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    type: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      comment: '1: single copy, 2: multi copy , 3: split shares'
    },
    typestr: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'items'
  });
};
