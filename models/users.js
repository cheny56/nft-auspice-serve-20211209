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
    },
    uuid: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    iscreator: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    countowned: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    countcreated: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    address: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    emailverified: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    profileimagesrc: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    backgroundimgsrc: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    profileimagefilename: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    agreereceivepromo: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    emailverifiedtimeunix: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    icanmint: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    payGas: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    storename: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'users'
  });
};
