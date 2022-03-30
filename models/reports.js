/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reports', {
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
    code: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    reporter: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    reportee: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'reports'
  });
};
