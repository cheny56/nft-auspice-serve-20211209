/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('categories', {
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
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    writer: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    group_: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    textdisp: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    visible: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'categories'
  });
};
