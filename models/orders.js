/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
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
    matcher_contract: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'address of contract which will execute matching process'
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    asset_contract_offer: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    asset_id_offer: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    asset_amount_offer: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    asset_contract_ask: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    asset_id_ask: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    asset_amount_ask: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    makerortaker: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(80),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'orders'
  });
};
