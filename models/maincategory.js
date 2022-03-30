/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('maincategory', {
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
    active: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 1
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    displayorder: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    code: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    visible: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'maincategory'
  });
};
