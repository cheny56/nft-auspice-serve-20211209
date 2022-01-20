/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bids', {
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
    saleid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    iteminstanceid: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    seller: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    bidder: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    priceunit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'ETH-ROPSTEN, KLAYTN-MAINNET'
    }
  }, {
    sequelize,
    tableName: 'bids'
  });
};
