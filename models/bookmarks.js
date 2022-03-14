/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('bookmarks', {
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
    objectclass: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    objectid: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    countfavors: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'bookmarks'
  });
};
