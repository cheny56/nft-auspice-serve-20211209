/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('useronchain', {
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
    proxycontract: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    createunixtime: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'useronchain'
  });
};
