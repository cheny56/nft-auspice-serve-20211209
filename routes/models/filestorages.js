/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('filestorages', {
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
    rawfileurl: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    rawfileurl01: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    rawfileipfs: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    rawfileipfs01: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    rawfiles3: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    rawfiles301: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    metadataurl: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    metadataurl01: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    metadataipfs: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    metadataipfs01: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    metadatas3: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    thumb00: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    thumb01: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: '2nd smallest thumbnail'
    },
    thumb02: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: 'midsize thumbnail'
    },
    thumb03: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    thumb04: {
      type: DataTypes.STRING(1000),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'filestorages'
  });
};
