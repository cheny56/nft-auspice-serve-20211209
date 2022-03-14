/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sales', {
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
    seller: {
      type: DataTypes.STRING(80),
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
    expiryunix: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    expiry: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: '판매만기일 - YYYY-MM-DDTHH:mm:ss'
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true,
      comment: 'single,bundle,spot,english,dutch'
    },
    type: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      comment: '1)COMMON 2)AUCTION 3)auction-dutch'
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    offerprice: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    priceunit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    mode: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: '0:public,1:private'
    },
    isprivate: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    privateaddress: {
      type: DataTypes.STRING(80),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sales'
  });
};
