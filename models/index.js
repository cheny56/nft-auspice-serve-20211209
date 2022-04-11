
'use strict'
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename) // const env = 'production' // 'developmentDesktop20191004' //  //   // process.env.NODE_ENV ||  
const env = process.env.NODE_ENV || 'development' //test 'developmentpc' //  // 'development'// 'production' // 
const config = require( '../configs/dbconfig.json')[env];// ./apiServe // __dirname + 
// let config
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], { ... config ,   logging: false}    )
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, {... config
		, dialect: 'mariadb'
		, port : '37375'
		,	dialectOptions: {			timezone: 'Etc/GMT-9'		},		define: {			timestamps: false		},  logging: false	}
//	,	define: {timestamps: false}
	)
}
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db['mainitemss'].belongsTo(db['maincategory'], {foreignKey: 'code', targeyKey: 'code'})
db['maincategory'].hasMany(db['mainitemss'], {as: 'itemsss',foreignKey: 'code', sourceKey: 'code'})

db['users'].belongsTo(db['mainitemss'], {foreignKey: 'username'})
db['mainitemss'].hasOne(db['users'], {as:'user', foreignKey: 'username', sourceKey: 'username'})

db['items'].belongsTo(db['mainitemss'], {foreignKey: 'itemid'})
db['mainitemss'].hasOne(db['items'], {as:'item', foreignKey: 'itemid', sourceKey: 'itemid'})

db['users'].belongsTo(db['items'], {foreignKey: 'username', targetKey: 'author'})
db['items'].hasOne(db['users'], {as:'author_info', foreignKey: 'username', sourceKey:'author'})

db['items'].belongsTo(db['users'], {foreignKey: 'author', targetKey: 'username'})
db['users'].hasMany(db['items'], {as:'owned_items', foreignKey: 'author', sourceKey:'username'})


db['users'].belongsTo(db['transactions'], {foreignKey: 'username', targetKey: 'seller'})
db['transactions'].hasOne(db['users'], {as:'seller_info', foreignKey: 'username', sourceKey:'seller'})

db['users'].belongsTo(db['transactions'], {foreignKey: 'username', targetKey: 'buyer'})
db['transactions'].hasOne(db['users'], {as:'buyer_info', foreignKey: 'username', sourceKey:'buyer'})

db['items'].belongsTo(db['transactions'], {foreignKey: 'itemid', targetKey: 'itemid'})
db['transactions'].hasOne(db['items'], {as:'item_info', foreignKey: 'itemid', sourceKey:'itemid'})

//REPORT
db['users'].belongsTo(db['reports'], {foreignKey: 'username', targetKey: 'reporter'});
db['reports'].hasOne(db['users'], {as:'reporter_info', foreignKey: 'username', sourceKey:'reporter'});

db['users'].belongsTo(db['reports'], {foreignKey: 'username', targetKey: 'reportee'});
db['reports'].hasOne(db['users'], {as:'reportee_info', foreignKey: 'username', sourceKey:'reportee'});

db['items'].belongsTo(db['reports'], {foreignKey: 'itemid', targetKey: 'itemid'});
db['reports'].hasOne(db['items'], {as:'item_info', foreignKey: 'itemid', sourceKey:'itemid'});
//REPORT

db['faqcategories'].belongsTo(db['faq'], {foreignKey: 'id', targetKey: 'category'})
db['faq'].hasOne(db['faqcategories'], {as:'category_info', foreignKey: 'id', sourceKey:'category'})

db['users'].belongsTo(db['supporttickets'], {foreignKey: 'username', targetKey:'username'});
db['supporttickets'].hasOne(db['users'], {as: 'requester_info', foreignKey:'username', sourceKey:'username'})

//LOG ORDERS
db['users'].belongsTo(db['logorders'], {foreignKey: 'username', targetKey: 'buyer'});
db['logorders'].hasOne(db['users'], {as:'buyer_logorder_info', foreignKey: 'username', sourceKey:'buyer'});

db['users'].belongsTo(db['logorders'], {foreignKey: 'username', targetKey: 'seller'});
db['logorders'].hasOne(db['users'], {as:'seller_logorder_info', foreignKey: 'username', sourceKey:'seller'});

db['items'].belongsTo(db['logorders'], {foreignKey: 'itemid', targetKey: 'itemid'});
db['logorders'].hasOne(db['items'], {as:'item_logorder_info', foreignKey: 'itemid', sourceKey:'itemid'});
//LOG ORDERS

//ITEM BALANCES
db['users'].belongsTo(db['itembalances'], {foreignKey: 'username', targetKey:'username'})
db['itembalances'].hasOne(db['users'], {as: 'owner_info', foreignKey: 'username', sourceKey:'username'})

db['items'].belongsTo(db['itembalances'], {foreignKey: 'itemid', targetKey:'itemid'})
db['itembalances'].hasOne(db['items'], {as: 'balance_item_info', foreignKey: 'itemid', sourceKey:'itemid'})

//FAVORITES
db['users'].belongsTo(db['logfavorites'], {foreignKey: 'username', targetKey:'username'})
db['logfavorites'].hasOne(db['users'], {as: 'liker_info', foreignKey: 'username', sourceKey:'username'})

db['items'].belongsTo(db['logfavorites'], {foreignKey: 'itemid', targetKey:'itemid'})
db['logfavorites'].hasOne(db['items'], {as: 'liked_item_info', foreignKey: 'itemid', sourceKey:'itemid'})

//feepayout
db['items'].belongsTo(db['logfeepayouts'], {foreignKey: 'itemid', targetKey:'itemid'})
db['logfeepayouts'].hasOne(db['items'], {as: 'fee_item_info', foreignKey: 'itemid', sourceKey:'itemid'})

db['logorders'].belongsTo(db['logfeepayouts'], {foreignKey: 'closingtxhash', targetKey:'txhash'})
db['logfeepayouts'].hasOne(db['logorders'], {as: 'feed_order', foreignKey: 'closingtxhash', sourceKey:'txhash'})

db['items'].belongsTo(db['pushalarm'], {foreignKey: 'itemid', targetKey:'itemid'})
db['pushalarm'].hasOne(db['items'], {as: 'push_item', foreignKey: 'itemid', sourceKey:'itemid'})



db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

