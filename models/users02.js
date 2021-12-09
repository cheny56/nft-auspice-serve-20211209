/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users02', {
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
    countsales: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    countbuys: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    sumsales: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "0"
    },
    sumsalesfloat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    maxstrikeprice: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "0"
    },
    maxstrikepricefloat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    sumbuys: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "0"
    },
    sumbuysfloat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    nickname: {
      type: DataTypes.STRING(60),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users02'
  });
};
