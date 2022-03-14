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
    },
    tokenid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    hidden: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    visible: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: 1
    },
    decimals: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    nickname: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'itembalances'
  });

  // itembalances.associate = function (models) {
  //   itembalances.hasOne(models.items, {foreignKey: 'item_id', sourceKey:'itemid'})
  // };
};
