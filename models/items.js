/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {

 

  
  const items = sequelize.define('items', {
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
      allowNull: true,
      unique: true
    },
    is1copyonly: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    countcopies: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    countsplitshares: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    owner: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    author: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    authorfee: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      comment: 'authorfee unit is in basis point==10**4'
    },
    countfavors: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    type: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      comment: '1: single copy, 2: multi copy , 3: split shares'
    },
    typestr: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    tokenid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    decimals: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 0
    },
    totalsupply: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    categorystr: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    metadata: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    metadataurl: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    ismetadataalterable: {
      type: DataTypes.INTEGER(3).UNSIGNED,
      allowNull: true
    },
    titlename: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: -1
    },
    uploader: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    isminted: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    price: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    priceunit: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    keywords: {
      type: DataTypes.STRING(400),
      allowNull: true
    },
    originator: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    contract: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    nettype: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    originatorfeeinbp: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true
    },
    market: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    normprice: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    countviews: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    active: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    isreviewed: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    nickname: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    isfeatured: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    countbookmarks: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: 0
    },
    txhash: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    salestatusstr: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    salestatus: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 1
    },
    salestatus1: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    salestatus2: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    salestatus4: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    salestatus8: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: 0
    },
    pricemin: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    pricemax: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'items'
  });

  // items.associate = function (models) {
  //   items.belongsTo(models.itembalances, {foreignKey: 'item_id', sourceKey: 'itemid'});
  // };

  return items;
};
