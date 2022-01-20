/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('adminfees', {
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
    useraction: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'user actions which are charged'
    },
    feerate: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      comment: 'unit is in basis point'
    },
    writer: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: '해당 행 기록 혹은 업데이트한 관리자'
    }
  }, {
    sequelize,
    tableName: 'adminfees'
  });
};
