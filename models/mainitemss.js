/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mainitemss', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp')
    },
    code: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    displayorder: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    description: {
      type: 'TINYTEXT',
      allowNull: true
    },
    imgurl: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'mainitemss'
  });
};
