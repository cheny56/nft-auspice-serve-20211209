
'use strict'
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename) // const env = 'production' // 'developmentDesktop20191004' //  //   // process.env.NODE_ENV ||  
const env = process.env.NODE_ENV || 'development' //test 'developmentpc' //  // 'development'// 'production' // 
const config = require( '../configs/dbconfig.json')[env];// ./apiServe // __dirname + 
// let config
const db = {};

// {"host": "localhost",
// "username": "nftauspice",
// "password": "JYPhsa2bYdGhcmPgkqB7",
// "database":"nftauspice",
// "dialect": "mariadb",
// "port": "37375"}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], { 
    host: process.env.MARIA_HOST, 
    username: process.env.MARIA_USERNAME, 
    password: process.env.MARIA_PASSWORD,
    database: process.env.MARIA_DB,
    dialect: process.env.MARIA_DIALECT,
    port: process.env.MARIA_PORT, 
    logging: false}    )
} else {
	sequelize = new Sequelize(config.database, config.username, config.password, {
    host: process.env.MARIA_HOST, 
    username: process.env.MARIA_USERNAME, 
    password: process.env.MARIA_PASSWORD,
    database: process.env.MARIA_DB,
    dialect: process.env.MARIA_DIALECT,
    port: process.env.MARIA_PORT	
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

db['users'].belongsTo(db['transactions'], {foreignKey: 'username', targetKey: 'seller'})
db['transactions'].hasOne(db['users'], {as:'seller_info', foreignKey: 'username', sourceKey:'seller'})

db['users'].belongsTo(db['transactions'], {foreignKey: 'username', targetKey: 'buyer'})
db['transactions'].hasOne(db['users'], {as:'buyer_info', foreignKey: 'username', sourceKey:'buyer'})

db['items'].belongsTo(db['transactions'], {foreignKey: 'itemid', targetKey: 'itemid'})
db['transactions'].hasOne(db['items'], {as:'item_info', foreignKey: 'itemid', sourceKey:'itemid'})


db['users'].belongsTo(db['reports'], {foreignKey: 'username', targetKey: 'reporter'})
db['reports'].hasOne(db['users'], {as:'reporter_info', foreignKey: 'username', sourceKey:'reporter'})

db['users'].belongsTo(db['reports'], {foreignKey: 'username', targetKey: 'reportee'})
db['reports'].hasOne(db['users'], {as:'reportee_info', foreignKey: 'username', sourceKey:'reportee'})

db['items'].belongsTo(db['reports'], {foreignKey: 'itemid', targetKey: 'itemid'})
db['reports'].hasOne(db['items'], {as:'item_info', foreignKey: 'itemid', sourceKey:'itemid'})

db['faqcategories'].belongsTo(db['faq'], {foreignKey: 'id', targetKey: 'category'})
db['faq'].hasOne(db['faqcategories'], {as:'category_info', foreignKey: 'id', sourceKey:'category'})

// db['mainitemss'].belongsTo(db['users'], {foreignKey: 'address', sourceKey: 'itemid'})
// db['users'].hasOne(db['mainitemss'], {as:'user', foreignKey: 'address', targeyKey: 'itemid'})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

