/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('logfeepayouts', {
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
    contract: {
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
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    receiverrolestr: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'author==creator , referer'
    },
    receiverrole: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      comment: '0 : author , 1 : referer'
    }
  }, {
    sequelize,
    tableName: 'logfeepayouts'
  });
};
