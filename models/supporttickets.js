/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('supporttickets', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp')
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp')
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    pic: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    answer: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    lang: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'supporttickets'
  });
};
