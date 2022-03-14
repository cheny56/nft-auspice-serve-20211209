/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items03', {
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
      type: DataTypes.STRING(80),
      allowNull: true
    },
    maxsaleprice: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "0"
    },
    minsaleprice: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "1000000"
    },
    cumulsaleamount: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "0"
    },
    cumulsalecount: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    cumulsalepayments: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    countholders: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    salestatus1: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    salestatus2: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    salestatus4: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    salestatus8: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'items03'
  });
};
