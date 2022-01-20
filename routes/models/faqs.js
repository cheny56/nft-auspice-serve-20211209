/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('faqs', {
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
      type: DataTypes.STRING(20),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    contentbody: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    writer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    countviews: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'faqs'
  });
};
