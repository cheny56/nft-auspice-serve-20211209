/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('loghandovers', {
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
    from_: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    to_: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    merchandiseid: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'bundle uuid'
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'loghandovers'
  });
};
