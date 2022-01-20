/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('emailverifycode', {
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
    emailaddress: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastupdate: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'emailverifycode'
  });
};
