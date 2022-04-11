/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reportcategory', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp')
    },
    name: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    code: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    visible: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reportcategory'
  });
};
