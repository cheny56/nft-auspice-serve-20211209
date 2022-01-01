/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
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
    nickname: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pw: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    pwhash: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'hash'
    },
    level: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: '사용자권한레벨'
    },
    profileimageurl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    coverimageurl: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users'
  });
};
