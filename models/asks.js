/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('asks', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
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
    tokenid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    expiry: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    bidprice: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    bidamount: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    paymenttoken: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'token address'
    },
    nettype: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    netid: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'notation is mixed in hex and decimal'
    }
  }, {
    sequelize,
    tableName: 'asks'
  });
};
