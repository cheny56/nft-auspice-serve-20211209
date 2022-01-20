/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logsales', {
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
    market: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    type: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      comment: '0: fixed price-seller approve, 1: fixed price-bid to take, 2: auction'
    },
    typestr: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    expiry: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ownerserialnumber: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    offerpricechar: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    offerpriceint: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    offerpricefloat: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    bidpricechar: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    bidpriceint: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    bidpricefloat: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    bidder: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    paymeans: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    paymeansname: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    expirychar: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    ispaymeanstoken: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    priceunit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    seller: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    buyer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    saleopentxhash: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    endedat: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    contract: {
      type: DataTypes.STRING(60),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'logsales'
  });
};
