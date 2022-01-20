/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('feespayable', {
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
    receiver: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    paymeans: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    paymeansname: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    amount: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    salesuuid: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    salestxhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    type: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true,
      comment: '0: author royalty , 1 : referer'
    },
    typestr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'feespayable'
  });
};
