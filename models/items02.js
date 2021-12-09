/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('items02', {
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
    itemid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    market: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    filesize: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    imagewidth: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    imageheight: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'items02'
  });
};
