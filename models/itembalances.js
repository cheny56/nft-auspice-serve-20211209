/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('itembalances', {
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
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    avail: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    locked: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'itembalances'
  });
};
