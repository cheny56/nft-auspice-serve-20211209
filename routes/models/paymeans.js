/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paymeans', {
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
    address: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    symbol: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    decimals: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'ETH-ROPSTEN, KLAYTN-MAINNET'
    },
    isprimary: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'paymeans'
  });
};
